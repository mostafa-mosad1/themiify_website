"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DEFAULT_GUEST,
  mutateUserData,
  parseUserDataFromStorage,
  listeners,
} from "../functions";
import type { UserData } from "../types";

let cachedUserState: UserData | null = null;

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData>(() => {
    if (cachedUserState) return cachedUserState;
    if (typeof window !== "undefined") {
      try {
        const parsed = parseUserDataFromStorage();
        if (parsed.isLoggedIn) {
          cachedUserState = parsed;
          return parsed;
        }
      } catch {}
    }
    return DEFAULT_GUEST;
  });

  const refreshUserData = useCallback(() => {
    mutateUserData();
  }, []);

  useEffect(() => {
    // Always sync fresh state on client mount
    const current = parseUserDataFromStorage();
    cachedUserState = current;
    setUserData(current);

    const handleChange = (newState: UserData) => {
      setUserData(newState);
    };

    listeners.add(handleChange);

    const handleStorageChange = (e: StorageEvent) => {
      if (
        !e.key ||
        e.key === "userData" ||
        e.key === "authToken" ||
        e.key === "userRole" ||
        e.key === "isAdmin" ||
        e.key === "localAuthSession"
      ) {
        mutateUserData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      listeners.delete(handleChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return { ...userData, refreshUserData };
};
