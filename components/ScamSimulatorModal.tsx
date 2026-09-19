'use client';

import { useState } from 'react';
import { Listing, TrustResult } from '@/types';
import { calculateTrustScore } from '@/lib/trustScore';

interface ScamSimulatorModalProps {
  listing: Listing;
  initialTrustResult: TrustResult | null;
  onClose: () => void;
  onSaveResult: (updatedResult: TrustResult, updatedPrice: number) => void;
}

export function ScamSimulatorModal({ listing, initialTrustResult, onClose, onSaveResult }: ScamSimulatorModalProps) {
  const [price, setPrice] = useState<number>(listing.price);
  const [hasDuplicatePhoto, setHasDuplicatePhoto] = useState<boolean>(
    initialTrustResult?.fraudFlags.some(f => f.toLowerCase().includes('duplicate')) ?? true
  );
  const [hasReviewBurst, setHasReviewBurst] = useState<boolean>(
    initialTrustResult?.fraudFlags.some(f => f.toLowerCase().includes('review burst')) ?? true
  );
  const [hasScamPhrasing, setHasScamPhrasing] = useState<boolean>(
    initialTrustResult?.fraudFlags.some(f => f.toLowerCase().includes('scam keyword')) ?? true
  );
  const [verificationScore, setVerificationScore] = useState<number>(initialTrustResult?.verificationScore ?? 35);

  // Recalculate fraud score live
  let currentFraudScore = 0;
  const currentFlags: string[] = [];

  // Price anomaly calculation against area mean (Santa Monica mean $180)
  const areaMean = 180;
  const stdDev = 40;
  if (price < areaMean - 2 * stdDev) {
    const dev = ((areaMean - price) / stdDev).toFixed(1);
    currentFraudScore += 50;
    currentFlags.push(`Price anomaly: $${price} is ${dev} std devs below area mean ($${areaMean})`);
  }

  if (hasDuplicatePhoto) {
    currentFraudScore += 40;
    currentFlags.push('Duplicate images detected: photo found in other listings');
  }

  if (hasReviewBurst) {
    currentFraudScore += 30;
    currentFlags.push('Review burst: 5 five-star reviews within 3.0 days');
  }

  if (hasScamPhrasing) {
    currentFraudScore += 25;
    currentFlags.push('Scam keywords detected: wire transfer, deposit before viewing');
  }

  const finalFraudScore = Math.min(100, currentFraudScore);
  const vibeConfidence = initialTrustResult?.vibeConfidence ?? 70;
  const { trustScore, badgeTier } = calculateTrustScore(verificationScore, finalFraudScore, vibeConfidence);

  const handleApply = () => {
    const updatedResult: TrustResult = {
      listingId: listing.id,
      verificationScore,
      fraudRiskScore: finalFraudScore,
      fraudFlags: currentFlags,
      vibeSummary: initialTrustResult?.vibeSummary || 'Area summary',
      vibeConfidence,
      trustScore,
      badgeTier
    };
    onSaveResult(updatedResult, price);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="text-lg font-bold">Scam & Fraud Rule Simulator</h2>
              <p className="text-xs text-slate-300">Tweak variables live to test Vouch scoring math</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Live Preview Bar */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            badgeTier === 'green' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' :
            badgeTier === 'yellow' ? 'bg-amber-50 border-amber-300 text-amber-950' :
            'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Live Simulated Score</span>
              <div className="text-3xl font-extrabold">{trustScore} / 100</div>
              <span className="text-xs font-bold uppercase">{badgeTier.toUpperCase()} TIER</span>
            </div>

            <div className="text-right text-xs space-y-1 font-mono">
              <p>Fraud Risk: <span className="font-bold">{finalFraudScore}%</span></p>
              <p>Flags Triggered: <span className="font-bold">{currentFlags.length}</span></p>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4 text-sm">
            {/* Price Slider */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border">
              <div className="flex justify-between font-semibold text-slate-800">
                <label>Listing Price ($/night)</label>
                <span className="text-blue-600 font-bold">${price} <span className="text-slate-500 font-normal">(Area Mean: $180)</span></span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="5"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-xs text-slate-500">
                {price < 100 ? '⚠️ Triggering anomaly flag (>2 std dev below mean)' : '✓ Price within normal distribution'}
              </p>
            </div>

            {/* Checkbox Toggles */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
              <span className="font-semibold text-slate-800 block">Fraud Risk Signals</span>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDuplicatePhoto}
                  onChange={(e) => setHasDuplicatePhoto(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                />
                <span className="text-slate-700">Duplicate Photo Match (+40 risk)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReviewBurst}
                  onChange={(e) => setHasReviewBurst(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                />
                <span className="text-slate-700">5-Star Review Burst Cluster (+30 risk)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasScamPhrasing}
                  onChange={(e) => setHasScamPhrasing(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                />
                <span className="text-slate-700">Scam Phrasing ("Wire Transfer Only") (+25 risk)</span>
              </label>
            </div>

            {/* Host Score Slider */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border">
              <div className="flex justify-between font-semibold text-slate-800">
                <label>Host Identity Score</label>
                <span className="font-bold text-slate-800">{verificationScore} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={verificationScore}
                onChange={(e) => setVerificationScore(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors"
          >
            Apply Simulation to UI
          </button>
        </div>
      </div>
    </div>
  );
}
