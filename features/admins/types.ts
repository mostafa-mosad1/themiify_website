export interface IAdminAccount {
  id: number;
  email: string;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface IPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}
