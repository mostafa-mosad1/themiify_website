import type { IBlog } from "./types";

export function formatEssayDate(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString || "-";
  }
}

export function formatEssayEditData(blog: IBlog) {
  return {
    id: blog.id,
    title: blog.title || blog.name || "",
    name: blog.name || blog.title || "",
    description: blog.description || "",
    content: blog.content || blog.description || "",
    image_url: blog.image_url || blog.image || null,
    category: blog.category || "",
    category_id: blog.category_id || null,
    created_at: blog.created_at || "",
  };
}

export const defaultEssayInitialData = {
  title: "",
  name: "",
  description: "",
  content: "",
  image_url: null,
  category: "",
  category_id: null,
};
