import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore — Interactive AI Job Data",
  description:
    "Interactively explore AI exposure across 756 occupations with beeswarm, treemap, and quadrant charts. Filter by sector and risk band.",
  openGraph: {
    title: "Explore — Interactive AI Job Data",
    description:
      "Interactively explore AI exposure across 756 occupations. See which sectors and roles face the most disruption.",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
  },
  twitter: {
    title: "Explore — Interactive AI Job Data",
    description:
      "Interactively explore AI exposure across 756 occupations with beeswarm, treemap, and quadrant charts.",
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
