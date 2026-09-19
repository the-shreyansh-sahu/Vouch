'use client';

import { Listing, Host, TrustResult } from '@/types';

interface TrustCertificateModalProps {
  listing: Listing;
  host?: Host;
  trustResult: TrustResult;
  onClose: () => void;
}

export function TrustCertificateModal({ listing, host, trustResult, onClose }: TrustCertificateModalProps) {
  const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Certificate Container */}
        <div className="p-8 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-8 border-slate-900 m-2 rounded-xl text-center space-y-6 relative">
          
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-2xl font-bold">
            &times;
          </button>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-blue-600 font-extrabold text-xl">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>VOUCH TRUST PROTOCOL</span>
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-slate-900 uppercase">Certificate of Verification</h1>
            <p className="text-xs text-slate-500 font-mono">CERTIFICATE ID: VOUCH-{listing.id.toUpperCase()}-2026</p>
          </div>

          <div className="py-4 border-y border-slate-200 space-y-2 text-sm text-slate-700">
            <p>This certifies that the local rental listing titled:</p>
            <h2 className="text-xl font-bold text-slate-900">{listing.title}</h2>
            <p className="text-xs text-slate-500">Located in {listing.location.area} • Host: {host?.name || 'Anonymous'}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-left text-xs bg-slate-50 p-4 rounded-xl border">
            <div>
              <span className="text-slate-500 block font-semibold">Composite Score</span>
              <span className="text-xl font-extrabold text-slate-900">{trustResult.trustScore} / 100</span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Badge Tier</span>
              <span className={`text-sm font-bold uppercase ${
                trustResult.badgeTier === 'green' ? 'text-emerald-600' :
                trustResult.badgeTier === 'yellow' ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {trustResult.badgeTier} TIER
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Host Status</span>
              <span className="text-sm font-bold text-slate-800">{host?.verified ? '✓ ID Verified' : 'Unverified'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t text-xs text-slate-500 font-mono">
            <span>ISSUED: {issueDate}</span>
            <span>STATUS: {trustResult.badgeTier === 'red' ? 'CAUTION FLAGGED' : 'VALIDATED & SIGNED'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
