export interface LinkData {
  id: string;
  title: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  status: "Active" | "Protected" | "Expired";
  thumbnail?: string;
  expireAt?: string;
}
