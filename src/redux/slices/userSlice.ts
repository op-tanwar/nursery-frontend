import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile } from "@/types/user.types";

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.error = null;
    },
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.isLoading = false;
      state.error = null;

      // Synchronize with LocalStorage
      if (typeof window !== "undefined") {
        try {
          const storedUser = localStorage.getItem("urban_nursery_user") || localStorage.getItem("planto_user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            const updated = { ...parsed, ...action.payload };
            localStorage.setItem("urban_nursery_user", JSON.stringify(updated));
            localStorage.setItem("planto_user", JSON.stringify(updated));
          } else {
            localStorage.setItem("urban_nursery_user", JSON.stringify(action.payload));
            localStorage.setItem("planto_user", JSON.stringify(action.payload));
          }
        } catch (e) {
          console.error("Failed to sync profile with localStorage", e);
        }
      }
    },
    setUserError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearUserProfile: (state) => {
      state.profile = null;
      state.isLoading = false;
      state.error = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("urban_nursery_user");
        localStorage.removeItem("planto_user");
      }
    },
  },
});

export const {
  setUserLoading,
  setUserProfile,
  setUserError,
  clearUserProfile,
} = userSlice.actions;

export default userSlice.reducer;