import fs from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "public", "images", "products");
fs.mkdirSync(outDir, { recursive: true });

const palettes = [
  ["#0b3d3a", "#124a45", "#d4af37"],
  ["#0f4d47", "#1a5c55", "#e3c565"],
  ["#0b3d3a", "#1f6e64", "#f0d68a"],
  ["#093330", "#155950", "#c9a84c"],
];

const icons = {
  necklace: `<path d="M60 30 C60 70, 140 70, 140 30" stroke="{gold}" stroke-width="4" fill="none"/>
    <circle cx="100" cy="95" r="16" fill="{gold}"/>
    <circle cx="100" cy="95" r="8" fill="{dark}"/>`,
  earrings: `<circle cx="75" cy="55" r="10" fill="{gold}"/>
    <path d="M75 65 L75 95" stroke="{gold}" stroke-width="3"/>
    <circle cx="75" cy="105" r="12" fill="{gold}" opacity="0.9"/>
    <circle cx="125" cy="55" r="10" fill="{gold}"/>
    <path d="M125 65 L125 95" stroke="{gold}" stroke-width="3"/>
    <circle cx="125" cy="105" r="12" fill="{gold}" opacity="0.9"/>`,
  bangles: `<circle cx="100" cy="80" r="45" stroke="{gold}" stroke-width="8" fill="none"/>
    <circle cx="100" cy="80" r="30" stroke="{gold}" stroke-width="4" fill="none" opacity="0.6"/>`,
  pendants: `<path d="M100 35 L120 65 L100 130 L80 65 Z" fill="{gold}"/>
    <circle cx="100" cy="65" r="10" fill="{dark}"/>`,
  gifting: `<rect x="55" y="70" width="90" height="60" rx="4" fill="{gold}" opacity="0.85"/>
    <rect x="55" y="70" width="90" height="16" fill="{dark}" opacity="0.4"/>
    <rect x="95" y="70" width="10" height="60" fill="{dark}" opacity="0.5"/>
    <path d="M100 70 C 85 45, 60 45, 65 60 C 68 72, 90 70, 100 70 C 110 70, 132 72, 135 60 C 140 45, 115 45, 100 70 Z" fill="{dark}" opacity="0.5"/>`,
};

function svg(category, variant) {
  const [c1, c2, gold] = palettes[variant % palettes.length];
  const icon = (icons[category] || icons.pendants)
    .replaceAll("{gold}", gold)
    .replaceAll("{dark}", "#062522");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="${gold}" opacity="0.15"/>
    </pattern>
  </defs>
  <rect width="200" height="200" fill="url(#g)"/>
  <rect width="200" height="200" fill="url(#dots)"/>
  <rect x="6" y="6" width="188" height="188" fill="none" stroke="${gold}" stroke-width="1" opacity="0.5"/>
  <g>${icon}</g>
  <text x="100" y="175" font-family="Georgia, serif" font-size="10" fill="${gold}" text-anchor="middle" letter-spacing="2" opacity="0.85">SAMYA</text>
</svg>`;
}

const categories = ["necklace", "earrings", "bangles", "pendants", "gifting"];
let count = 0;
for (const cat of categories) {
  for (let i = 0; i < 5; i++) {
    const file = path.join(outDir, `${cat}-${i + 1}.svg`);
    fs.writeFileSync(file, svg(cat, i));
    count++;
  }
}
console.log(`Generated ${count} placeholder images in ${outDir}`);
