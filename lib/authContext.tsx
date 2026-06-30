"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  // If linked to a real Google account, YouTube history sync is possible
  googleLinked: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "unrealtube_auth";

function loadUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function saveUser(u: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  else localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(loadUser());
    setLoading(false);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // Open Google OAuth popup — redirect to our /api/auth/google route
    const width = 500, height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      "/api/auth/google",
      "google-signin",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    // Listen for message from popup
    return new Promise<void>((resolve) => {
      const handler = (e: MessageEvent) => {
        if (e.origin !== window.location.origin) return;
        if (e.data?.type === "google-auth-success") {
          const u: AuthUser = e.data.user;
          setUser(u);
          saveUser(u);
          window.removeEventListener("message", handler);
          popup?.close();
          resolve();
        }
      };
      window.addEventListener("message", handler);
      // Fallback: if popup closes without message, resolve anyway
      const check = setInterval(() => {
        if (popup?.closed) { clearInterval(check); resolve(); }
      }, 500);
    });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    saveUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
