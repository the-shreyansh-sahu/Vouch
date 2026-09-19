import { NextRequest, NextResponse } from 'next/server';
import { getListingById } from '@/lib/data';
import { generateVibe } from '@/lib/vibe/generate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    const listing = getListingById(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const result = await generateVibe(listingId, listing.location.area);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Vibe generation error:', error);
    return NextResponse.json({ error: 'Vibe generation failed' }, { status: 500 });
  }
}