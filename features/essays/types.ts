export interface IBlog {
  id: number;
  name: string;
  title?: string;
  description: string;
  content?: string;
  category?: string;
  category_id?: number | null;
  image_url: string | null;
  image?: string | null;
  inspect_link?: string | null;
  buy_link?: string | null;
  video_link?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface IBlogsPagination {
  current_page: number;
  data?: IBlog[];
  total: number;
  per_page: number;
  last_page: number;
}

export interface IAdminPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}
