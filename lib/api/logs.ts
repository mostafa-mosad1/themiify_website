// lib/api/logs.ts
import { apiClient } from "./config";

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

export async function fetchAdminLogs(
  token?: string | null,
  page?: number
): Promise<{ logs: ILog[]; pagination?: IPaginationMeta }> {
  try {
    const url = page ? `/admin/logs?page=${page}` : `/admin/logs`;
    const res = await apiClient<any>(url, {}, token);

    if (res.success && res.data) {
      let rawList: any[] = [];
      let pagination: IPaginationMeta | undefined = undefined;

      if (Array.isArray(res.data)) {
        rawList = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        rawList = res.data.data;
        pagination = {
          current_page: Number(res.data.current_page) || (page || 1),
          last_page: Number(res.data.last_page) || 1,
          per_page: Number(res.data.per_page) || 15,
          total: Number(res.data.total) || rawList.length,
          from: res.data.from,
          to: res.data.to,
        };
      } else if (Array.isArray(res.data.logs)) {
        rawList = res.data.logs;
      }

      return { logs: rawList, pagination };
    }
    return { logs: [] };
  } catch (error) {
    console.error("❌ Error fetching logs:", error);
    return { logs: [] };
  }
}
