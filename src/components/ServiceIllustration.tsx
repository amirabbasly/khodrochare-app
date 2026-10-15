import type { ReactNode } from "react";

export type ServiceId =
  | "roadside"
  | "transport"
  | "maintenance"
  | "carwash"
  | "diagnostic"
  | "insurance"
  | "fines"
  | "tolls"
  | "license"
  | "reminder"
  | "tripcheck"
  | "expert"
  | "inspection";

const drawings: Record<ServiceId, ReactNode> = {
  roadside: <>
    <path className="ink" d="m8 28 2.2-7h14l3 7m-20 0h25l2 12H5l2-12Z" />
    <path className="accent-stroke" d="M14 21h7" />
    <circle className="ink" cx="11" cy="40" r="3" /><circle className="ink" cx="29" cy="40" r="3" />
    <path className="accent-stroke" d="m30 10 6 6m-2-8 4 4-11 11-4-4L34 8Z" />
    <path className="soft-fill" d="M8 30h23v5H8z" />
    <path className="accent-stroke" d="M8 33h23" />
  </>,
  transport: <>
    <path className="ink" d="M5 18h21v17H5zM26 24h8l5 6v5H26z" />
    <path className="soft-fill" d="M29 26h4l3 4h-7z" />
    <path className="accent-stroke" d="M5 22h21M7 35h2m18 0h2" />
    <circle className="ink" cx="12" cy="36" r="3.4" /><circle className="ink" cx="32" cy="36" r="3.4" />
    <path className="accent-stroke" d="M8 13h19M10 9h14" />
  </>,
  maintenance: <>
    <path className="ink" d="M8 29 10.5 22h17l3 7m-23 0h25l2 10H6l2-10Z" />
    <circle className="ink" cx="12" cy="39" r="2.8" /><circle className="ink" cx="30" cy="39" r="2.8" />
    <path className="accent-stroke" d="M34 8a6 6 0 0 0-7.8 7.8L18 24l5 5 8.2-8.2A6 6 0 0 0 39 13l-4 4-4-1-1-4 4-4Z" />
    <path className="soft-fill" d="M11 31h19v4H11z" />
  </>,
  carwash: <>
    <path className="ink" d="m7 28 3-8h18l4 8m-25 0h27l2 12H5l2-12Z" />
    <circle className="ink" cx="12" cy="40" r="2.8" /><circle className="ink" cx="30" cy="40" r="2.8" />
    <path className="soft-fill" d="M11 22h16l3 6H9z" />
    <path className="accent-stroke" d="M12 8c0 2-2 3-2 5a2 2 0 0 0 4 0c0-2-2-3-2-5Zm13-3c0 2-2 3-2 5a2 2 0 0 0 4 0c0-2-2-3-2-5Zm10 8c0 2-2 3-2 5a2 2 0 0 0 4 0c0-2-2-3-2-5Z" />
    <path className="accent-stroke" d="M12 33h16" />
  </>,
  diagnostic: <>
    <path className="ink" d="m5 31 3-8h17l3 8m-24 0h27l2 9H4l1-9Z" />
    <circle className="ink" cx="11" cy="40" r="2.7" /><circle className="ink" cx="29" cy="40" r="2.7" />
    <path className="accent-stroke" d="M18 23v-5h7l3-5h6" />
    <circle className="accent-fill" cx="35" cy="13" r="3" />
    <circle className="accent-fill" cx="18" cy="17" r="2.6" />
    <path className="accent-stroke" d="M35 20v3m5-5 2 2m-12-1-2 2" />
    <path className="soft-fill" d="M9 32h18v3H9z" />
  </>,
  insurance: <>
    <path className="soft-fill" d="M24 5 38 10v10c0 9-6 15-14 19C16 35 10 29 10 20V10l14-5Z" />
    <path className="accent-stroke" d="M24 5 38 10v10c0 9-6 15-14 19C16 35 10 29 10 20V10l14-5Z" />
    <path className="ink" d="m14 23 2-5h13l3 5m-18 0h18l1 6H13l1-6Z" />
    <circle className="ink" cx="18" cy="29" r="1.8" /><circle className="ink" cx="29" cy="29" r="1.8" />
    <path className="accent-stroke" d="M18 13h12" />
  </>,
  fines: <>
    <path className="soft-fill" d="M8 10h23l5 5v22H8z" />
    <path className="ink" d="M8 10h23l5 5v22H8zM31 10v6h5" />
    <path className="accent-stroke" d="M14 22h15m-15 5h9m-9 5h8" />
    <circle className="accent-fill" cx="34" cy="33" r="8" />
    <path className="white-stroke" d="M31 33h6m-3-3v6" />
  </>,
  tolls: <>
    <path className="ink" d="M6 36h32M10 36V18h5v18m14 0V18h5v18M8 18h28" />
    <path className="soft-fill" d="M8 17h28l-3-7H11z" />
    <path className="accent-stroke" d="M13 17 27 8m-6 9 14-9" />
    <path className="accent-stroke" d="M17 22v9m14-9v9" />
    <path className="ink" d="M5 39h34" />
  </>,
  license: <>
    <rect className="soft-fill" x="5" y="10" width="34" height="26" rx="4" />
    <rect className="ink" x="5" y="10" width="34" height="26" rx="4" />
    <circle className="accent-fill" cx="15" cy="21" r="5" />
    <path className="white-stroke" d="M12 30c1-3 5-3 6 0" />
    <path className="accent-stroke" d="M24 18h10m-10 5h8m-8 6h5" />
    <path className="ink" d="m33 28 1.2 2.5 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4L33 28Z" />
  </>,
  reminder: <>
    <rect className="soft-fill" x="6" y="9" width="30" height="30" rx="4" />
    <rect className="ink" x="6" y="9" width="30" height="30" rx="4" />
    <path className="accent-stroke" d="M6 17h30M13 6v6m16-6v6" />
    <path className="ink" d="m25 23 3 3-7 7-4 1 1-4 7-7Z" />
    <path className="accent-stroke" d="m27 21 3 3" />
    <path className="soft-fill" d="M11 21h5v4h-5zm0 8h5v4h-5z" />
  </>,
  tripcheck: <>
    <path className="soft-fill" d="M8 10c3-4 8-4 11 0l6 8c2 3 0 8-4 9l-6 2c-3 1-5 4-4 7" />
    <path className="ink" d="M8 10c3-4 8-4 11 0l6 8c2 3 0 8-4 9l-6 2c-3 1-5 4-4 7" />
    <path className="accent-stroke" d="M25 15c0-5 4-8 8-8s8 3 8 8c0 6-8 13-8 13s-8-7-8-13Z" />
    <circle className="accent-fill" cx="33" cy="15" r="2.5" />
    <path className="ink" d="M9 39h29" />
  </>,
  expert: <>
    <path className="soft-fill" d="M8 22a16 16 0 0 1 32 0v8h-6v-8a10 10 0 0 0-20 0v8H8z" />
    <path className="accent-stroke" d="M8 22a16 16 0 0 1 32 0v8h-6v-8a10 10 0 0 0-20 0v8H8z" />
    <rect className="ink" x="6" y="22" width="9" height="14" rx="4" />
    <rect className="ink" x="33" y="22" width="9" height="14" rx="4" />
    <path className="ink" d="M36 36c-2 4-6 5-11 5" />
    <path className="accent-stroke" d="M19 27h10m-10 5h7" />
  </>,
  inspection: <>
    <path className="ink" d="m5 26 3-7h17l4 7m-25 0h27l2 10H4l1-10Z" />
    <circle className="ink" cx="11" cy="36" r="2.5" /><circle className="ink" cx="28" cy="36" r="2.5" />
    <path className="soft-fill" d="M9 21h14l3 5H7z" />
    <circle className="accent-stroke" cx="32" cy="14" r="7" />
    <path className="accent-stroke" d="m37 19 5 5" />
    <path className="accent-stroke" d="m29 14 2 2 4-4" />
  </>,
};

export function ServiceIllustration({ type }: { type: ServiceId }) {
  return (
    <span className={`service-art service-art--${type}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        {drawings[type]}
      </svg>
    </span>
  );
}
