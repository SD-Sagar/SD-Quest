import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Quest, QuestCategory, AttributeType, HunterRank } from "@/types";
import { calculateFairQuestXp, calculateFairStatYield } from "@/lib/calculations/rpg";

interface QuestState {
  quests: Quest[];
  activeFilter: QuestCategory | "all";
}

const initialQuests: Quest[] = [
  {
    id: "quest-perm-1",
    title: "Software Engineering & Architecture",
    description: "Write clean code, review architecture specs, and complete sprint commitments.",
    classification: "permanent",
    category: "career",
    startDate: "2026-11-01",
    recurrence: "daily",
    estimatedDurationMinutes: 120,
    priority: "high",
    difficulty: "Warrior",
    attributeRewards: { intelligence: 0.4, discipline: 0.2 },
    xpReward: 150,
    completionStatus: "pending",
    isManual: true,
  },
  {
    id: "quest-main-gym",
    title: "Main Quest: Physical Conditioning (Chest & Shoulders)",
    description: "5 heavy dumbbell movements + 100 skips. Adhere strictly to rest timers.",
    classification: "scheduled",
    category: "fitness",
    startDate: "2026-11-12",
    deadline: "2026-11-12T21:00:00",
    recurrence: "daily",
    estimatedDurationMinutes: 45,
    priority: "urgent",
    difficulty: "Recruit",
    attributeRewards: { strength: 0.4, discipline: 0.25, agility: 0.15 },
    xpReward: 200,
    completionStatus: "pending",
    isManual: false,
  },
  {
    id: "quest-routine-dog",
    title: "Walk Dog & Responsibility Routine",
    description: "Morning pet care and scheduled outdoor walk.",
    classification: "scheduled",
    category: "routine",
    startDate: "2026-11-12",
    recurrence: "daily",
    estimatedDurationMinutes: 30,
    priority: "medium",
    difficulty: "Recruit",
    attributeRewards: { discipline: 0.2, mentality: 0.15 },
    xpReward: 40,
    completionStatus: "completed",
    isManual: true,
    completedAt: "2026-11-12T07:30:00",
  },
];

const initialState: QuestState = {
  quests: initialQuests,
  activeFilter: "all",
};

export const questSlice = createSlice({
  name: "quests",
  initialState,
  reducers: {
    addManualQuest: (
      state,
      action: PayloadAction<{
        title: string;
        description?: string;
        category: QuestCategory;
        classification: Quest["classification"];
        durationMinutes: number;
        deadline?: string;
        recurrence: Quest["recurrence"];
        priority: Quest["priority"];
        difficulty: HunterRank;
        selectedAttributes: AttributeType[];
        customRewards?: Partial<Record<AttributeType, number>>;
        customXp?: number;
      }>
    ) => {
      const {
        title,
        description,
        category,
        classification,
        durationMinutes,
        deadline,
        recurrence,
        priority,
        difficulty,
        selectedAttributes,
        customRewards,
        customXp,
      } = action.payload;

      const fairRewards =
        customRewards ||
        calculateFairStatYield(durationMinutes, difficulty, selectedAttributes);
      const fairXp =
        customXp || calculateFairQuestXp(durationMinutes, difficulty, priority);

      const newQuest: Quest = {
        id: `quest-custom-${Date.now()}`,
        title,
        description,
        category,
        classification,
        startDate: new Date().toISOString().split("T")[0],
        deadline,
        recurrence,
        estimatedDurationMinutes: durationMinutes,
        priority,
        difficulty,
        attributeRewards: fairRewards,
        xpReward: fairXp,
        completionStatus: "pending",
        isManual: true,
      };

      state.quests.unshift(newQuest);
    },

    completeQuest: (
      state,
      action: PayloadAction<{ id: string; actualDurationMinutes?: number }>
    ) => {
      const quest = state.quests.find((q) => q.id === action.payload.id);
      if (quest && quest.completionStatus !== "completed") {
        quest.completionStatus = "completed";
        quest.completedAt = new Date().toISOString();
        if (action.payload.actualDurationMinutes) {
          quest.actualDurationMinutes = action.payload.actualDurationMinutes;
        }
      }
    },

    deleteQuest: (state, action: PayloadAction<string>) => {
      state.quests = state.quests.filter((q) => q.id !== action.payload);
    },

    setFilter: (state, action: PayloadAction<QuestCategory | "all">) => {
      state.activeFilter = action.payload;
    },
  },
});

export const { addManualQuest, completeQuest, deleteQuest, setFilter } =
  questSlice.actions;

export default questSlice.reducer;

