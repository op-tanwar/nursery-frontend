import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  isPincodeModalOpen: boolean;
}

const initialState: UiState = {
  isPincodeModalOpen: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openPincodeModal: (state) => {
      state.isPincodeModalOpen = true;
    },
    closePincodeModal: (state) => {
      state.isPincodeModalOpen = false;
    },
    setPincodeModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isPincodeModalOpen = action.payload;
    },
  },
});

export const { openPincodeModal, closePincodeModal, setPincodeModalOpen } = uiSlice.actions;
export default uiSlice.reducer;
