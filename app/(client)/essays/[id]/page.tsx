import type { Metadata } from "next";
import EssayDetailClient from "./EssayDetailClient";

export const metadata: Metadata = {
  title: "تفاصيل المقالة | Themiify",
  description: "دليلك لتجربة متجر أفضل في Themiify",
};

export default function EssayDetailPage() {
  return <EssayDetailClient />;
}
