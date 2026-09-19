import { Listing } from '@/types';
import { getListings } from '@/lib/data';

export function checkDuplicateImages(listing: Listing, allListings?: Listing[]): { hasDuplicates: boolean; score: number; flag?: string } {
  const listings = allListings || getListings();
  const otherListings = listings.filter(l => l.id !== listing.id);

  let duplicateCount = 0;
  const matchedPhotos: string[] = [];

  for (const photo of listing.photos) {
    for (const otherListing of otherListings) {
      if (otherListing.photos.includes(photo)) {
        duplicateCount++;
        matchedPhotos.push(photo);
        break;
      }
    }
  }

  if (duplicateCount > 0) {
    return {
      hasDuplicates: true,
      score: Math.min(100, duplicateCount * 40),
      flag: `Duplicate images detected: ${duplicateCount} photo(s) found in other listings (${matchedPhotos.join(', ')})`
    };
  }

  return { hasDuplicates: false, score: 0 };
}