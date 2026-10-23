import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IVendorDetails, IVendorAdminDetail } from "@/types/index";

interface VendorState {
  currentVendor: IVendorDetails | null;
  adminVendorDetail: IVendorAdminDetail | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: VendorState = {
  currentVendor: null,
  adminVendorDetail: null,
  isLoading: false,
  error: null,
};

export const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    setVendorLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setVendorError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    setPublicVendorData: (state, action: PayloadAction<IVendorDetails>) => {
      state.currentVendor = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    setAdminVendorDetailData: (state, action: PayloadAction<IVendorAdminDetail>) => {
      state.adminVendorDetail = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    clearVendorState: () => {
      return initialState;
    },
  },
});

export const {
  setVendorLoading,
  setVendorError,
  setPublicVendorData,
  setAdminVendorDetailData,
  clearVendorState,
} = vendorSlice.actions;

export default vendorSlice.reducer;
