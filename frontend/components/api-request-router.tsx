"use client";

import { useEffect } from "react";
import { backendUrl } from "@/lib/backend-url";

function shouldRouteToBackend(pathname: string): boolean {
  return pathname.startsWith("/api/") || pathname.startsWith("/s/");
}

export default function ApiRequestRouter() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === "string") {
        if (shouldRouteToBackend(input)) {
          const nextInit = {
            ...init,
            credentials: init?.credentials ?? "include",
          };
          return originalFetch(backendUrl(input), nextInit);
        }

        return originalFetch(input, init);
      }

      if (input instanceof Request) {
        const requestUrl = new URL(input.url, window.location.origin);

        if (
          requestUrl.origin === window.location.origin &&
          shouldRouteToBackend(requestUrl.pathname)
        ) {
          const nextUrl = backendUrl(requestUrl.pathname + requestUrl.search);
          const nextRequest = new Request(nextUrl, {
            method: input.method,
            headers: input.headers,
            body: input.body,
            mode: input.mode,
            redirect: input.redirect,
            referrer: input.referrer,
            referrerPolicy: input.referrerPolicy,
            signal: input.signal,
            keepalive: input.keepalive,
            integrity: input.integrity,
            cache: input.cache,
            credentials:
              input.credentials === "same-origin"
                ? "include"
                : input.credentials,
          });
          return originalFetch(nextRequest, init);
        }
      }

      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
