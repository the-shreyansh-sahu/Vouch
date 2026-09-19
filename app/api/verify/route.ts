import { NextRequest, NextResponse } from 'next/server';
import { verifyHostWithAws } from '@/lib/verify/heuristics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostId } = body;

    if (!hostId) {
      return NextResponse.json({ error: 'hostId is required' }, { status: 400 });
    }

    const result = await verifyHostWithAws(hostId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}