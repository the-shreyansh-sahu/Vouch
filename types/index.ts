export type Listing = {
  id: string;
  title: string;
  price: number;
  location: {
    lat: number;
    lng: number;
    area: string;
  };
  photos: string[];
  description: string;
  hostId: string;
};

export type Host = {
  id: string;
  name: string;
  idDocUrl?: string;
  selfieUrl?: string;
  verificationScore?: number;
  verified?: boolean;
};

export type Review = {
  id: string;
  listingId: string;
  text: string;
  rating: number;
  createdAt: string;
};

export type LocalAreaData = {
  area: string;
  noiseLevel: number;
  nightlifeDensity: number;
  distanceToBeachKm: number;
  familyGuestPct: number;
};

export type TrustResult = {
  listingId: string;
  verificationScore: number;
  fraudRiskScore: number;
  fraudFlags: string[];
  vibeSummary: string;
  vibeConfidence: number;
  trustScore: number;
  badgeTier: 'green' | 'yellow' | 'red';
};

// API Response types
export type VerifyResponse = {
  verificationScore: number;
  verified: boolean;
};

export type FraudCheckResponse = {
  fraudRiskScore: number;
  flags: string[];
};

export type VibeResponse = {
  vibeSummary: string;
  vibeConfidence: number;
};

export type TrustScoreResponse = TrustResult;