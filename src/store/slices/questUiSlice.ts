import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Quest } from "@/types";

export interface ActiveQuestUiState {
  isActive: boolean;
  isMinimized: boolean;
  quest: Quest | null;
  startedAtTimestamp: number | null;
}

const initialState: ActiveQuestUiState = {
  isActive: false,
  isMinimized: false,
  quest: null,
  startedAtTimestamp: null,
};

export const questUiSlice = createSlice({
  name: "questUi",
  initialState,
  reducers: {
    startQuestSession: (
      state,
      action: PayloadAction<{ quest: Quest; startedAtTimestamp?: number }>
    ) => {
      state.isActive = true;
      state.isMinimized = false;
      state.quest = action.payload.quest;
      state.startedAtTimestamp = action.payload.startedAtTimestamp || Date.now();
    },
    minimizeQuestSession: (state) => {
      state.isMinimized = true;
    },
    maximizeQuestSession: (state) => {
      state.isMinimized = false;
    },
    endQuestSession: (state) => {
      state.isActive = false;
      state.isMinimized = false;
      state.quest = null;
      state.startedAtTimestamp = null;
    },
    restoreQuestSession: (state, action: PayloadAction<any>) => {
      const data = action.payload;
      const quest = data.quest_data || {
        id: data.session_id,
        user_id: "",
        title: data.title,
        classification: "scheduled",
        category: data.category || "career",
        start_date: new Date().toISOString().split("T")[0],
        recurrence: "none",
        recurrence_days: [],
        estimated_duration_minutes: data.target_minutes || 60,
        priority: "medium",
        difficulty: "Recruit",
        attribute_rewards: {},
        xp_reward: 50,
        penalty_config: {},
        status: "in_progress",
        is_manual: true,
        is_fun: data.is_fun || false,
      };

      state.isActive = true;
      state.isMinimized = true;
      state.quest = quest;
      state.startedAtTimestamp = data.started_at
        ? new Date(data.started_at).getTime()
        : data.startedAtTimestamp || Date.now();
    },
  },
});

export const {
  startQuestSession,
  minimizeQuestSession,
  maximizeQuestSession,
  endQuestSession,
  restoreQuestSession,
} = questUiSlice.actions;

export default questUiSlice.reducer;
