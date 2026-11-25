import type { Metadata, Viewport } from "next";
import {chunkRecoveryScript} from "@/lib/chunk-recovery";
import "./interaction.css";
import type { ReactNode } from "react";
import { PwaBootstrap, SplashGate } from "@/components/AppExperience";
import { IOSInstallationGate } from "@/components/IOSInstallationGate";
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
      <head><link rel="preload" href="/fonts/Vazir.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><script dangerouslySetInnerHTML={{__html:chunkRecoveryScript}}/></head>
      <body>
        <AppZoomGuard />
        <PwaBootstrap />
        <IOSInstallationGate><SessionProvider><PendingFeatureProvider><CustomerProfileListener/><SplashGate>{children}</SplashGate></PendingFeatureProvider></SessionProvider></IOSInstallationGate>
      </body>
    </html>
  );
}
