export interface ILogActionType {
  label: string;
  color: string;
}

export interface ILogAdmin {
  id: number;
  name: string | null;
}

export interface ILog {
  id: number | string;
  action: string;
  action_type?: ILogActionType | string;
  title?: string;
  description?: string;
  tags?: string[];
  admin?: ILogAdmin | null;
  user_id?: string | null;
  user_email?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  details?: any;
  created_at: string;
}

export interface IPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}
