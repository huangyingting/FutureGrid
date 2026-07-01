import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Labor Market Pulse — FutureGrid",
  description:
    "U.S. BLS JOLTS data: monthly layoffs, hires, job openings, and quits with recession shading and industry breakdown.",
  openGraph: {
    title: "Labor Market Pulse — FutureGrid",
    description:
      "Track U.S. labor-market dynamics with JOLTS data: layoffs, hires, openings, and quits across industries.",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
  },
  twitter: {
    title: "Labor Market Pulse — FutureGrid",
    description:
      "U.S. BLS JOLTS: monthly layoffs, hires, openings, and quits with recession shading.",
  },
};

export default function PulseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
