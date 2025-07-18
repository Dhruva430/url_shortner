"use client";

import { useQuery } from "@tanstack/react-query";
import { LinkData } from "../types";

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

      return res.json();
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { links, isLoading, error, refetch };
}
