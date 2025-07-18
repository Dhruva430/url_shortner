export interface LinkData {
  id: string;
  title: string;
  original_url: string;
  short_url: string;
  clicks: number;
  created_at: string;
  password: boolean;
  thumbnail?: string;
  is_expired?: boolean;
  expire_at?: string;
}
