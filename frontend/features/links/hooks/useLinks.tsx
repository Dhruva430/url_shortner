"use client";

import { useQuery } from "@tanstack/react-query";
import { LinkData } from "../types";

function getShortcode(shortUrl: string): string {
  if (!shortUrl) return "";

  try {
    const parsed = new URL(shortUrl);
    return parsed.pathname.split("/").filter(Boolean).pop() ?? "";
  } catch {
    return shortUrl.split("/").filter(Boolean).pop() ?? "";
  }
}

function formatShortUrl(shortUrl: string, isProtected: boolean): string {
  const shortcode = getShortcode(shortUrl);
  if (!shortcode) return shortUrl;

  if (isProtected) {
    return `${window.location.origin}/redirect/${shortcode}`;
  }

  return `${window.location.origin}/s/${shortcode}`;
}

export function useLinks() {
  const {
    data: links,
    isLoading,
    error,
    refetch,
  } = useQuery<LinkData[]>({
    queryKey: ["links"],
    queryFn: async () => {
      const res = await fetch("/api/protected/links", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch links");

      const data = (await res.json()) as LinkData[];
      return data.map((link) => ({
        ...link,
        short_url: formatShortUrl(link.short_url, !!link.password),
      }));
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { links, isLoading, error, refetch };
}
