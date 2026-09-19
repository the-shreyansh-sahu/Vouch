import { getListingById, getReviewsByListingId, getHostById, getLocalAreaDataByArea, getTrustResult } from '@/lib/data';
import { ListingDetailClient } from '@/components/ListingDetailClient';

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;
  const listing = getListingById(id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-slate-900">Listing Not Found</h1>
          <p className="text-slate-500">The listing you are looking for does not exist.</p>
          <a href="/listings" className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-800">
            Return to listings
          </a>
        </div>
      </div>
    );
  }

  const reviews = getReviewsByListingId(id);
  const host = getHostById(listing.hostId);
  const localData = getLocalAreaDataByArea(listing.location.area);
  const trustResult = getTrustResult(id);

  return (
    <ListingDetailClient
      listing={listing}
      host={host}
      reviews={reviews}
      localData={localData}
      initialTrustResult={trustResult}
    />
  );
}