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
