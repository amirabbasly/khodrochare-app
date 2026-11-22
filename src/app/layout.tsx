import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { PwaBootstrap, SplashGate } from "@/components/AppExperience";
import { AppZoomGuard } from "@/components/AppZoomGuard";
import { PendingFeatureProvider } from "@/components/PendingFeature";
import { SessionProvider } from "@/lib/session";
import { CustomerProfileListener } from "@/lib/customer-auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "خودرو چاره | همه‌چیز برای ماشینت، یک‌جا",
  description: "خدمات جامع خودرویی، امداد، سرویس، قطعات و بازار خودرو در خودرو چاره.",
  applicationName: "خودرو چاره",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "خودرو چاره",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/khodrochare-symbol.png", sizes: "600x600", type: "image/png" },
    ],
    apple: [{ url: "/khodrochare-symbol.png", sizes: "600x600", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#112a38",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "auto",
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <AppZoomGuard />
        <PwaBootstrap />
        <SessionProvider><PendingFeatureProvider><CustomerProfileListener/><SplashGate>{children}</SplashGate></PendingFeatureProvider></SessionProvider>
      </body>
    </html>
  );
}
