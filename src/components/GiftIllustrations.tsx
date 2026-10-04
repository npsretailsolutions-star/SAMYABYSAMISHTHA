const GEM_SPOTS = [
  { x: 32, y: 26, r: 5, fill: "#D4AF37" },
  { x: 50, y: 16, r: 6, fill: "#F2B8C6" },
  { x: 68, y: 26, r: 5, fill: "#D4AF37" },
  { x: 41, y: 20, r: 3.5, fill: "#FFFFFF" },
  { x: 59, y: 20, r: 3.5, fill: "#FFFFFF" },
];

function Gem({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={`M0 ${-r} L${r} 0 L0 ${r} L${-r} 0 Z`}
        fill={fill}
        stroke="#ffffff"
        strokeWidth={0.6}
        opacity={0.95}
      />
      <path d={`M0 ${-r} L${r * 0.3} ${-r * 0.3} L0 0 L${-r * 0.3} ${-r * 0.3} Z`} fill="#ffffff" opacity={0.35} />
    </g>
  );
}

export function BouquetIllustration({ color = "#F2B8C6" }: { color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      {/* wrap cone */}
      <path
        d="M50 34 L84 92 Q50 102 16 92 Z"
        fill={color}
        stroke="#00000018"
        strokeWidth={1}
      />
      <path d="M50 34 L84 92 Q50 102 16 92 Z" fill="url(#bouquetShade)" opacity={0.25} />
      <defs>
        <linearGradient id="bouquetShade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#000000" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* ribbon tie */}
      <rect x="36" y="46" width="28" height="7" rx="1.5" fill="#D4AF37" />
      <path d="M44 49.5 L30 40 L34 49.5 L30 59 Z" fill="#D4AF37" />
      <path d="M56 49.5 L70 40 L66 49.5 L70 59 Z" fill="#D4AF37" />
      <circle cx="50" cy="49.5" r="4" fill="#B8860B" />
      {/* jewel "flowers" peeking out */}
      {GEM_SPOTS.map((g, i) => (
        <Gem key={i} {...g} />
      ))}
    </svg>
  );
}

export function HamperIllustration({ color = "#B9A6E0" }: { color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      {/* handle */}
      <path d="M34 56 Q50 22 66 56" fill="none" stroke="#B8860B" strokeWidth={3.5} strokeLinecap="round" />
      {/* basket body */}
      <path d="M22 56 L78 56 L70 95 L30 95 Z" fill={color} stroke="#00000018" strokeWidth={1} />
      {/* weave lines */}
      {[64, 73, 82].map((y, i) => (
        <line key={i} x1={24 + i} y1={y} x2={76 - i} y2={y} stroke="#00000022" strokeWidth={1.2} />
      ))}
      {/* bow on handle */}
      <path d="M50 56 L38 47 L42 56 L38 65 Z" fill="#D4AF37" />
      <path d="M50 56 L62 47 L58 56 L62 65 Z" fill="#D4AF37" />
      <circle cx="50" cy="56" r="4" fill="#B8860B" />
      {/* jewels peeking above rim */}
      {GEM_SPOTS.map((g, i) => (
        <Gem key={i} {...g} y={g.y + 10} />
      ))}
    </svg>
  );
}
