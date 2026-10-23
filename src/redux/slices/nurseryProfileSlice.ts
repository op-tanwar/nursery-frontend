import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { INurseryProfile } from "@/types/index";

interface NurseryProfileState {
  myProfile: INurseryProfile | null;
  adminApplications: INurseryProfile[];
  adminApplicationsCount: number;
  isLoading: boolean;
  error: string | null;
  mutationSuccess: boolean;
  actionMessage: string | null;
}

const initialState: NurseryProfileState = {
  myProfile: null,
  adminApplications: [],
  adminApplicationsCount: 0,
  isLoading: false,
  error: null,
  mutationSuccess: false,
  actionMessage: null,
};

export const nurseryProfileSlice = createSlice({
  name: "nurseryProfile",
  initialState,
  reducers: {
    setNurseryLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setNurseryError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearNurseryMutationFlags: (state) => {
      state.mutationSuccess = false;
      state.error = null;
      state.actionMessage = null;
    },

    // यूजर द्वारा प्रोफाइल अप्लाई या फेच होने पर
    setMyNurseryProfileData: (state, action: PayloadAction<INurseryProfile>) => {
      state.myProfile = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    // प्रोफाइल अपडेट होने पर
    updateMyNurseryProfileSuccess: (state, action: PayloadAction<{ profile: INurseryProfile; message: string }>) => {
      state.myProfile = action.payload.profile;
      state.mutationSuccess = true;
      state.actionMessage = action.payload.message;
      state.isLoading = false;
      state.error = null;
    },

    // ओनरबोर्डिंग रिक्वेस्ट सबमिट होने पर
    applyNurserySuccess: (state, action: PayloadAction<{ profile: INurseryProfile; message: string }>) => {
      state.myProfile = action.payload.profile;
      state.mutationSuccess = true;
      state.actionMessage = action.payload.message;
      state.isLoading = false;
      state.error = null;
    },

    // 🛡️ [ADMIN]: लिस्ट फेच होने पर
    setAdminApplicationsData: (
      state,
      action: PayloadAction<{ applications: INurseryProfile[]; count: number }>
    ) => {
      state.adminApplications = action.payload.applications;
      state.adminApplicationsCount = action.payload.count;
      state.isLoading = false;
      state.error = null;
    },

    // 🛡️ [ADMIN]: किसी एप्लीकेशन को रिव्यू (Approve/Reject) करने के बाद स्टेट अपडेट
    reviewApplicationSuccess: (state, action: PayloadAction<{ id: string; status: any; message: string }>) => {
      // एडमिन की करंट लिस्ट में से उस एप्लीकेशन का स्टेटस तुरंत बदलें या वहां से फ़िल्टर करें
      state.adminApplications = state.adminApplications.map((app) =>
        app._id === action.payload.id ? { ...app, approvalStatus: action.payload.status } : app
      );
      state.mutationSuccess = true;
      state.actionMessage = action.payload.message;
      state.isLoading = false;
      state.error = null;
    },

    clearMyNurseryData: (state) => {
      state.myProfile = null;
    },
  },
});

export const {
  setNurseryLoading,
  setNurseryError,
  clearNurseryMutationFlags,
  setMyNurseryProfileData,
  updateMyNurseryProfileSuccess,
  applyNurserySuccess,
  setAdminApplicationsData,
  reviewApplicationSuccess,
  clearMyNurseryData,
} = nurseryProfileSlice.actions;

export default nurseryProfileSlice.reducer;