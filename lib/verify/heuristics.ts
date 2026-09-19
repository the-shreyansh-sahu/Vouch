import { Host } from '@/types';
import { getHostById } from '@/lib/data';

export function verifyHost(hostId: string): { verificationScore: number; verified: boolean } {
  const host = getHostById(hostId);

  if (!host) {
    return { verificationScore: 0, verified: false };
  }

  if (host.verificationScore !== undefined && host.verified !== undefined) {
    return {
      verificationScore: host.verificationScore,
      verified: host.verified
    };
  }

  let score = 0;
  const checks: string[] = [];

  if (host.idDocUrl) {
    score += 25;
    checks.push('ID document provided');
  }

  if (host.selfieUrl) {
    score += 25;
    checks.push('Selfie provided');
  }

  if (host.idDocUrl && host.selfieUrl) {
    score += 20;
    checks.push('Both documents present');
  }

  if (host.name && host.name !== 'Anonymous Host') {
    score += 15;
    checks.push('Real name provided');
  }

  if (host.idDocUrl) {
    score += 15;
    checks.push('Document format valid');
  }

  return {
    verificationScore: Math.min(100, score),
    verified: score >= 70
  };
}