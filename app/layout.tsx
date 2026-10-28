import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";
import "./storefront-editorial.css";
import "./site-header.css";

export const metadata: Metadata = {
  title: {
    default: "THE 1970",
    template: "%s | THE 1970",
  },
  description:
    "The 1970 — menswear inspired by vintage American style, refined for everyday wear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
