import { generateAllCareerInsights } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return generateAllCareerInsights().map((career) => ({
    code: career.occupationCode,
  }));
}

export default function CareerDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}