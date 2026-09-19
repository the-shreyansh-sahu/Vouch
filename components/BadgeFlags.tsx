'use client';

import { TrustResult } from '@/types';
import { useState } from 'react';

interface BadgeFlagsProps {
  trustResult: TrustResult;
}

export function BadgeFlags({ trustResult }: BadgeFlagsProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const breakdownItems = [
    {
      label: 'Host Verification',
      score: trustResult.verificationScore,
      color: trustResult.verificationScore >= 70 ? 'text-green-600' : trustResult.verificationScore >= 40 ? 'text-yellow-600' : 'text-red-600',
      icon: trustResult.verificationScore >= 70 ? '✓' : '✗'
    },
    {
      label: 'Fraud Risk',
      score: 100 - trustResult.fraudRiskScore,
      color: trustResult.fraudRiskScore <= 30 ? 'text-green-600' : trustResult.fraudRiskScore <= 60 ? 'text-yellow-600' : 'text-red-600',
      icon: trustResult.fraudRiskScore <= 30 ? '✓' : '⚠'
    },
    {
      label: 'Vibe Confidence',
      score: trustResult.vibeConfidence,
      color: trustResult.vibeConfidence >= 80 ? 'text-green-600' : trustResult.vibeConfidence >= 50 ? 'text-yellow-600' : 'text-red-600',
      icon: '📍'
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="text-xs text-gray-500 hover:text-gray-700 underline"
        aria-expanded={showBreakdown}
        aria-haspopup="dialog"
      >
        {showBreakdown ? 'Hide details' : 'Show why'}
      </button>

      {showBreakdown && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white rounded-lg shadow-lg border p-3 animate-fade-in">
          <div className="space-y-2">
            {breakdownItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.icon} {item.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${item.color.replace('text-', 'bg-')}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className={`text-sm font-mono ${item.color}`}>{item.score}</span>
                </div>
              </div>
            ))}

            {trustResult.fraudFlags.length > 0 && (
              <div className="border-t pt-2 mt-2">
                <p className="text-xs font-medium text-gray-600 mb-1">Fraud Flags:</p>
                <ul className="space-y-1">
                  {trustResult.fraudFlags.map((flag, index) => (
                    <li key={index} className="text-xs text-red-600 flex items-start gap-1">
                      <span>⚠</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t pt-2 mt-2">
              <p className="text-xs text-gray-500 italic">"{trustResult.vibeSummary}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}