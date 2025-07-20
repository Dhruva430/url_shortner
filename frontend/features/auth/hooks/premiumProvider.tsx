"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

type PremiumContextType = {
  isPremium: boolean;
  isLoading: boolean;
};

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

async function fetchPremiumStatus(): Promise<{ isPremium: boolean }> {
  const res = await fetch("/api/protected/premium", { credentials: "include" });
  if (!res.ok) throw new Error("Not premium");
  return res.json();
}

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["premium"],
    queryFn: fetchPremiumStatus,
    retry: false,
  });

  return (
    <PremiumContext.Provider
      value={{
        isPremium: !isLoading && !isError && data?.isPremium === true,
        isLoading,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
}
