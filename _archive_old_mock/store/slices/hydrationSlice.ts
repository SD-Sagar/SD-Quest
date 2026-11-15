import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HydrationRecord } from "@/types";

const initialState: HydrationRecord = {
  targetMl: 3000,
  currentMl: 1200,
  logs: [
    { timestamp: "08:00", amountMl: 300 },
    { timestamp: "10:30", amountMl: 300 },
    { timestamp: "12:15", amountMl: 300 },
    { timestamp: "14:45", amountMl: 300 },
  ],
};

export const hydrationSlice = createSlice({
  name: "hydration",
  initialState,
  reducers: {
    addWaterTap: (state, action: PayloadAction<number | undefined>) => {
      const amount = action.payload || 300;
      state.currentMl += amount;
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      state.logs.push({ timestamp: timeStr, amountMl: amount });
    },
    undoLastTap: (state) => {
      if (state.logs.length > 0) {
        const last = state.logs.pop();
        if (last) {
          state.currentMl = Math.max(0, state.currentMl - last.amountMl);
        }
      }
    },
    setTargetMl: (state, action: PayloadAction<number>) => {
      state.targetMl = action.payload;
    },
  },
});

export const { addWaterTap, undoLastTap, setTargetMl } = hydrationSlice.actions;
export default hydrationSlice.reducer;

