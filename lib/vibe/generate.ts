import { getReviewsByListingId, getLocalAreaDataByArea, getTrustResult } from '@/lib/data';
import { invokeSageMakerTrustModel } from '../aws/sagemaker';
import { getAwsConfig } from '../aws/config';

const FALLBACK_VIBES: Record<string, { summary: string; confidence: number }> = {
  'Santa Monica': { summary: 'Beachside charm with lively pier, moderate noise, family-friendly days.', confidence: 85 },
  'Downtown LA': { summary: 'Urban energy, vibrant nightlife, noisy weekends, limited beach access.', confidence: 85 },
  'Pasadena': { summary: 'Quiet residential area, family-oriented, far from beach, low nightlife.', confidence: 85 }
};

export function getFastVibe(area: string, reviewCount: number): { vibeSummary: string; vibeConfidence: number } {
  const fallback = FALLBACK_VIBES[area] || { summary: 'Vibrant neighborhood with local character.', confidence: 70 };
  let confidence = fallback.confidence;
  if (reviewCount === 0) confidence = 40;
  else if (reviewCount < 2) confidence = 60;
  return { vibeSummary: fallback.summary, vibeConfidence: confidence };
}

export async function generateVibe(listingId: string, area: string): Promise<{ vibeSummary: string; vibeConfidence: number }> {
  const cached = getTrustResult(listingId);
  if (cached?.vibeSummary) {
    return { vibeSummary: cached.vibeSummary, vibeConfidence: cached.vibeConfidence };
  }

  const reviews = getReviewsByListingId(listingId);
  const localData = getLocalAreaDataByArea(area);
  const config = getAwsConfig();

  let confidence = 100;
  if (reviews.length === 0) confidence = 40;
  else if (reviews.length < 2) confidence = 60;
  else if (reviews.length < 4) confidence = 80;

  // 1. Try AWS Bedrock Runtime AI model
  try {
    const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');
    const client = new BedrockRuntimeClient({ region: config.region });

    const prompt = `System: You write a single honest one-line neighborhood summary (max 15 words) for a rental listing in ${area}.\nUser: Noise=${localData?.noiseLevel || 5}, Nightlife=${localData?.nightlifeDensity || 5}.`;
    
    const response = await client.send(
      new InvokeModelCommand({
        modelId: 'amazon.titan-text-express-v1',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          inputText: prompt,
          textGenerationConfig: { maxTokenCount: 50, temperature: 0.3 },
        }),
      })
    );

    const bodyStr = new TextDecoder().decode(response.body);
    const bodyJson = JSON.parse(bodyStr);
    const vibeSummary = bodyJson.results?.[0]?.outputText?.trim();

    if (vibeSummary) {
      return { vibeSummary, vibeConfidence: confidence };
    }
  } catch (err: any) {
    // Bedrock model fallback to AWS SageMaker endpoint
    console.warn('AWS Bedrock Runtime call notice:', err.message);
  }

  // 2. AWS SageMaker AI Endpoint
  try {
    const sageMakerRes = await invokeSageMakerTrustModel({
      listingId,
      photoUrls: [],
      reviewsText: reviews.map((r) => r.text),
      price: 150,
      area,
    });

    if (sageMakerRes.suggestedVibeText) {
      return { vibeSummary: sageMakerRes.suggestedVibeText, vibeConfidence: confidence };
    }
  } catch (err: any) {
    console.warn('AWS SageMaker AI call notice:', err.message);
  }

  const fallback = FALLBACK_VIBES[area] || { summary: 'Vibrant neighborhood with local character.', confidence };
  return { vibeSummary: fallback.summary, vibeConfidence: fallback.confidence };
}