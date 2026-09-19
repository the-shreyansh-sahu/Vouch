'use client';

import { useState } from 'react';

interface EmbedCodeModalProps {
  listingId: string;
  onClose: () => void;
}

export function EmbedCodeModal({ listingId, onClose }: EmbedCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const snippet = `<!-- Drop-in Vouch Trust Layer Badge -->
<script src="https://cdn.vouchtrust.io/v1/badge.js" async></script>
<div data-vouch-badge="${listingId}" data-theme="light"></div>`;

  const reactSnippet = `import { VouchTrustBadge } from '@vouch/react';

export function ListingHeader() {
  return <VouchTrustBadge listingId="${listingId}" showBreakdown={true} />;
}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <h2 className="text-lg font-bold">1-Line Drop-In Integration Snippet</h2>
              <p className="text-xs text-slate-300">Embed Vouch on any marketplace (Craigslist, FB Marketplace, custom site)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
        </div>

        <div className="p-6 space-y-6 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">HTML / Script Embed</span>
              <button
                onClick={() => handleCopy(snippet)}
                className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-md transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy HTML'}
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
              {snippet}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">React / Next.js Embed Component</span>
              <button
                onClick={() => handleCopy(reactSnippet)}
                className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-md transition-colors"
              >
                Copy React Component
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-blue-300 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
              {reactSnippet}
            </pre>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
            <span className="text-base">💡</span>
            <span>
              <strong>Zero Backend Changes Required:</strong> Vouch runs fully client-side or via lightweight API middleware. Marketplaces can add trust verification to existing listing pages in under 5 minutes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
