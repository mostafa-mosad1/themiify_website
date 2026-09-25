import type { Metadata } from "next";
import { Suspense } from "react";
import ThemesClient from "./ThemesClient";

export const metadata: Metadata = {
  title: "تصفح الثيمات | Themiify",
  description: "اكتشف أفضل ثيمات سلة وزد وتوسع في تجارتك الإلكترونية بأفضل التصاميم",
};

export default function ThemesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-96 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ThemesClient />
    </Suspense>
  );
}
