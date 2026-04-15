const configuredBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:8080");

export const BACKEND_BASE_URL = configuredBaseUrl.endsWith("/")
  ? configuredBaseUrl.slice(0, -1)
  : configuredBaseUrl;

export function backendUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!BACKEND_BASE_URL) {
    return normalizedPath;
  }
  return `${BACKEND_BASE_URL}${normalizedPath}`;
}
