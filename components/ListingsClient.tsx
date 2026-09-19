'use client';

import { useState } from 'react';
import { Listing, TrustResult } from '@/types';
import { ListingCard } from '@/components/ListingCard';
import Link from 'next/link';

import { ScamSimulatorModal } from '@/components/ScamSimulatorModal';
import { HostSandboxModal } from '@/components/HostSandboxModal';
import { EmbedCodeModal } from '@/components/EmbedCodeModal';

interface ListingsClientProps {
  initialListings: Listing[];
  initialTrustResults: Record<string, TrustResult>;
}

export function ListingsClient({ initialListings, initialTrustResults }: ListingsClientProps) {
  const [trustLayerEnabled, setTrustLayerEnabled] = useState<boolean>(true);
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [trustResults, setTrustResults] = useState<Record<string, TrustResult>>(initialTrustResults);
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditProgress, setAuditProgress] = useState<string>('');
  
  // Modal state
  const [activeModal, setActiveModal] = useState<'simulator' | 'host' | 'embed' | null>(null);
  const [selectedListingForSim, setSelectedListingForSim] = useState<Listing>(
    initialListings.find(l => l.id === 'listing-4') || initialListings[0]
  );

  // Handle re-auditing via API calls
  const handleRunFullAudit = async () => {
    setIsAuditing(true);
    setAuditProgress('Initiating multi-vector trust analysis...');

    const updatedResults: Record<string, TrustResult> = { ...trustResults };

    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      setAuditProgress(`Auditing ${listing.title} (${i + 1}/${listings.length})...`);
      
      try {
        const res = await fetch(`/api/trust-score/${listing.id}`);
        if (res.ok) {
          const data: TrustResult = await res.json();
          updatedResults[listing.id] = data;
        }
      } catch (err) {
        console.error(`Error auditing listing ${listing.id}:`, err);
      }
    }

    setTrustResults(updatedResults);
    setIsAuditing(false);
    setAuditProgress('');
  };

  const handleSaveSimulation = (updatedResult: TrustResult, updatedPrice: number) => {
    setTrustResults(prev => ({ ...prev, [updatedResult.listingId]: updatedResult }));
    setListings(prev => prev.map(l => l.id === updatedResult.listingId ? { ...l, price: updatedPrice } : l));
  };

  const filteredListings = listings.filter(listing => {
    if (!trustLayerEnabled || selectedTier === 'all') return true;
    const result = trustResults[listing.id];
    if (!result) return false;
    return result.badgeTier === selectedTier;
  });

  const redFlagCount = Object.values(trustResults).filter(r => r.badgeTier === 'red').length;
  const greenCount = Object.values(trustResults).filter(r => r.badgeTier === 'green').length;
  const yellowCount = Object.values(trustResults).filter(r => r.badgeTier === 'yellow').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  Vouch <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Trust & Discovery Layer</span>
                </h1>
                <p className="text-xs text-slate-500">Plug-and-play verification, scam prevention & vibe intelligence for local rentals</p>
              </div>
            </div>

            {/* Quick Demo Feature Triggers */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => setActiveModal('simulator')}
                className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 font-semibold transition-colors flex items-center gap-1 border border-amber-300"
              >
                <span>⚡ Fraud Simulator</span>
              </button>
              
              <button
                onClick={() => setActiveModal('host')}
                className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-900 hover:bg-indigo-200 font-semibold transition-colors flex items-center gap-1 border border-indigo-300"
              >
                <span>🪪 Host ID Sandbox</span>
              </button>

              <button
                onClick={() => setActiveModal('embed')}
                className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-semibold transition-colors flex items-center gap-1 border border-emerald-300"
              >
                <span>📦 1-Line Embed Code</span>
              </button>

              <button
                onClick={handleRunFullAudit}
                disabled={isAuditing}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
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
                  <>
                    <span>⚡ Re-Run Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Demo Controller Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                Live Demo Control Panel
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Toggle the Vouch Trust Layer</h2>
              <p className="text-slate-300 text-sm max-w-xl">
                Compare raw marketplace listings against Vouch-enriched listings equipped with host identity score, deterministic fraud checks, and LLM neighborhood vibe analysis.
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center bg-slate-800/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 gap-4 self-start md:self-center">
              <span className={`text-sm font-semibold transition-colors ${!trustLayerEnabled ? 'text-white' : 'text-slate-400'}`}>
                Plain Listing
              </span>
              
              <button
                onClick={() => setTrustLayerEnabled(!trustLayerEnabled)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  trustLayerEnabled ? 'bg-blue-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    trustLayerEnabled ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>

              <span className={`text-sm font-semibold transition-colors ${trustLayerEnabled ? 'text-blue-400' : 'text-slate-400'}`}>
                Trust Layer ON
              </span>
            </div>
          </div>

          {/* Audit progress notification */}
          {auditProgress && (
            <div className="mt-4 p-3 bg-blue-900/50 border border-blue-700/50 rounded-lg text-xs text-blue-200 flex items-center gap-2 animate-pulse">
              <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{auditProgress}</span>
            </div>
          )}

          {/* Active Filter Pills (Visible when Trust Layer is ON) */}
          {trustLayerEnabled && (
            <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Filter by Trust Score:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTier('all')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      selectedTier === 'all' ? 'bg-white/10 text-white font-medium border border-white/20' : 'hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    All ({initialListings.length})
                  </button>
                  <button
                    onClick={() => setSelectedTier('green')}
                    className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                      selectedTier === 'green' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Verified & Trusted ({greenCount})
                  </button>
                  <button
                    onClick={() => setSelectedTier('yellow')}
                    className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                      selectedTier === 'yellow' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Review ({yellowCount})
                  </button>
                  <button
                    onClick={() => setSelectedTier('red')}
                    className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                      selectedTier === 'red' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    Caution / Scam Risk ({redFlagCount})
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                {trustLayerEnabled ? '🛡️ Trust Badges & Flags active' : '⚪ Standard Marketplace View'}
              </div>
            </div>
          )}
        </div>

        {/* Demo Highlight Banner when Trust Layer is ON */}
        {trustLayerEnabled && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="text-sm font-bold text-amber-900">Judges Demo Guide</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Notice how <strong className="font-semibold">Listing #4 ("Luxury Villa with Pool")</strong> gets flagged with a <span className="font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">Red Caution Badge (Score: 23)</span> due to price std dev anomaly ($85 vs Santa Monica mean $180), pHash duplicate photo match, review burst, and scam phrasing. Click any listing for complete verification breakdown!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <Link key={listing.id} href={`/listings/${listing.id}`} className="block focus:outline-none">
              <ListingCard
                listing={listing}
                trustLayerEnabled={trustLayerEnabled}
                trustResult={trustResults[listing.id] || null}
              />
            </Link>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500 font-medium">No listings match the selected trust filter.</p>
            <button
              onClick={() => setSelectedTier('all')}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset filter
            </button>
          </div>
        )}
      </main>

      {/* Feature Modals */}
      {activeModal === 'simulator' && (
        <ScamSimulatorModal
          listing={selectedListingForSim}
          initialTrustResult={trustResults[selectedListingForSim.id] || null}
          onClose={() => setActiveModal(null)}
          onSaveResult={handleSaveSimulation}
        />
      )}

      {activeModal === 'host' && (
        <HostSandboxModal
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'embed' && (
        <EmbedCodeModal
          listingId={selectedListingForSim.id}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
