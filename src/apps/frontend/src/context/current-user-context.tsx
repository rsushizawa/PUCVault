"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "@/lib/api/auth";
import type { UserProfile } from "@/lib/api/auth";

type CurrentUserCtx = {
  user: UserProfile | null;
  loading: boolean;
  refresh: () => void;
};

const CurrentUserContext = createContext<CurrentUserCtx>({
  user: null,
  loading: true,
  refresh: () => {},
});

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  function fetchMe() {
    if (!localStorage.getItem("auth_token")) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <CurrentUserContext.Provider value={{ user, loading, refresh: fetchMe }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}
