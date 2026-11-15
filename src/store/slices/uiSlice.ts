import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isManualQuestModalOpen: boolean;
  isSmartQuestModalOpen: boolean;
  isSanctuaryModalOpen: boolean;
  isReportModalOpen: boolean;
  toastMessage: string | null;
}

const initialState: UiState = {
  isManualQuestModalOpen: false,
  isSmartQuestModalOpen: false,
  isSanctuaryModalOpen: false,
  isReportModalOpen: false,
  toastMessage: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setManualQuestModal: (state, action: PayloadAction<boolean>) => {
      state.isManualQuestModalOpen = action.payload;
    },
    setSmartQuestModal: (state, action: PayloadAction<boolean>) => {
      state.isSmartQuestModalOpen = action.payload;
    },
    setSanctuaryModal: (state, action: PayloadAction<boolean>) => {
      state.isSanctuaryModalOpen = action.payload;
    },
    setReportModal: (state, action: PayloadAction<boolean>) => {
      state.isReportModalOpen = action.payload;
    },
    showToast: (state, action: PayloadAction<string>) => {
      state.toastMessage = action.payload;
    },
    clearToast: (state) => {
      state.toastMessage = null;
    },
  },
});

export const {
  setManualQuestModal,
  setSmartQuestModal,
  setSanctuaryModal,
  setReportModal,
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;

