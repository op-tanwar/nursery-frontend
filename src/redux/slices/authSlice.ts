import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserPayload {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: "customer" | "nursery" | "admin" | "user";
  avatar?: any;
}

export interface AuthState {
  user: UserPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
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
      action: PayloadAction<{ user: UserPayload; token?: string }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    hydrateAuth: (state) => {
      // Session verification is driven automatically by server-set httpOnly cookies
      // and verified on initialization via GET /auth/me or GET /users/me
      if (!state.user) {
        state.isAuthenticated = false;
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("urban_nursery_token");
        localStorage.removeItem("urban_nursery_role");
        localStorage.removeItem("urban_nursery_user");
        localStorage.removeItem("planto_token");
        localStorage.removeItem("planto_role");
        localStorage.removeItem("planto_user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("authToken");
      }
    },
  },
});

export const { setAuthLoading, setCredentials, hydrateAuth, logout } = authSlice.actions;
export default authSlice.reducer;
