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
    return DEFAULT_GUEST;
  });

  const refreshUserData = useCallback(() => {
    mutateUserData();
  }, []);

  useEffect(() => {
    if (!cachedUserState) {
      cachedUserState = parseUserDataFromStorage();
    }

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
        e.key === "isAdmin"
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
