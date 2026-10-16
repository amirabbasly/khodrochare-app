export function MiniCar({ variant = "silver" }: { variant?: "silver" | "orange" | "blue" }) {
  const colors = {
    silver: ["#EFF4F6", "#8498A8", "#182B3A"],
    orange: ["#FFAA62", "#F47725", "#292E36"],
    blue: ["#93C5E4", "#347AA8", "#172F43"],
  };
  const [light, dark, glass] = colors[variant];
  return (
    <svg viewBox="0 0 240 120" className="mini-car-art" aria-hidden="true" fill="none">
      <ellipse cx="119" cy="101" rx="94" ry="8" fill="#0C1823" opacity=".16" />
      <path d="m25 77 12-23c5-9 13-14 24-16l28-4 25-21c5-4 11-7 18-7h22c7 0 13 3 17 9l23 26 15 6c7 3 11 9 12 16l2 14c1 6-4 11-11 11H30c-5 0-8-4-5-11Z" fill={light} stroke={dark} strokeWidth="2" />
      <path d="m93 35 25-21c4-3 9-5 14-5h19c5 0 9 2 12 6l18 20H93Z" fill={glass} stroke="#8EA1AF" strokeWidth="1.5" />
      <path d="m130 11-1 24m24-24 4 24" stroke="#72899A" strokeWidth="1.5" />
      <path d="M34 69h19m142 0h19" stroke={dark} strokeWidth="3" strokeLinecap="round" />
      <circle cx="66" cy="83" r="15" fill="#172530" stroke="#718392" strokeWidth="2" />
      <circle cx="66" cy="83" r="7" fill="#DCE3E7" /><circle cx="181" cy="83" r="15" fill="#172530" stroke="#718392" strokeWidth="2" /><circle cx="181" cy="83" r="7" fill="#DCE3E7" />
      <path d="M28 73h12m180-1h7" stroke="#FF7929" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function AiMascot() {
  return (
    <svg className="ai-mascot" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ai-bot-head" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE6C9" />
          <stop offset="1" stopColor="#FFB27B" />
        </linearGradient>
        <linearGradient id="ai-bot-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A4A60" />
          <stop offset="1" stopColor="#142C3B" />
        </linearGradient>
      </defs>
      <path d="M24 11 V6.5" stroke="#FFD3A6" strokeWidth="2.2" strokeLinecap="round" />
      <circle className="ai-mascot-orb" cx="24" cy="4.6" r="3.1" fill="#FF9A52" />
      <rect x="5.2" y="20" width="5.6" height="12.5" rx="2.8" fill="#FF9A52" />
      <rect x="37.2" y="20" width="5.6" height="12.5" rx="2.8" fill="#FF9A52" />
      <rect x="9" y="11.5" width="30" height="26.5" rx="11" fill="url(#ai-bot-head)" />
      <path d="M12.5 15.5 a9 9 0 0 1 7-3.2" stroke="#FFF1DE" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
      <rect x="13" y="16.5" width="22" height="16.5" rx="8.2" fill="url(#ai-bot-face)" />
      <g className="ai-mascot-eyes">
        <rect x="17.4" y="21.8" width="4.5" height="5.8" rx="2.25" fill="#7FD8FF" />
        <rect x="26.1" y="21.8" width="4.5" height="5.8" rx="2.25" fill="#7FD8FF" />
      </g>
      <path className="ai-mascot-smile" d="M20.6 30.6 h6.8" stroke="#7FD8FF" strokeWidth="2" strokeLinecap="round" />
      <path className="ai-mascot-spark ai-mascot-spark--one" d="M42 7.5 l1 2.1 2.1 1-2.1 1-1 2.1-1-2.1-2.1-1 2.1-1 Z" fill="#FFD9A6" />
      <path className="ai-mascot-spark ai-mascot-spark--two" d="M6.2 10.2 l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8 Z" fill="#FFD9A6" />
    </svg>
  );
}

export function ServicesScene3D() {
  return (
    <svg className="services-scene" viewBox="0 0 480 296" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sc-car-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6FAFC" />
          <stop offset="1" stopColor="#93A9BA" />
        </linearGradient>
        <linearGradient id="sc-car-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C5DEEE" />
          <stop offset="1" stopColor="#54789A" />
        </linearGradient>
        <linearGradient id="sc-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE2A8" />
          <stop offset="1" stopColor="#F0912F" />
        </linearGradient>
        <linearGradient id="sc-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFC98F" />
          <stop offset="1" stopColor="#DD6D22" />
        </linearGradient>
        <linearGradient id="sc-teal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FD8B4" />
          <stop offset="1" stopColor="#2E9C74" />
        </linearGradient>
        <radialGradient id="sc-orb" cx="0.35" cy="0.3" r="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".26" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity=".05" />
        </radialGradient>
        <radialGradient id="sc-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FF9A52" stopOpacity=".34" />
          <stop offset="1" stopColor="#FF9A52" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* backdrop glow + orbit ring */}
      <ellipse cx="238" cy="180" rx="172" ry="128" fill="url(#sc-glow)" />
      <ellipse className="scene-ring" cx="238" cy="172" rx="152" ry="92" stroke="#FFFFFF" strokeOpacity=".13" strokeDasharray="4 9" strokeWidth="1.6" />

      {/* animated links: one app connects every service */}
      <path className="scene-link scene-link--one" d="M112 132 C 138 158 168 172 192 186" stroke="#FFFFFF" strokeOpacity=".26" strokeDasharray="3 8" strokeWidth="1.8" strokeLinecap="round" />
      <path className="scene-link scene-link--two" d="M212 96 C 218 128 222 148 228 168" stroke="#FFFFFF" strokeOpacity=".26" strokeDasharray="3 8" strokeWidth="1.8" strokeLinecap="round" />
      <path className="scene-link scene-link--three" d="M318 96 C 306 128 292 148 278 168" stroke="#FFFFFF" strokeOpacity=".26" strokeDasharray="3 8" strokeWidth="1.8" strokeLinecap="round" />
      <path className="scene-link scene-link--four" d="M398 148 C 366 168 336 180 310 190" stroke="#FFFFFF" strokeOpacity=".26" strokeDasharray="3 8" strokeWidth="1.8" strokeLinecap="round" />

      {/* ground + car */}
      <ellipse cx="238" cy="248" rx="112" ry="12" fill="#0B1A26" opacity=".38" />
      <g className="scene-car">
        <path d="M152 236 v-25 a6 6 0 0 1 5-6 l23-5 21-26 a10 10 0 0 1 8-4 h38 a10 10 0 0 1 8 4 l21 26 23 5 a6 6 0 0 1 5 6 v25 a4 4 0 0 1-4 4 H156 a4 4 0 0 1-4-4 Z" fill="url(#sc-car-body)" />
        <path d="M212 175 l19-22 h28 l17 22 z" fill="url(#sc-car-glass)" />
        <path d="M226 153 l-1 22 M262 153 l2 22" stroke="#7C97AC" strokeWidth="1.6" opacity=".8" />
        <path d="M162 212 h32 M282 212 h32" stroke="#DCE7EE" strokeWidth="2.4" strokeLinecap="round" opacity=".85" />
        <rect x="152" y="221" width="14" height="5" rx="2.5" fill="#FF9A52" />
        <rect x="332" y="221" width="12" height="5" rx="2.5" fill="#FFD98F" />
        <circle cx="190" cy="237" r="18" fill="#22303C" />
        <circle cx="190" cy="237" r="8.5" fill="#E4ECF1" />
        <circle cx="300" cy="237" r="18" fill="#22303C" />
        <circle cx="300" cy="237" r="8.5" fill="#E4ECF1" />
        <path d="M244 194 h20" stroke="#B9C9D4" strokeWidth="2.6" strokeLinecap="round" />
      </g>

      {/* orb · خرید خودرو (key) */}
      <g className="scene-orb scene-orb--buy">
        <circle cx="212" cy="62" r="34" fill="url(#sc-orb)" stroke="#FFFFFF" strokeOpacity=".3" strokeWidth="1.5" />
        <g transform="rotate(-28 212 62)">
          <circle cx="203" cy="62" r="9.5" fill="url(#sc-gold)" />
          <circle cx="203" cy="62" r="4" fill="#1B3448" />
          <rect x="211" y="58.6" width="21" height="6.8" rx="2.6" fill="url(#sc-gold)" />
          <rect x="223" y="65" width="4" height="5.4" rx="1.4" fill="url(#sc-gold)" />
          <rect x="229" y="65" width="4" height="4.2" rx="1.4" fill="url(#sc-gold)" />
        </g>
      </g>

      {/* orb · لوازم یدکی (gear) */}
      <g className="scene-orb scene-orb--parts">
        <circle cx="102" cy="102" r="36" fill="url(#sc-orb)" stroke="#FFFFFF" strokeOpacity=".3" strokeWidth="1.5" />
        <g transform="translate(102 102)">
          <g className="scene-gear">
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x="-3.4" y="-19.5" width="6.8" height="8.4" rx="2" fill="url(#sc-metal)" transform={`rotate(${i * 45})`} />
            ))}
            <circle r="12.6" fill="url(#sc-metal)" />
            <circle r="5.4" fill="#1B3448" />
            <path d="M-9-9 A 12.8 12.8 0 0 1 2-12.6" stroke="#FFE3C2" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </g>
      </g>

      {/* orb · بیمه (shield) */}
      <g className="scene-orb scene-orb--insurance">
        <circle cx="318" cy="62" r="34" fill="url(#sc-orb)" stroke="#FFFFFF" strokeOpacity=".3" strokeWidth="1.5" />
        <path d="M318 42 L333 47 v8.4 c0 8-6.2 13.2-15 15.8 -8.8-2.6-15-7.8-15-15.8 V47 Z" fill="url(#sc-teal)" />
        <path d="M318 42 L333 47 v5 L318 45.8 L303 52 V47 Z" fill="#FFFFFF" opacity=".22" />
        <path d="M311.6 56.6 l4 4 7.4-8" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* orb · امداد خودرو (beacon) */}
      <g className="scene-orb scene-orb--roadside">
        <circle cx="398" cy="118" r="36" fill="url(#sc-orb)" stroke="#FFFFFF" strokeOpacity=".3" strokeWidth="1.5" />
        <circle className="beacon-glow" cx="398" cy="111" r="15" fill="#FFB871" opacity=".35" />
        <path d="M390 119 a8 8 0 0 1 16 0 Z" fill="url(#sc-gold)" />
        <rect x="386.4" y="119" width="23.2" height="5.4" rx="2.4" fill="#22384B" />
        <rect x="395.6" y="102" width="4.8" height="5" rx="2.2" fill="#FFD98F" />
        <path d="M383 105 l-4-3 M413 105 l4-3" stroke="#FFD98F" strokeWidth="2" strokeLinecap="round" opacity=".8" />
      </g>

      {/* twinkles */}
      <path className="scene-spark scene-spark--one" d="M268 42 l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4 Z" fill="#FFD9A6" />
      <path className="scene-spark scene-spark--two" d="M152 44 l1.1 2.4 2.4 1.1-2.4 1.1-1.1 2.4-1.1-2.4-2.4-1.1 2.4-1.1 Z" fill="#B9D4F2" />
      <path className="scene-spark scene-spark--three" d="M346 176 l1.1 2.4 2.4 1.1-2.4 1.1-1.1 2.4-1.1-2.4-2.4-1.1 2.4-1.1 Z" fill="#FFD9A6" />
    </svg>
  );
}
