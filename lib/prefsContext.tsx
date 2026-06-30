"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { addWatchHistory, getTopInterests, type WatchedVideo } from "@/lib/preferences";

interface PrefsContextValue {
  topInterests: string[];
  trackWatch: (v: Omit<WatchedVideo, "watchedAt">) => void;
}

const PrefsContext = createContext<PrefsContextValue | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [topInterests, setTopInterests] = useState<string[]>([]);

  useEffect(() => {
    setTopInterests(getTopInterests(5));
  }, []);

  const trackWatch = useCallback((v: Omit<WatchedVideo, "watchedAt">) => {
    addWatchHistory(v);
    setTopInterests(getTopInterests(5));
  }, []);

  return (
    <PrefsContext.Provider value={{ topInterests, trackWatch }}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs(): PrefsContextValue {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used inside PrefsProvider");
  return ctx;
}
