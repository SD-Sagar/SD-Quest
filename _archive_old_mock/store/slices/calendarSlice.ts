import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CalendarDayEntry, CalendarDayStatus } from "@/types";

interface CalendarState {
  currentYear: number;
  currentMonth: number; // 1 - 12
  selectedDate: string; // YYYY-MM-DD
  days: Record<string, CalendarDayEntry>;
}

// Seed realistic current month data for November 2026
const seedDays: Record<string, CalendarDayEntry> = {
  "2026-11-01": {
    date: "2026-11-01",
    status: "neutral",
    gymWorkoutCompleted: false,
    skippingCompleted: false,
    questsCompletedCount: 2,
    totalQuestsCount: 2,
    waterTargetMet: true,
    notes: "Sunday — Scheduled recovery day. High hydration.",
  },
  "2026-11-02": {
    date: "2026-11-02",
    status: "green",
    gymWorkoutCompleted: true,
    skippingCompleted: true,
    questsCompletedCount: 3,
    totalQuestsCount: 3,
    waterTargetMet: true,
    notes: "Monday: Legs & Core. 100 skips unbroken. High intensity.",
  },
  "2026-11-03": {
    date: "2026-11-03",
    status: "green",
    gymWorkoutCompleted: true,
    skippingCompleted: true,
    questsCompletedCount: 4,
    totalQuestsCount: 4,
    waterTargetMet: true,
    notes: "Tuesday: Chest & Upper Body. Incline DB press 17.5kg.",
  },
  "2026-11-04": {
    date: "2026-11-04",
    status: "green",
    gymWorkoutCompleted: true,
    skippingCompleted: true,
    questsCompletedCount: 3,
    totalQuestsCount: 3,
    waterTargetMet: true,
    notes: "Wednesday: Back & Lats. One-arm DB rows 22.5kg.",
  },
  "2026-11-05": {
    date: "2026-11-05",
    status: "half_green",
    gymWorkoutCompleted: true,
    skippingCompleted: false,
    questsCompletedCount: 2,
    totalQuestsCount: 3,
    waterTargetMet: false,
    notes: "Thursday: Shoulders. Completed lifting, missed skipping due to rain.",
  },
  "2026-11-06": {
    date: "2026-11-06",
    status: "green",
    gymWorkoutCompleted: true,
    skippingCompleted: true,
    questsCompletedCount: 3,
    totalQuestsCount: 3,
    waterTargetMet: true,
    notes: "Friday: Hypertrophy & Lateral Delts. 100 skips.",
  },
  "2026-11-07": {
    date: "2026-11-07",
    status: "green",
    gymWorkoutCompleted: true,
    skippingCompleted: true,
    questsCompletedCount: 3,
    totalQuestsCount: 3,
    waterTargetMet: true,
    notes: "Saturday: Arms & Forearms. Incline DB curls.",
  },
  "2026-11-08": {
    date: "2026-11-08",
    status: "neutral",
    gymWorkoutCompleted: false,
    skippingCompleted: false,
    questsCompletedCount: 2,
    totalQuestsCount: 2,
    waterTargetMet: true,
    notes: "Sunday — Scheduled recovery day.",
  },
  "2026-11-09": {
    date: "2026-11-09",
    status: "green",
    gymWorkoutCompleted: true,
    skippingCompleted: true,
    questsCompletedCount: 4,
    totalQuestsCount: 4,
    waterTargetMet: true,
    notes: "Monday: Legs. Goblet squats 25kg.",
  },
  "2026-11-10": {
    date: "2026-11-10",
    status: "green",
    gymWorkoutCompleted: true,
    skippingCompleted: true,
    questsCompletedCount: 3,
    totalQuestsCount: 3,
    waterTargetMet: true,
    notes: "Tuesday: Chest & Upper. Peak performance.",
  },
  "2026-11-11": {
    date: "2026-11-11",
    status: "green",
    gymWorkoutCompleted: true,
    skippingCompleted: true,
    questsCompletedCount: 3,
    totalQuestsCount: 3,
    waterTargetMet: true,
    notes: "Wednesday: Back & Abs.",
  },
  "2026-11-12": {
    date: "2026-11-12",
    status: "green",
    gymWorkoutCompleted: true,
    skippingCompleted: true,
    questsCompletedCount: 3,
    totalQuestsCount: 4,
    waterTargetMet: true,
    notes: "Today: Chest & Lateral Delts. Dungeon cleared.",
  },
};

const initialState: CalendarState = {
  currentYear: 2026,
  currentMonth: 11,
  selectedDate: "2026-11-12",
  days: seedDays,
};

export const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    selectDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    navigateMonth: (state, action: PayloadAction<"prev" | "next">) => {
      if (action.payload === "prev") {
        if (state.currentMonth === 1) {
          state.currentMonth = 12;
          state.currentYear -= 1;
        } else {
          state.currentMonth -= 1;
        }
      } else {
        if (state.currentMonth === 12) {
          state.currentMonth = 1;
          state.currentYear += 1;
        } else {
          state.currentMonth += 1;
        }
      }
    },
    recordDayCompletion: (
      state,
      action: PayloadAction<{ date: string; status: CalendarDayStatus; notes?: string }>
    ) => {
      const { date, status, notes } = action.payload;
      if (!state.days[date]) {
        state.days[date] = {
          date,
          status,
          gymWorkoutCompleted: status === "green" || status === "half_green",
          skippingCompleted: status === "green",
          questsCompletedCount: 1,
          totalQuestsCount: 1,
          waterTargetMet: true,
          notes,
        };
      } else {
        state.days[date].status = status;
        if (notes) state.days[date].notes = notes;
      }
    },
  },
});

export const { selectDate, navigateMonth, recordDayCompletion } =
  calendarSlice.actions;

export default calendarSlice.reducer;

