import type { Metadata } from "next";
import FeedbackFormClient from "./FeedbackFormClient";

export const metadata: Metadata = {
  title: "نموذج تقييم التجربة | Themiify",
  description: "شاركنا تجربتك وملاحظاتك لمساعدتنا في تحسين خدمات Themiify",
};

export default function FeedbackFormPage() {
  return <FeedbackFormClient />;
}
