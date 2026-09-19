# Vouch - Trust Layer for Local Rentals

A drop-in trust layer for rental listings that adds host verification, fraud detection, and neighborhood vibe analysis.

## Features

- **Host Verification**: Checks ID documents, selfies, and profile completeness
- **Fraud Detection**: Price anomaly detection, duplicate image checking, review burst analysis, scam keyword detection
- **Neighborhood Vibe**: AI-generated honest one-line neighborhood summaries
- **Trust Score**: Weighted composite score rendered as green/yellow/red badges

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Better SQLite3 (for future use)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Add your Anthropic API key to `.env.local`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000/listings](http://localhost:3000/listings)

## Demo

1. Visit the listings page
2. Toggle "Apply Trust Layer" to see trust badges
3. Click on a listing to see detailed trust breakdown
4. Look for the red-flagged listing (listing-4) which has:
   - Duplicate images (shares photo with listing-1)
   - Price anomaly (too low for Santa Monica area)
   - Review burst (5 five-star reviews in 5 days)
   - Scam keywords in reviews

## Project Structure

```
/app
  /api
    /verify/route.ts           # Host verification endpoint
    /fraud-check/route.ts      # Fraud detection endpoint
    /vibe/route.ts             # Vibe generation endpoint
    /trust-score/[id]/route.ts # Combined trust score endpoint
  /listings
    page.tsx                   # Listing grid with trust toggle
    [id]/page.tsx              # Single listing detail
/components
  ListingCard.tsx              # Listing card with trust badge
  TrustBadge.tsx               # Trust badge component
  BadgeFlags.tsx               # Hover breakdown of trust factors
/lib
  /fraud                       # Fraud detection modules
  /verify                      # Host verification modules
  /vibe                        # Vibe generation modules
  trustScore.ts                # Trust score calculation
  data.ts                      # Data access layer
/data
  listings.json                # Mock listings
  hosts.json                   # Mock hosts
  reviews.json                 # Mock reviews
  localArea.json               # Mock area data
/types
  index.ts                     # Shared TypeScript types
```