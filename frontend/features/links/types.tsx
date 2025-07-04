export interface LinkData {
  id: string;
  title: string;
  original_url: string;
  short_url: string;
  clicks: number;
  created_at: string;
  status: "Active" | "Protected" | "Expired";
  thumbnail?: string;
  expire_at?: string;
}
