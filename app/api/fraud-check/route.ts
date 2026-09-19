import { NextRequest, NextResponse } from 'next/server';
import { runFraudChecks } from '@/lib/fraud';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    const result = runFraudChecks(listingId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Fraud check error:', error);
    return NextResponse.json({ error: 'Fraud check failed' }, { status: 500 });
  }
}