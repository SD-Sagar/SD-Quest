import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AttributeType, PlayerProfile } from "@/types";
import { calculateXpForNextLevel, getRankForLevel } from "@/lib/calculations/rpg";

const initialAttributes = {
  strength: { score: 10.0, xp: 0, level: 1, lifetimeHighest: 10.0 },
  endurance: { score: 10.0, xp: 0, level: 1, lifetimeHighest: 10.0 },
  intelligence: { score: 10.0, xp: 0, level: 1, lifetimeHighest: 10.0 },
  discipline: { score: 10.0, xp: 0, level: 1, lifetimeHighest: 10.0 },
  mentality: { score: 10.0, xp: 0, level: 1, lifetimeHighest: 10.0 },
  agility: { score: 10.0, xp: 0, level: 1, lifetimeHighest: 10.0 },
  vitality: { score: 10.0, xp: 0, level: 1, lifetimeHighest: 10.0 },
};

const initialState: PlayerProfile = {
  id: "player-primary-1",
  name: "",
  dob: "2000-01-01",
  heightCm: 175,
  currentWeightKg: 70,
  sex: "male",
  fitnessExperience: "beginner",
  fitnessObjective: "Hypertrophy & Strength Conditioning",
  rank: "Recruit",
  currentLevel: 1,
  currentXp: 0,
  xpToNextLevel: 100,
  lifetimeHighestLevel: 1,
  lifetimeTotalXp: 0,
  title: "Shadow Recruit",
  conditionStatus: "normal",
  isInitialized: false, // Must go through Character Creation Onboarding!
  attributes: initialAttributes,
};

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    createInitialCharacter: (
      state,
      action: PayloadAction<{
        name: string;
        dob: string;
        heightCm: number;
        currentWeightKg: number;
        sex?: "male" | "female" | "other";
        fitnessExperience: "beginner" | "intermediate" | "advanced";
        fitnessObjective: string;
      }>
    ) => {
      state.name = action.payload.name;
      state.dob = action.payload.dob;
      state.heightCm = action.payload.heightCm;
      state.currentWeightKg = action.payload.currentWeightKg;
      state.sex = action.payload.sex;
      state.fitnessExperience = action.payload.fitnessExperience;
      state.fitnessObjective = action.payload.fitnessObjective;
      state.currentLevel = 1;
      state.currentXp = 0;
      state.xpToNextLevel = 100;
      state.lifetimeHighestLevel = 1;
      state.lifetimeTotalXp = 0;
      state.title = "Awakened Recruit";
      state.rank = "Recruit";
      state.conditionStatus = "normal";
      state.isInitialized = true;
    },

    addXp: (state, action: PayloadAction<number>) => {
      const addedXp = Math.max(0, action.payload);
      state.currentXp += addedXp;
      state.lifetimeTotalXp += addedXp;

      // Check level up loop
      while (state.currentXp >= state.xpToNextLevel) {
        state.currentXp -= state.xpToNextLevel;
        state.currentLevel += 1;
        state.xpToNextLevel = calculateXpForNextLevel(state.currentLevel);

        if (state.currentLevel > state.lifetimeHighestLevel) {
          state.lifetimeHighestLevel = state.currentLevel;
        }

        state.rank = getRankForLevel(state.currentLevel);
      }
    },

    addAttributePoints: (
      state,
      action: PayloadAction<Partial<Record<AttributeType, number>>>
    ) => {
      for (const [key, delta] of Object.entries(action.payload)) {
        const attrKey = key as AttributeType;
        if (state.attributes[attrKey] && typeof delta === "number") {
          const current = state.attributes[attrKey].score;
          const updated = Number((current + delta).toFixed(2));
          state.attributes[attrKey].score = Math.max(0, updated);

          if (updated > state.attributes[attrKey].lifetimeHighest) {
            state.attributes[attrKey].lifetimeHighest = updated;
          }
        }
      }
    },

    applyPenalty: (
      state,
      action: PayloadAction<{ penaltyXp?: number; penaltyDiscipline?: number }>
    ) => {
      if (action.payload.penaltyXp) {
        state.currentXp = Math.max(0, state.currentXp - action.payload.penaltyXp);
      }
      if (action.payload.penaltyDiscipline) {
        const currDis = state.attributes.discipline.score;
        state.attributes.discipline.score = Math.max(
          1,
          Number((currDis - action.payload.penaltyDiscipline).toFixed(2))
        );
      }
    },

    setConditionStatus: (
      state,
      action: PayloadAction<PlayerProfile["conditionStatus"]>
    ) => {
      state.conditionStatus = action.payload;
      if (action.payload === "chicken") {
        state.chickenStatusDaysRemaining = 7;
      } else {
        state.chickenStatusDaysRemaining = undefined;
      }
    },

    updateProfile: (
      state,
      action: PayloadAction<Partial<Omit<PlayerProfile, "attributes">>>
    ) => {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  createInitialCharacter,
  addXp,
  addAttributePoints,
  applyPenalty,
  setConditionStatus,
  updateProfile,
} = playerSlice.actions;

export default playerSlice.reducer;
