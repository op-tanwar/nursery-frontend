import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: "customer" | "nursery" | "admin";
  avatar?: string;
}

interface AuthState {
  user: UserPayload | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserPayload; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;

      if (typeof window !== "undefined") {
        localStorage.setItem("urban_nursery_token", action.payload.token);
        localStorage.setItem("urban_nursery_role", action.payload.user.role);
        localStorage.setItem("urban_nursery_user", JSON.stringify(action.payload.user));
        localStorage.setItem("planto_token", action.payload.token);
        localStorage.setItem("planto_role", action.payload.user.role);
        localStorage.setItem("planto_user", JSON.stringify(action.payload.user));
      }
    },
    hydrateAuth: (state) => {
      // 👑 FIXED: Hard refresh par Redux state flush hone se bachata hai
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("urban_nursery_token") || localStorage.getItem("planto_token");
        const role = (localStorage.getItem("urban_nursery_role") || localStorage.getItem("planto_role")) as any;
        const userStr = localStorage.getItem("urban_nursery_user") || localStorage.getItem("planto_user");

        if (token && role && userStr) {
          state.token = token;
          state.user = JSON.parse(userStr);
          state.isAuthenticated = true;
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("urban_nursery_token");
        localStorage.removeItem("urban_nursery_role");
        localStorage.removeItem("urban_nursery_user");
        localStorage.removeItem("planto_token");
        localStorage.removeItem("planto_role");
        localStorage.removeItem("planto_user");

        // Clear cookies manually on logout context
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax; Secure;";
        document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax; Secure;";
      }
    },
  },
});

export const { setAuthLoading, setCredentials, hydrateAuth, logout } = authSlice.actions;
export default authSlice.reducer;