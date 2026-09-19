const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function createListingSvg(title, subtitle, color1, color2, iconSvg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="rgba(15,23,42,0.8)" />
      <stop offset="60%" stop-color="rgba(15,23,42,0.2)" />
      <stop offset="100%" stop-color="rgba(15,23,42,0.0)" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#grad)" />
  <circle cx="650" cy="150" r="220" fill="rgba(255,255,255,0.08)" />
  <circle cx="150" cy="450" r="180" fill="rgba(255,255,255,0.05)" />
  <g transform="translate(320, 160) scale(3.5)" opacity="0.25">
    ${iconSvg}
  </g>
  <rect width="800" height="600" fill="url(#overlay)" />
  <g transform="translate(45, 480)">
    <rect x="-10" y="-35" width="220" height="28" rx="14" fill="rgba(255,255,255,0.2)" />
    <text x="0" y="-16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#ffffff" letter-spacing="1">VOUCH LOCAL RENTAL</text>
    <text x="0" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="#ffffff">${title}</text>
    <text x="0" y="50" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="rgba(255,255,255,0.85)">${subtitle}</text>
  </g>
</svg>`;
}

function createHostSvg(name, initials, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="hgrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color}" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#hgrad)" />
  <circle cx="200" cy="150" r="65" fill="rgba(255,255,255,0.25)" />
  <path d="M 80,350 C 80,250 320,250 320,350 Z" fill="rgba(255,255,255,0.25)" />
  <text x="200" y="170" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="800" fill="#ffffff" text-anchor="middle">${initials}</text>
  <rect x="0" y="330" width="400" height="70" fill="rgba(15,23,42,0.9)" />
  <text x="200" y="372" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" fill="#ffffff" text-anchor="middle">${name}</text>
</svg>`;
}

function createDocSvg(title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" fill="#f8fafc" rx="16" />
  <rect x="20" y="20" width="560" height="360" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" rx="12" />
  <rect x="50" y="60" width="120" height="150" fill="#e2e8f0" rx="8" />
  <circle cx="110" cy="120" r="35" fill="#94a3b8" />
  <rect x="200" y="70" width="250" height="20" fill="#1e293b" rx="4" />
  <rect x="200" y="105" width="320" height="12" fill="#64748b" rx="3" />
  <rect x="200" y="130" width="280" height="12" fill="#64748b" rx="3" />
  <rect x="200" y="155" width="200" height="12" fill="#64748b" rx="3" />
  <rect x="50" y="240" width="500" height="80" fill="#f1f5f9" rx="8" />
  <text x="70" y="285" font-family="monospace" font-size="16" font-weight="bold" fill="#334155">VERIFIED HOST DOCUMENT - ${title}</text>
</svg>`;
}

const houseIcon = `<path fill="#ffffff" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>`;

const images = {
  // Listing photos (both .jpg and .svg files written so any reference works)
  'listing-1-1.svg': createListingSvg('Beachfront Cottage', 'Santa Monica • Steps from ocean', '#0284c7', '#0f766e', houseIcon),
  'listing-1-2.svg': createListingSvg('Beachfront Cottage Interior', 'Bright living space with sea views', '#0369a1', '#0d9488', houseIcon),
  'listing-1-3.svg': createListingSvg('Ocean View Deck', 'Private deck overlooking the beach', '#075985', '#115e59', houseIcon),
  'listing-2-1.svg': createListingSvg('Modern Downtown Loft', 'Downtown LA • Skyline views', '#4f46e5', '#7c3aed', houseIcon),
  'listing-2-2.svg': createListingSvg('Loft Living Area', 'Industrial chic design & high ceilings', '#4338ca', '#6d28d9', houseIcon),
  'listing-2-3.svg': createListingSvg('Skyline Balcony', 'Nightlife & dining right downstairs', '#3730a3', '#5b21b6', houseIcon),
  'listing-3-1.svg': createListingSvg('Suburban Family Home', 'Pasadena • Safe residential neighborhood', '#16a34a', '#059669', houseIcon),
  'listing-3-2.svg': createListingSvg('Spacious Living Room', 'Ideal for families & quiet stays', '#15803d', '#047857', houseIcon),
  'listing-3-3.svg': createListingSvg('Sunny Backyard', 'Large lawn near top Pasadena parks', '#166534', '#065f46', houseIcon),
  'listing-4-2.svg': createListingSvg('Villa Pool Area', 'Santa Monica • Private pool', '#ea580c', '#dc2626', houseIcon),
  'listing-4-3.svg': createListingSvg('Luxury Villa Bedroom', 'Oceanfront luxury master suite', '#c2410c', '#b91c1c', houseIcon),
  'listing-5-1.svg': createListingSvg('Charming Artist Studio', 'Downtown LA Arts District', '#d97706', '#b45309', houseIcon),
  'listing-5-2.svg': createListingSvg('Creative Studio Space', 'Natural light for creative retreats', '#b45309', '#92400e', houseIcon),
  'listing-5-3.svg': createListingSvg('Arts District View', 'Walk to galleries & coffee shops', '#92400e', '#78350f', houseIcon),
  'listing-6-1.svg': createListingSvg('Mountain View Cabin', 'Pasadena • Secluded nature getaway', '#0d9488', '#047857', houseIcon),
  'listing-6-2.svg': createListingSvg('Rustic Cabin Fireplace', 'Cozy fireplace & wooden interior', '#0f766e', '#065f46', houseIcon),
  'listing-6-3.svg': createListingSvg('Panorama Deck', 'Hiking trails right outside your door', '#115e59', '#064e3b', houseIcon),
  'placeholder.svg': createListingSvg('Property Photo', 'Vouch Verified Listing', '#64748b', '#475569', houseIcon),

  // Host avatars and ID docs
  'host-1-id.svg': createDocSvg('Sarah Mitchell'),
  'host-1-selfie.svg': createHostSvg('Sarah Mitchell', 'SM', '#0284c7'),
  'host-2-id.svg': createDocSvg('James Chen'),
  'host-2-selfie.svg': createHostSvg('James Chen', 'JC', '#4f46e5'),
  'host-3-id.svg': createDocSvg('Maria Rodriguez'),
  'host-3-selfie.svg': createHostSvg('Maria Rodriguez', 'MR', '#16a34a'),
  'host-4-id.svg': createDocSvg('Anonymous Host'),
  'host-4-selfie.svg': createHostSvg('Anonymous Host', 'AH', '#dc2626'),
  'host-5-id.svg': createDocSvg('Alex Turner'),
  'host-5-selfie.svg': createHostSvg('Alex Turner', 'AT', '#d97706'),
  'host-6-id.svg': createDocSvg('Jennifer Park'),
  'host-6-selfie.svg': createHostSvg('Jennifer Park', 'JP', '#0d9488'),
};

// Write both .svg and .jpg filenames as SVGs so either format resolves cleanly
for (const [filename, content] of Object.entries(images)) {
  fs.writeFileSync(path.join(targetDir, filename), content);
  const jpgName = filename.replace('.svg', '.jpg');
  fs.writeFileSync(path.join(targetDir, jpgName), content);
}

console.log('Successfully created image assets in d:/Vouch/public/images');
