import { apiClient } from "./config";

export interface IStatCard {
  key: string;
  title: string;
  count: number;
}

export interface IAdminStatisticsResponse {
  stats_cards: IStatCard[];
}

export async function fetchAdminStatistics(
  token?: string | null
): Promise<{ stats_cards: IStatCard[] }> {
  try {
    const res = await apiClient<IAdminStatisticsResponse>(
      "/admin/statistics",
      { forceRefresh: true },
      token
    );

    if (res.success && res.data?.stats_cards) {
      return { stats_cards: res.data.stats_cards };
    }

    // Fallback if res.data is directly the stats array or another structure
    if (res.success && Array.isArray((res.data as any))) {
      return { stats_cards: res.data as any };
    }

    return { stats_cards: [] };
  } catch (error) {
    console.error("❌ Error fetching admin statistics:", error);
    return { stats_cards: [] };
  }
}
