export interface ISupportCategory {
  id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  question_count?: number;
  order_index?: number;
  is_active?: boolean;
  questions?: unknown[];
  blogs?: unknown[];
}

export interface ISupportQuestion {
  id: number;
  category_id: number;
  question: string;
  answer: string;
  order_index?: number;
  is_active?: boolean;
  category?: {
    id: number;
    name: string;
  } | null;
  category_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ISupportChannel {
  id: number;
  name: string;
  name_ar?: string | null;
  type?: string | null;
  value: string;
  icon?: string | null;
  order_index?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IFaq {
  id: number;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}
