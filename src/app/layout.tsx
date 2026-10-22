import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kenneth & Danielle | Our Wedding Day",
  description:
    "Join Kenneth Medez and Danielle Kayle Antonio in Tagaytay on May 22, 2027, for an afternoon of love, laughter, and celebration.",
  openGraph: {
    title: "Kenneth & Danielle | Our Wedding Day",
    description: "A little bit of forever begins on May 22, 2027.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
