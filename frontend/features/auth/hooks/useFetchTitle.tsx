"use client";

import { useEffect, useState } from "react";

export function useFetchTitle(url: string) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url || url.length < 10) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/protected/title?url=${encodeURIComponent(url)}`,
          {
            signal: controller.signal,
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Failed to fetch title");

        const data = await res.json();
        setTitle(data.title);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Could not fetch title");
        }
      } finally {
        setLoading(false);
      }
    }); // debounce

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [url]);

  return { title, loading, error };
}
