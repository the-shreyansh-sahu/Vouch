# CLAUDE.md — Trust & Discovery Layer for Local Rentals

This file is the build reference for this repo. Read it fully before writing code. It captures scope, architecture, data model, and build order for a hackathon prototype (~24–30 hrs). Prioritize getting something visibly working end-to-end over polishing any one module.

## 1. What we're building

A **drop-in trust layer** for a local rental listing page — not a marketplace. The deliverable is a listing page that renders a listing card **before** the trust layer (plain card) and **after** (card + composite trust badge). Everything feeds one badge:

- **Host verification** → 0–100 confidence + verified boolean
- **Fraud/scam detector** → 0–100 risk score + specific flags
- **Neighborhood vibe generator** → one honest LLM-written line
- **Trust score** → weighted combination, rendered as a green/yellow/red badge

Judges should be able to see: mock listings → toggle "apply trust layer" → badge appears with a hover/tap breakdown of *why*.

## 2. Tech stack (decided — don't relitigate mid-build)

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + Tailwind |
| Backend | Next.js API routes (co-located, no separate server) |
| AI | One LLM call (Claude API) — only for the vibe generator |
| Data | SQLite (via `better-sqlite3` or Prisma) or flat JSON files — pick JSON files for speed, SQLite only if there's time to spare |
| Image hashing | `sharp` + a JS pHash lib (e.g. `imghash`), or skip and mock it if it eats too much time |
| Deployment | Local dev is fine for a demo; Vercel deploy only as a stretch goal |

Keep verification and fraud detection **fully deterministic and offline** — no paid APIs, no external calls except the single vibe-generator LLM call. This keeps the demo reliable with no network flakiness risk during judging.

## 3. Repo structure

```
/app
  /api
    /verify/route.ts
    /fraud-check/route.ts
    /vibe/route.ts
    /trust-score/[listingId]/route.ts
  /listings
    page.tsx              # listing grid, toggle: trust layer on/off
    [id]/page.tsx          # single listing detail
  layout.tsx
/components
  ListingCard.tsx
  TrustBadge.tsx           # green/yellow/red badge + hover breakdown
  BadgeFlags.tsx
/lib
  fraud/
    priceAnomaly.ts
    duplicateImage.ts
    reviewBurst.ts
  verify/
    heuristics.ts
  vibe/
    prompt.ts
    generate.ts
  trustScore.ts             # the weighted formula, single source of truth
  data.ts                   # read/write mock JSON "DB"
/data
  listings.json
  hosts.json
  reviews.json
  localArea.json
/types
  index.ts                  # shared TS types for Listing, Host, Review, TrustResult
```

Keep the scoring formula in exactly one place (`lib/trustScore.ts`) so tuning weights during testing doesn't require touching multiple files.

## 4. Data model

```ts
type Listing = {
  id: string; title: string; price: number;
  location: { lat: number; lng: number; area: string };
  photos: string[]; description: string; hostId: string;
};

type Host = {
  id: string; name: string; idDocUrl?: string; selfieUrl?: string;
  verificationScore?: number; verified?: boolean;
};

type Review = { id: string; listingId: string; text: string; rating: number; createdAt: string };

type LocalAreaData = {
  area: string; noiseLevel: number; nightlifeDensity: number;
  distanceToBeachKm: number; familyGuestPct: number;
};

type TrustResult = {
  listingId: string;
  verificationScore: number;
  fraudRiskScore: number;
  fraudFlags: string[];
  vibeSummary: string;
  vibeConfidence: number;
  trustScore: number;
  badgeTier: 'green' | 'yellow' | 'red';
};
```

Seed `/data/*.json` with ~6–8 mock listings across 2–3 areas, a few hosts (mix of verified/unverified), and enough reviews per listing to make the fraud and vibe checks produce varied, demo-worthy results. **Deliberately engineer 1–2 listings to trip fraud flags** (duplicate photo hash, price outlier, review burst) so the red-badge case has something to show.

## 5. Module logic

### 5.1 Host verification (`lib/verify/heuristics.ts`)
- Check: file format valid, EXIF metadata present, resolution above threshold, blur estimate below threshold, crude document-template pattern match.
- No real face-match — mock it as a stretch flag, not required for MVP.
- Output: `{ verificationScore: number, verified: boolean }` (verified = score ≥ 70).

### 5.2 Fraud detector (`lib/fraud/*`)
- **Price anomaly**: flag if listing price is >2 std devs from the mean of listings in the same `area`.
- **Duplicate image**: pHash each listing photo, flag on near-identical hashes across different listings.
- **Review burst**: flag if a disproportionate share of 5-star reviews cluster in a narrow time window.
- **Text pattern (stretch)**: simple keyword heuristics for scam phrasing ("wire transfer only", "deposit before viewing", etc.) — only if time allows.
- Combine into `{ fraudRiskScore: number, flags: string[] }`.

### 5.3 Neighborhood vibe generator (`lib/vibe/*`)
Single Claude API call. Keep the system prompt exactly this shape:

```
SYSTEM: You write a single honest one-line neighborhood summary (max 15 words)
for a rental listing, based only on the data given. Avoid marketing language.

USER: Reviews: {review_excerpts}
Local data: noise={noise_level}, nightlife={nightlife_density},
distance_to_beach={distance_km}km, family_share={pct_family_guests}%
```

- `vibeConfidence` = 100 if review excerpts + local data both present and non-trivial; scale down if data is sparse (e.g. no reviews → 40).
- Cache the result per listing in the mock DB so repeat demo runs don't re-call the API.

### 5.4 Trust score (`lib/trustScore.ts`)
```
trustScore = 0.4 * verificationScore
           + 0.4 * (100 - fraudRiskScore)
           + 0.2 * vibeConfidence

badgeTier =
  trustScore >= 80 ? 'green'  // "Verified & Trusted"
  : trustScore >= 50 ? 'yellow' // "Review before booking"
  : 'red'                       // "Caution" — show flags on hover/tap
```
Treat these thresholds as tunable constants, not magic numbers inline.

## 6. API contracts

```
POST /api/verify         { hostId }                → { verificationScore, verified }
POST /api/fraud-check     { listingId }             → { fraudRiskScore, flags[] }
POST /api/vibe            { listingId }             → { vibeSummary, vibeConfidence }
GET  /api/trust-score/:id                           → { trustScore, badgeTier, breakdown }
```
`trust-score` orchestrates the other three (call in parallel with `Promise.all`) and persists the combined `TrustResult` back into the mock DB.

## 7. Build order (do not reorder — each step produces something visibly demoable)

1. **Listing card UI + mock data** — grid of `ListingCard`s from `data/listings.json`, no trust logic yet. This is the demo backbone; get it pixel-decent early.
2. **Fraud/scam rule engine** — pure functions, no UI dependency, easy to unit-test in isolation with the mock data.
3. **Vibe generator** — the single LLM integration; wire it end-to-end early since it's the one external dependency and the "wow" moment.
4. **Host verification** — heuristic checks against mock host docs (use placeholder images with known-good/known-bad EXIF for demo purposes).
5. **Wire `TrustBadge`** to `/api/trust-score/:id`, add the before/after toggle on the listing page, then polish styling last.

Stop and demo-check after every step — don't let any module block the others from being visibly wired up.

## 8. Demo script (for judging)

1. Show the plain listing grid (no trust layer).
2. Toggle "Apply Trust Layer" → badges animate in.
3. Click into the one red-flagged listing → show the specific fraud flags and low vibe confidence.
4. Click into the green listing → show verified host + high-confidence vibe line.
5. One-liner close: "pluggable into an existing listing page, not a rebuild — could ship tomorrow."

## 9. Explicit non-goals for the hackathon build

- No real face-match / document-authenticity API (mock only)
- No ML-trained fraud model (rules only)
- No live local-area data feeds (static mock table)
- No host dashboard / dispute flow
- No auth system — this is a demo, not a product

## 10. Environment

- `.env.local` needs `ANTHROPIC_API_KEY` for the vibe generator only.
- Everything else runs with zero external dependencies — verify this before the demo so a dead wifi connection doesn't kill anything except the one vibe-generator call (have a hardcoded fallback vibe string per listing as a safety net).
