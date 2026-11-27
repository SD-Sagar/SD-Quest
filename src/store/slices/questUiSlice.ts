import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Quest } from "@/types";

export interface ActiveQuestUiState {
  isActive: boolean;
  isMinimized: boolean;
  quest: Quest | null;
  startedAtTimestamp: number | null;
  initialPhysicalFatigue: number;
  initialMentalFatigue: number;
  currentPhysicalFatigue: number;
  currentMentalFatigue: number;
  hunterLevel: number;
  isRepeatSession?: boolean;
  isOffDaySession?: boolean;
}

const initialState: ActiveQuestUiState = {
  isActive: false,
  isMinimized: false,
  quest: null,
  startedAtTimestamp: null,
  initialPhysicalFatigue: 0,
  initialMentalFatigue: 0,
  currentPhysicalFatigue: 0,
  currentMentalFatigue: 0,
  hunterLevel: 1,
  isRepeatSession: false,
  isOffDaySession: false,
};

export const questUiSlice = createSlice({
  name: "questUi",
  initialState,
  reducers: {
    startQuestSession: (
      state,
      action: PayloadAction<{
        quest: Quest;
        startedAtTimestamp?: number;
        initialPhysicalFatigue?: number;
        initialMentalFatigue?: number;
        hunterLevel?: number;
        isRepeatSession?: boolean;
        isOffDaySession?: boolean;
      }>
    ) => {
      state.isActive = true;
      state.isMinimized = false;
      state.quest = action.payload.quest;
      state.startedAtTimestamp = action.payload.startedAtTimestamp || Date.now();
      state.initialPhysicalFatigue = action.payload.initialPhysicalFatigue ?? 0;
      state.initialMentalFatigue = action.payload.initialMentalFatigue ?? 0;
      state.currentPhysicalFatigue = action.payload.initialPhysicalFatigue ?? 0;
      state.currentMentalFatigue = action.payload.initialMentalFatigue ?? 0;
      state.hunterLevel = action.payload.hunterLevel ?? 1;
      state.isRepeatSession = action.payload.isRepeatSession ?? false;
      state.isOffDaySession = action.payload.isOffDaySession ?? false;
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
      state.initialPhysicalFatigue = 0;
      state.initialMentalFatigue = 0;
      state.currentPhysicalFatigue = 0;
      state.currentMentalFatigue = 0;
      state.hunterLevel = 1;
      state.isRepeatSession = false;
      state.isOffDaySession = false;
    },
    updateQuestLiveFatigue: (
      state,
      action: PayloadAction<{ currentPhysicalFatigue: number; currentMentalFatigue: number }>
    ) => {
      state.currentPhysicalFatigue = Number(action.payload.currentPhysicalFatigue.toFixed(2));
      state.currentMentalFatigue = Number(action.payload.currentMentalFatigue.toFixed(2));
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

      const basePhys = Number(data.current_profile_physical ?? data.physical_fatigue ?? data.initialPhysicalFatigue ?? 0);
      const baseMent = Number(data.current_profile_mental ?? data.mental_fatigue ?? data.initialMentalFatigue ?? 0);

      state.isActive = true;
      state.isMinimized = true;
      state.quest = quest;
      state.startedAtTimestamp = data.started_at
        ? new Date(data.started_at).getTime()
        : data.startedAtTimestamp || Date.now();
      state.initialPhysicalFatigue = basePhys;
      state.initialMentalFatigue = baseMent;
      state.currentPhysicalFatigue = basePhys;
      state.currentMentalFatigue = baseMent;
      state.hunterLevel = Number(data.hunter_level ?? data.hunterLevel ?? 1);
    },
  },
});

export const {
  startQuestSession,
  minimizeQuestSession,
  maximizeQuestSession,
  endQuestSession,
  restoreQuestSession,
  updateQuestLiveFatigue,
} = questUiSlice.actions;

export default questUiSlice.reducer;
