/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IThemeCategory {
  id: number;
  name: string;
  icon?: string | null;
  description?: string | null;
}

export interface IThemePlatform {
  id: number;
  name: string;
  icon?: string | null;
  description?: string | null;
}

export interface ITheme {
  id: number;
  name: string;
  platform_id?: number | null;
  category_id?: number | null;
  platform_name?: string | null;
  category_name?: string | null;
  price?: string | number | null;
  rating?: string | number | null;
  rating_count?: number | null;
  purchase_count?: number | null;
  platform_rank?: number | null;
  banner_url?: string | null;
  image_url?: string | null;
  images?: string[];
  inspect_link?: string | null;
  buy_link?: string | null;
  video_link?: string | null;
  playlist_link?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  category?: IThemeCategory | null;
  platform?: IThemePlatform | null;
  pages_count?: number;
  is_visible?: boolean;
  related_themes?: ITheme[];
  theme_pages?: any[];
  demos?: any[];
  pages?: any;
}

export interface IThemesPagination {
  current_page: number;
  data: ITheme[];
  total: number;
  per_page: number;
  last_page: number;
  first_page_url?: string;
  last_page_url?: string;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  from?: number;
  to?: number;
  links?: {
    url: string | null;
    label: string;
    page?: number | null;
    active: boolean;
  }[];
}
