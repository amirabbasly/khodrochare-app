import type { ReactNode } from "react";

export function HeroCar() {
  return (
    <svg className="hero-car-art" viewBox="0 0 520 300" fill="none" aria-hidden="true">
      <ellipse cx="283" cy="251" rx="196" ry="20" fill="#07131D" opacity=".3" />
      <circle cx="340" cy="156" r="118" fill="#FF8A36" opacity=".13" />
      <circle cx="340" cy="156" r="83" stroke="#FFB17D" strokeOpacity=".2" />
      <circle cx="340" cy="156" r="60" stroke="#FFB17D" strokeOpacity=".18" />
      <path d="m92 192 22-48c9-20 26-32 47-36l56-10 57-49c12-10 27-15 43-15h45c14 0 28 7 37 18l49 59 30 12c13 5 22 17 25 31l5 38c2 15-9 27-24 27H102c-14 0-17-13-10-27Z" fill="url(#body)" stroke="#E3EAF1" strokeWidth="2" />
      <path d="m177 104 53-9 54-46c10-8 21-12 34-12h38c10 0 19 5 26 13l43 54H177Z" fill="#182B3A" stroke="#AEBECA" strokeOpacity=".8" strokeWidth="2" />
      <path d="m236 96 52-48m8-11v59m19-59 3 59" stroke="#8297A8" strokeOpacity=".55" strokeWidth="2" />
      <path d="m107 183 13-31h47l-12 40h-52m361-40 29 10 4 27h-31l-2-37Z" fill="#FFD8C3" />
      <path d="m107 183 13-31h47l-12 40h-52m361-40 29 10 4 27h-31l-2-37Z" stroke="#F5AE7F" strokeWidth="2" />
      <path d="M185 194h225" stroke="#233C4E" strokeWidth="2" strokeLinecap="round" />
      <path d="m105 200 22 4m322-5 31-2" stroke="#FF7929" strokeWidth="4" strokeLinecap="round" />
      <circle cx="176" cy="205" r="38" fill="#0D1822" stroke="#9EADB9" strokeWidth="3" />
      <circle cx="176" cy="205" r="23" fill="#253B4D" stroke="#E8EDF1" strokeWidth="2" />
      <circle cx="176" cy="205" r="7" fill="#FF7929" />
      <path d="m176 183 3 14m18 8-14 3m-7 20-3-14m-18-8 14-3m18-8-10 10m-20 20 10-10m20 1-10-10m-20-20 10 10" stroke="#C4D0D9" strokeWidth="2" strokeLinecap="round" />
      <circle cx="418" cy="205" r="38" fill="#0D1822" stroke="#9EADB9" strokeWidth="3" />
      <circle cx="418" cy="205" r="23" fill="#253B4D" stroke="#E8EDF1" strokeWidth="2" />
      <circle cx="418" cy="205" r="7" fill="#FF7929" />
      <path d="m418 183 3 14m18 8-14 3m-7 20-3-14m-18-8 14-3m18-8-10 10m-20 20 10-10m20 1-10-10m-20-20 10 10" stroke="#C4D0D9" strokeWidth="2" strokeLinecap="round" />
      <path d="m377 40 6-13 6 13 13 6-13 6-6 13-6-13-13-6 13-6Z" fill="#FF9A52" />
      <path d="m96 94 4-8 4 8 8 4-8 4-4 8-4-8-8-4 8-4Z" fill="#EAF3FC" opacity=".72" />
      <defs>
        <linearGradient id="body" x1="110" y1="115" x2="496" y2="216" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBFCFD" /><stop offset=".46" stopColor="#B9C7D1" /><stop offset="1" stopColor="#778B9A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

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

const promoDrawings: Record<string, ReactNode> = {
  parts: <>
    <circle cx="108" cy="68" r="39" fill="#FFE5D2" />
    <circle cx="108" cy="68" r="25" stroke="#F47B32" strokeWidth="8" />
    <circle cx="108" cy="68" r="10" fill="#17364A" />
    <path d="M103 29v13m10-13v13M103 94v13m10-13v13M69 63h13m-13 10h13m52-10h13m-13 10h13M81 41l9 9m36 36 9 9m-54 0 9-9m36-36 9-9" stroke="#17364A" strokeWidth="3" strokeLinecap="round" />
    <rect x="126" y="46" width="33" height="39" rx="7" fill="#17364A" transform="rotate(13 126 46)" />
    <path d="m137 56 13 3m-15 5 10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </>,
  auction: <>
    <path d="m72 95 47-47m-57 39 17 17m28-61 17 17" stroke="#17364A" strokeWidth="8" strokeLinecap="round" />
    <path d="m126 31 12-12 25 25-12 12zm-11 13 12-12 19 19-12 12z" fill="#FF9A56" stroke="#D96F26" strokeWidth="2" />
    <path d="M68 112h88" stroke="#17364A" strokeWidth="5" strokeLinecap="round" />
    <circle cx="148" cy="83" r="25" fill="#FFE5D2" /><path d="m136 84 8 8 15-18" stroke="#F47B32" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  app: <>
    <rect x="80" y="18" width="55" height="98" rx="14" fill="#17364A" />
    <rect x="86" y="27" width="43" height="76" rx="8" fill="#FFF9F4" />
    <path d="M95 83V66l8-8 8 8 8-17" stroke="#F47B32" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="108" cy="110" r="2.4" fill="#E8EBED" />
    <path d="m145 35 5-10 5 10 10 5-10 5-5 10-5-10-10-5 10-5Z" fill="#FF9A56" />
    <circle cx="65" cy="86" r="12" fill="#FFE5D2" /><path d="M60 86h10m-5-5v10" stroke="#F47B32" strokeWidth="2.5" strokeLinecap="round" />
  </>,
  coverage: <>
    <path d="M69 95c18-34 26-43 48-68m-46 73c26-24 44-35 75-42m-61 45c34-5 52-14 79-37" stroke="#A9C5CE" strokeWidth="9" strokeLinecap="round" />
    <path d="M127 28c0-17 13-28 28-28s28 11 28 28c0 20-28 47-28 47s-28-27-28-47Z" fill="#F47B32" transform="translate(-7 12) scale(.86)" />
    <circle cx="148" cy="35" r="8" fill="#FFF8F1" />
    <circle cx="76" cy="92" r="5" fill="#17364A" /><circle cx="133" cy="65" r="5" fill="#17364A" />
  </>,
  inspection: <>
    <path d="m48 73 10-23h53l13 23m-79 0h80l4 22H42l6-22Z" fill="#DDE9EF" stroke="#17364A" strokeWidth="3" />
    <path d="m65 51 9-13h31l8 13" fill="#17364A" />
    <circle cx="65" cy="95" r="9" fill="#17364A" /><circle cx="116" cy="95" r="9" fill="#17364A" />
    <circle cx="137" cy="40" r="22" fill="#FFF9F4" stroke="#F47B32" strokeWidth="7" />
    <path d="m153 57 20 20" stroke="#17364A" strokeWidth="9" strokeLinecap="round" />
    <path d="m130 39 5 5 10-12" stroke="#F47B32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  diagnostic: <>
    <rect x="62" y="18" width="57" height="93" rx="13" fill="#17364A" />
    <rect x="68" y="27" width="45" height="73" rx="7" fill="#E9F4F7" />
    <path d="M76 78h7l7-18 9 25 6-13h4" stroke="#F47B32" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="91" cy="106" r="2.3" fill="#E9F4F7" />
    <path d="M140 39c12 6 18 17 18 29m-18-20c7 4 10 10 10 18m-10-8v10" stroke="#F47B32" strokeWidth="4" strokeLinecap="round" />
    <circle cx="140" cy="80" r="5" fill="#17364A" />
  </>,
};

export function PromoArtwork({ type }: { type: string }) {
  const drawing = promoDrawings[type] ?? promoDrawings.app;
  return (
    <svg className="promo-art" viewBox="0 0 220 132" fill="none" aria-hidden="true">
      {drawing}
    </svg>
  );
}
