import type { Metadata } from "next";
import { Suspense } from "react";
import EssaysClient from "./EssaysClient";

export const metadata: Metadata = {
  title: "المقالات والدليل التعليمي | Themiify",
  description: "دليلك لتجربة متجر أفضل ومحتوى مبني على أفضل ممارسات التجارة الإلكترونية",
};

export default function EssaysPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-96 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EssaysClient />
    </Suspense>
  );
}
