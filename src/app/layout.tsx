import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "خودرو چاره | همه‌چیز برای ماشینت، یک‌جا",
  description: "خدمات جامع خودرویی، امداد، سرویس، قطعات و بازار خودرو در خودرو چاره.",
  applicationName: "خودرو چاره",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
