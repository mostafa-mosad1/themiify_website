export interface ThemeData {
  themeName: string;
  themePrice: string;
  salesPlatform: "salla" | "shopify" | "kajabi" | "zid" | "woocommerce";
  themeRating: number; // 1-5
  themeLink: string;
  previewLink: string;
  themeImages: File[];
}

export interface ThemeDataDTO {
  themeName: string;
  themePrice: number;
  salesPlatform: string;
  themeRating: number;
  themeLink: string;
  previewLink: string;
  themeImageUrls: string[]; 
  createdAt?: Date;
  updatedAt?: Date;
}
export interface Demo {
  id: string;
  iconName: string ;
  url: string;
  order: number;
  imageFile?: File;
  imagePreview?: string;
  imageUrl?: string;
  // _mode?: "image" | "icon" | null;
}


export interface ThemeFormProps {
  themeName: string;
  setThemeName: (value: string) => void;
  themePrice: string;
  setThemePrice: (value: string) => void;
  salesPlatform: string;
  setSalesPlatform: (value: string) => void;
  themeRating: number;
  setThemeRating: (value: number) => void;
  themeLink: string;
  setThemeLink: (value: string) => void;
  previewLink: string;
  setPreviewLink: (value: string) => void;
  themeImages: File[];
  setThemeImages: (files: File[]) => void;
  themeImagePreviews: string[];
  setThemeImagePreviews: (previews: string[]) => void;
}

export const SALES_PLATFORMS = [
  { value: "salla", label: "Salla" },
  { value: "shopify", label: "Shopify" },
  { value: "kajabi", label: "Kajabi" },
  { value: "zid", label: "Zid" },
  { value: "woocommerce", label: "WooCommerce" },
] as const;

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


export interface Activity {
  id: string | number;
  action_type?: string | { label: string; color: string };
  action_label?: string;
  action_color?: string;
  action?: string;
  title?: string;
  type?: string; 
  admin_name?: string; 
  admin_email?: string;
  admin_id?: number | string;
  is_super_admin?: boolean;
  description: string;
  tags?: string[];
  created_at: string;
}
