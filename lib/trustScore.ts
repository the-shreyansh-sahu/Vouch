export const TRUST_WEIGHTS = {
  verification: 0.4,
  fraud: 0.4,
  vibe: 0.2
} as const;

export const BADGE_THRESHOLDS = {
  green: 80,
  yellow: 50
} as const;

export function calculateTrustScore(
  verificationScore: number,
  fraudRiskScore: number,
  vibeConfidence: number
): { trustScore: number; badgeTier: 'green' | 'yellow' | 'red' } {
  const trustScore = Math.round(
    TRUST_WEIGHTS.verification * verificationScore +
    TRUST_WEIGHTS.fraud * (100 - fraudRiskScore) +
    TRUST_WEIGHTS.vibe * vibeConfidence
  );

  let badgeTier: 'green' | 'yellow' | 'red';
  if (trustScore >= BADGE_THRESHOLDS.green) {
    badgeTier = 'green';
  } else if (trustScore >= BADGE_THRESHOLDS.yellow) {
    badgeTier = 'yellow';
  } else {
    badgeTier = 'red';
  }

  return { trustScore, badgeTier };
}

export function getBadgeLabel(tier: 'green' | 'yellow' | 'red'): string {
  switch (tier) {
    case 'green': return 'Verified & Trusted';
    case 'yellow': return 'Review Before Booking';
    case 'red': return 'Caution Advised';
  }
}

export function getBadgeColor(tier: 'green' | 'yellow' | 'red'): string {
  switch (tier) {
    case 'green': return 'bg-emerald-950/85 text-emerald-200 border-emerald-400/50 shadow-emerald-950/40 hover:bg-emerald-900/90';
    case 'yellow': return 'bg-amber-950/85 text-amber-200 border-amber-400/50 shadow-amber-950/40 hover:bg-amber-900/90';
    case 'red': return 'bg-rose-950/85 text-rose-200 border-rose-400/50 shadow-rose-950/40 hover:bg-rose-900/90';
  }
}