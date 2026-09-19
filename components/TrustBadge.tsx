'use client';

import { TrustResult } from '@/types';
import { getBadgeLabel, getBadgeColor } from '@/lib/trustScore';
import { BadgeFlags } from './BadgeFlags';

interface TrustBadgeProps {
  trustResult: TrustResult | null;
  showBreakdown?: boolean;
}

export function TrustBadge({ trustResult, showBreakdown = true }: TrustBadgeProps) {
  if (!trustResult) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-slate-700/60 text-slate-300 text-xs font-semibold shadow-md">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        No trust data
      </div>
    );
  }

  const badgeColor = getBadgeColor(trustResult.badgeTier);
  const badgeLabel = getBadgeLabel(trustResult.badgeTier);

  const dotColor =
    trustResult.badgeTier === 'green' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]' :
    trustResult.badgeTier === 'yellow' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]' :
    'bg-rose-400 animate-pulse shadow-[0_0_8px_rgba(251,113,133,0.9)]';

  return (
    <div className="relative inline-flex items-center gap-2">
      <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border ${badgeColor} text-xs font-bold tracking-wide shadow-xl transition-all duration-300 hover:scale-105`}>
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="drop-shadow-sm">{badgeLabel} ({trustResult.trustScore})</span>
      </div>

      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-semibold text-amber-300 flex items-center gap-1 shadow-sm">
        <span className="text-[9px]">☁️</span> AWS Powered
      </span>

      {showBreakdown && (
        <BadgeFlags trustResult={trustResult} />
      )}
    </div>
  );
}