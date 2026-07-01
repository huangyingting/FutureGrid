import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Labor Market — FutureGrid",
  description:
    "Explore US labor market turnover trends (BLS JOLTS) and layoff notices (WARN Act filings) in one view.",
  openGraph: {
    title: "Labor Market — FutureGrid",
    description:
      "Turnover trends and layoff notices — BLS JOLTS data and WARN Act filings.",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
  },
  twitter: {
    title: "Labor Market — FutureGrid",
    description:
      "Explore US labor market turnover trends and layoff notices in one tabbed view.",
  },
};

export default function LaborLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
