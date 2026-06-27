import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { User } from "../types";

interface AuthStateStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStateStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username, password) => {
        try {
          const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const response = await axios.post(`${apiURL}/api/auth/login`, {
            username,
            password,
          });
          const { access_token } = response.data;
          
          // Fetch complete user profile info
          const meResponse = await axios.get(`${apiURL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${access_token}` }
          });
          
          const user: User = meResponse.data;
          user.email = user.username; // keep old page compile check and runtime display happy

          set({
            user,
            token: access_token,
            isAuthenticated: true,
          });

          // Sync auth state to cookie for Next.js middleware access
          if (typeof window !== "undefined") {
            const cookieVal = JSON.stringify({ state: { token: access_token, user, isAuthenticated: true } });
            document.cookie = `route53-auth=${encodeURIComponent(cookieVal)}; path=/; max-age=86400`;
          }
        } catch (error) {
          const err = error as { response?: { data?: { detail?: string } }; message?: string };
          const message = err.response?.data?.detail || err.message || "An error occurred";
          throw new Error(message);
        }
      },

      logout: async () => {
        const token = get().token;
        
        // 1. Clear local state and cookie immediately to prevent middleware race conditions
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem("route53-auth");
        if (typeof window !== "undefined") {
          document.cookie = "route53-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        
        // 2. Perform backend API logout call in the background
        if (token) {
          const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          try {
            axios.post(
              `${apiURL}/api/auth/logout`,
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ).catch(() => {});
          } catch {
            // ignore
          }
        }
      },

      checkAuth: () => {
        return get().isAuthenticated;
      },

      setUser: (user) => {
        if (user) {
          user.email = user.username;
        }
        set({ user });
        if (typeof window !== "undefined") {
          const token = get().token;
          const isAuthenticated = get().isAuthenticated;
          const cookieVal = JSON.stringify({ state: { token, user, isAuthenticated } });
          document.cookie = `route53-auth=${encodeURIComponent(cookieVal)}; path=/; max-age=86400`;
        }
      },
    }),
    {
      name: "route53-auth",
    }
  )
);
