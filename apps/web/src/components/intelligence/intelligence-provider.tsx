"use client";

import { createContext, useContext } from "react";

export interface IntelligenceContextValue {
  status: "online";
}

const IntelligenceContext = createContext<IntelligenceContextValue>({
  status: "online",
});

export function IntelligenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IntelligenceContext.Provider value={{ status: "online" }}>
      {children}
    </IntelligenceContext.Provider>
  );
}

export function useIntelligence() {
  return useContext(IntelligenceContext);
}
