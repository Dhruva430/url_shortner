import React, { createContext, useContext, useState, ReactNode } from "react";

type AnalyticsContextType = {
  selectedShortcode: string | null;
  setSelectedShortcode: (code: string | null) => void;
};

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

export const useAnalyticsContext = () => {
  const ctx = useContext(AnalyticsContext);
  if (!ctx)
    throw new Error(
      "useAnalyticsContext must be used within AnalyticsProvider"
    );
  return ctx;
};

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const [selectedShortcode, setSelectedShortcode] = useState<string | null>(
    null
  );

  return (
    <AnalyticsContext.Provider
      value={{ selectedShortcode, setSelectedShortcode }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
