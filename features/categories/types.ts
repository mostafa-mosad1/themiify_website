export interface ICategory {
  id: number;
  name: string;
  theme_name?: string | null;
  image?: string | null;
  image_url?: string | null;
  color?: string | null;
  icon?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}
