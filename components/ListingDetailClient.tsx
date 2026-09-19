'use client';

import { useState } from 'react';
import { Listing, Host, Review, TrustResult, LocalAreaData } from '@/types';
import { TrustBadge } from '@/components/TrustBadge';
import Link from 'next/link';

import { TrustCertificateModal } from '@/components/TrustCertificateModal';

interface ListingDetailClientProps {
  listing: Listing;
  host: Host | undefined;
  reviews: Review[];
  localData: LocalAreaData | undefined;
  initialTrustResult: TrustResult | undefined;
}

export function ListingDetailClient({
  listing,
  host,
  reviews,
  localData,
  initialTrustResult
}: ListingDetailClientProps) {
  const [trustResult, setTrustResult] = useState<TrustResult | undefined>(initialTrustResult);
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit'>('overview');
  const [showCertModal, setShowCertModal] = useState(false);

  const firstPhoto = listing.photos[0] || '/images/placeholder.jpg';

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch(`/api/trust-score/${listing.id}`);
      if (res.ok) {
        const data: TrustResult = await res.json();
        setTrustResult(data);
      }
    } catch (err) {
      console.error('Audit execution error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/listings"
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to listings grid
            </Link>

            <div className="flex items-center gap-3">
              {trustResult && <TrustBadge trustResult={trustResult} />}
              
              {trustResult && (
                <button
                  onClick={() => setShowCertModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 hover:bg-emerald-200 text-xs font-semibold transition-colors border border-emerald-300"
                >
                  📜 Certificate
                </button>
              )}
              <button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isAuditing ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Auditing...</span>
                  </>
                ) : (
                  <>⚡ Re-Analyze Listing</>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column (Photos, Overview & Audit Tabs) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Photo Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 shadow-md">
                <img
                  src={firstPhoto}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {trustResult?.badgeTier === 'red' && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5">
                    <span>⚠️ SCAM RISK DETECTED</span>
                  </div>
                )}
              </div>

              {/* Secondary Photos */}
              {listing.photos.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {listing.photos.map((photo, index) => (
                    <div key={index} className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border">
                      <img src={photo} alt={`${listing.title} ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Listing & Host Details
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'audit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🛡️ Vouch Trust Breakdown</span>
                {trustResult?.fraudFlags.length ? (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700 font-bold">
                    {trustResult.fraudFlags.length} Flags
                  </span>
                ) : null}
              </button>
            </div>

            {/* TAB CONTENT: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-slate-200 rounded-full text-xs font-semibold text-slate-700">
                      📍 {listing.location.area}
                    </span>
                    {trustResult && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        trustResult.badgeTier === 'green' ? 'bg-emerald-100 text-emerald-800' :
                        trustResult.badgeTier === 'yellow' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        Score: {trustResult.trustScore}/100
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">{listing.title}</h1>
                  <p className="text-slate-600 mt-2 text-base leading-relaxed">{listing.description}</p>
                </div>

                {/* Host Card */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
                    <span>Host Profile</span>
                    <span className="text-xs font-normal text-slate-500">Host ID: {host?.id || listing.hostId}</span>
                  </h2>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 border border-slate-300">
                      <img
                        src={host?.selfieUrl || '/images/placeholder.jpg'}
                        alt={host?.name || 'Host'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-lg">{host?.name || 'Anonymous Host'}</h3>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-md font-bold ${
                          host?.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {host?.verified ? '✓ ID Verified' : '✗ Unverified Host'}
                        </span>
                        <span className="text-slate-500">Verification Score: <strong className="text-slate-700">{host?.verificationScore || 0}/100</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Neighborhood Vibe Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl p-5 border border-blue-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✨</span>
                      <h2 className="text-base font-bold text-blue-950">Neighborhood Vibe Intelligence (LLM Generated)</h2>
                    </div>
                    {trustResult && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {trustResult.vibeConfidence}% Confidence
                      </span>
                    )}
                  </div>

                  {trustResult ? (
                    <blockquote className="text-blue-900 font-medium italic text-sm pl-4 border-l-4 border-blue-500 py-1">
                      "{trustResult.vibeSummary}"
                    </blockquote>
                  ) : (
                    <p className="text-xs text-slate-500">Click Re-Analyze to generate vibe summary.</p>
                  )}

                  {localData && (
                    <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                      <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Noise Level</p>
                        <p className="text-sm font-bold text-slate-800">{localData.noiseLevel}/100</p>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Nightlife</p>
                        <p className="text-sm font-bold text-slate-800">{localData.nightlifeDensity}/100</p>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Beach Dist</p>
                        <p className="text-sm font-bold text-slate-800">{localData.distanceToBeachKm} km</p>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Family Pct</p>
                        <p className="text-sm font-bold text-slate-800">{localData.familyGuestPct}%</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reviews Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">Guest Reviews ({reviews.length})</h2>
                  <div className="space-y-3">
                    {reviews.map(review => (
                      <div key={review.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="text-amber-500 font-bold text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Audit Breakdown */}
            {activeTab === 'audit' && trustResult && (
              <div className="space-y-6">
                
                {/* Composite Trust Score Banner */}
                <div className={`p-6 rounded-xl border ${
                  trustResult.badgeTier === 'green' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
                  trustResult.badgeTier === 'yellow' ? 'bg-amber-50 border-amber-200 text-amber-950' :
                  'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Composite Trust Score</span>
                      <h3 className="text-3xl font-extrabold">{trustResult.trustScore} / 100</h3>
                      <p className="text-sm font-medium mt-1">
                        Status: <span className="font-bold">{trustResult.badgeTier.toUpperCase()} TIER</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs space-y-1 font-mono">
                        <p>Host Verification (40%): {trustResult.verificationScore} pts</p>
                        <p>Fraud Prevention (40%): {100 - trustResult.fraudRiskScore} pts</p>
                        <p>Vibe Confidence (20%): {trustResult.vibeConfidence} pts</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fraud Risk Vectors */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Deterministic Fraud Vector Audit</h3>
                  
                  {trustResult.fraudFlags.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs text-rose-700 font-semibold">The following fraud risk flags were triggered:</p>
                      <ul className="space-y-2">
                        {trustResult.fraudFlags.map((flag, idx) => (
                          <li key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 font-mono flex items-start gap-2">
                            <span className="text-base">⚠️</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      <span>Zero fraud risk flags detected. Price is within normal standard deviation, photos are unique, and reviews show zero anomaly clusters or scam keywords.</span>
                    </div>
                  )}
                </div>

                {/* Host Verification Details */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Host Identity Document Heuristics</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border">
                      <span className="text-slate-500 font-semibold block">ID Document Check</span>
                      <span className="font-bold text-slate-800">{host?.idDocUrl ? '✓ Document Present' : '✗ Missing ID Doc'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border">
                      <span className="text-slate-500 font-semibold block">Selfie Verification</span>
                      <span className="font-bold text-slate-800">{host?.selfieUrl ? '✓ Selfie Present' : '✗ Missing Selfie'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Pricing & Booking Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md sticky top-24 space-y-6">
              <div className="text-center pb-4 border-b border-slate-100">
                <span className="text-4xl font-extrabold text-slate-900">${listing.price}</span>
                <span className="text-slate-500 text-sm"> / night</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Nightly rate</span>
                  <span className="font-semibold text-slate-800">${listing.price}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cleaning fee</span>
                  <span className="font-semibold text-slate-800">$50</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Vouch service fee</span>
                  <span className="font-semibold text-slate-800">$35</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span>${listing.price + 85}</span>
                </div>
              </div>

              {trustResult?.badgeTier === 'red' ? (
                <div className="space-y-3">
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 space-y-1">
                    <p className="font-bold flex items-center gap-1 text-rose-700">
                      <span>⛔ Booking Caution</span>
                    </p>
                    <p>This listing has active scam/fraud flags. Booking disabled by Vouch Trust Layer protection.</p>
                  </div>
                  <button
                    disabled
                    className="w-full py-3 bg-slate-300 text-slate-500 rounded-xl font-bold cursor-not-allowed text-sm"
                  >
                    Booking Blocked (Caution)
                  </button>
                </div>
              ) : (
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors">
                  Reserve Rental
                </button>
              )}

              <p className="text-center text-xs text-slate-400">
                Instant confirmation • No deposit required
              </p>
            </div>
          </div>
        </div>
      </main>

      {showCertModal && trustResult && (
        <TrustCertificateModal
          listing={listing}
          host={host}
          trustResult={trustResult}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
}
