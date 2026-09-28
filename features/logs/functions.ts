import { apiClient } from "@/lib/api/config";
import type { ILogActionType, ILogAdmin, ILog, IPaginationMeta } from "./types";
export type { ILogActionType, ILogAdmin, ILog, IPaginationMeta };

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
