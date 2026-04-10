import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Itra — Luxury Perfumes",
  description: "Discover rare & exquisite fragrances from around the world",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="grain-overlay" />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
