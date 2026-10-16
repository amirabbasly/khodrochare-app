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
