export interface IFeedbackPayload {
  full_name: string;
  phone_number: string;
  email?: string;
  store_link?: string;
  profession: string;
  rating: number;
  experience_feedback?: string;
  had_difficulty: boolean;
  difficulty_details?: string | null;
  improvements_suggestions?: string;
  recommendation: string;
  page_url?: string;
}

export interface IFeedbackItem {
  id: number;
  user_id?: string;
  full_name?: string;
  fullName?: string;
  phone_number?: string;
  phoneNumber?: string;
  email?: string;
  store_link?: string;
  storeLink?: string;
  profession?: string;
  rating?: number | string;
  overall_rating?: string;
  overallRating?: number | string;
  experience_feedback?: string;
  experienceFeedback?: string;
  had_difficulty?: boolean;
  hadDifficulty?: boolean;
  difficulty_details?: string | null;
  difficultyDetails?: string;
  improvements_suggestions?: string;
  improvementsSuggestions?: string;
  recommendation?: string | boolean;
  page_url?: string;
  pageUrl?: string;
  status?: string;
  admin_notes?: string;
  adminNotes?: string;
  created_at?: string;
  updated_at?: string;
}
