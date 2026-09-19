import { Listing, TrustResult } from '@/types';
import { TrustBadge } from './TrustBadge';

interface ListingCardProps {
  listing: Listing;
  trustResult?: TrustResult | null;
  trustLayerEnabled?: boolean;
}

export function ListingCard({ listing, trustResult, trustLayerEnabled = false }: ListingCardProps) {
  const firstPhoto = listing.photos[0] || '/images/placeholder.jpg';
  const showTrust = trustLayerEnabled && trustResult;

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300 group ${
      showTrust && trustResult?.badgeTier === 'red' ? 'ring-2 ring-red-400 border-red-200' : ''
    }`}>
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={firstPhoto}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
          }}
        />
        {showTrust && (
          <div className="absolute top-2 right-2 z-10 animate-fade-in">
            <TrustBadge trustResult={trustResult} showBreakdown={false} />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">{listing.title}</h3>
          {showTrust && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              trustResult.badgeTier === 'green' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
              trustResult.badgeTier === 'yellow' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
            }`}>
              {trustResult.trustScore}/100
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{listing.description}</p>

        {showTrust && trustResult.fraudFlags.length > 0 && (
          <div className="mb-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 space-y-1">
            <div className="font-semibold flex items-center gap-1">
              <span>⚠️ Scam Risk Detected ({trustResult.fraudFlags.length})</span>
            </div>
            <p className="line-clamp-1 text-rose-600">{trustResult.fraudFlags[0]}</p>
          </div>
        )}

        {showTrust && trustResult.vibeSummary && (
          <div className="mb-3 px-2.5 py-1.5 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 italic">
            "{trustResult.vibeSummary}"
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{listing.location.area}</span>
          </div>

          <span className="font-bold text-lg text-gray-900">${listing.price}<span className="font-normal text-sm text-gray-500">/night</span></span>
        </div>
      </div>
    </div>
  );
}