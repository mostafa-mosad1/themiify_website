export interface IPlatform {
  id: number;
  name: string;
  image?: string | null;
  image_url?: string | null;
  icon?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface IPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}
