import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type MuscleId =
  | "chest"
  | "front_delts"
  | "side_delts"
  | "rear_delts"
  | "biceps"
  | "triceps"
  | "forearms"
  | "upper_back"
  | "lower_back"
  | "abs"
  | "obliques"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "calves";

export type RecoveryState = "recovered" | "adaptive_stimulus" | "fatigued" | "under_trained";

export interface MuscleProgressData {
  id: MuscleId;
  name: string;
  view: "front" | "back" | "both";
  weeklySets: number;
  optimalWeeklySetsTarget: number;
  totalVolumeTonnageKg: number;
  lastTrainedDate: string; // YYYY-MM-DD
  recoveryScorePercent: number; // 0 - 100% (100 = fully recovered)
  personalRecord: string;
}

export interface BodyMeasurementRecord {
  id: string;
  date: string;
  weightKg: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  neckCm?: number;
  armsCm?: number;
  forearmsCm?: number;
  thighsCm?: number;
  calvesCm?: number;
  notes?: string;
}

interface BodyState {
  muscles: Record<MuscleId, MuscleProgressData>;
  measurements: BodyMeasurementRecord[];
  selectedMuscleId: MuscleId | null;
}

const initialMuscles: Record<MuscleId, MuscleProgressData> = {
  chest: {
    id: "chest",
    name: "Pectorals (Chest)",
    view: "front",
    weeklySets: 9,
    optimalWeeklySetsTarget: 12,
    totalVolumeTonnageKg: 3420,
    lastTrainedDate: "2026-11-12",
    recoveryScorePercent: 45, // just trained today, in recovery
    personalRecord: "Incline DB Press 17.5kg × 11 reps",
  },
  front_delts: {
    id: "front_delts",
    name: "Front Deltoids",
    view: "front",
    weeklySets: 6,
    optimalWeeklySetsTarget: 8,
    totalVolumeTonnageKg: 1800,
    lastTrainedDate: "2026-11-12",
    recoveryScorePercent: 50,
    personalRecord: "Seated DB Press 12.5kg × 10 reps",
  },
  side_delts: {
    id: "side_delts",
    name: "Side (Lateral) Deltoids",
    view: "both",
    weeklySets: 6,
    optimalWeeklySetsTarget: 14,
    totalVolumeTonnageKg: 675,
    lastTrainedDate: "2026-11-12",
    recoveryScorePercent: 65,
    personalRecord: "DB Lateral Raise 7.5kg × 14 reps",
  },
  rear_delts: {
    id: "rear_delts",
    name: "Rear Deltoids",
    view: "back",
    weeklySets: 4,
    optimalWeeklySetsTarget: 12,
    totalVolumeTonnageKg: 520,
    lastTrainedDate: "2026-11-09",
    recoveryScorePercent: 95,
    personalRecord: "Bent-Over DB Fly 7.5kg × 15 reps",
  },
  biceps: {
    id: "biceps",
    name: "Biceps Brachii",
    view: "front",
    weeklySets: 8,
    optimalWeeklySetsTarget: 12,
    totalVolumeTonnageKg: 1280,
    lastTrainedDate: "2026-11-10",
    recoveryScorePercent: 90,
    personalRecord: "Incline DB Curl 12.5kg × 10 reps",
  },
  triceps: {
    id: "triceps",
    name: "Triceps Brachii",
    view: "back",
    weeklySets: 6,
    optimalWeeklySetsTarget: 12,
    totalVolumeTonnageKg: 1100,
    lastTrainedDate: "2026-11-12",
    recoveryScorePercent: 55,
    personalRecord: "Overhead DB Extension 12.5kg × 12 reps",
  },
  forearms: {
    id: "forearms",
    name: "Forearms & Grip",
    view: "front",
    weeklySets: 4,
    optimalWeeklySetsTarget: 8,
    totalVolumeTonnageKg: 740,
    lastTrainedDate: "2026-11-10",
    recoveryScorePercent: 95,
    personalRecord: "DB Wrist Curl 10kg × 15 reps",
  },
  upper_back: {
    id: "upper_back",
    name: "Upper Back & Lats",
    view: "back",
    weeklySets: 10,
    optimalWeeklySetsTarget: 14,
    totalVolumeTonnageKg: 2850,
    lastTrainedDate: "2026-11-10",
    recoveryScorePercent: 90,
    personalRecord: "One-Arm DB Row 22.5kg × 10 reps",
  },
  lower_back: {
    id: "lower_back",
    name: "Lower Back (Erectors)",
    view: "back",
    weeklySets: 4,
    optimalWeeklySetsTarget: 8,
    totalVolumeTonnageKg: 1200,
    lastTrainedDate: "2026-11-08",
    recoveryScorePercent: 100,
    personalRecord: "DB Romanian Deadlift 20kg × 10 reps",
  },
  abs: {
    id: "abs",
    name: "Abdominals",
    view: "front",
    weeklySets: 6,
    optimalWeeklySetsTarget: 10,
    totalVolumeTonnageKg: 0,
    lastTrainedDate: "2026-11-11",
    recoveryScorePercent: 85,
    personalRecord: "Hanging / Lying Leg Raises 3 × 15",
  },
  obliques: {
    id: "obliques",
    name: "Obliques",
    view: "front",
    weeklySets: 4,
    optimalWeeklySetsTarget: 8,
    totalVolumeTonnageKg: 0,
    lastTrainedDate: "2026-11-11",
    recoveryScorePercent: 90,
    personalRecord: "Side Plank Hold 60s",
  },
  glutes: {
    id: "glutes",
    name: "Gluteals",
    view: "back",
    weeklySets: 6,
    optimalWeeklySetsTarget: 10,
    totalVolumeTonnageKg: 1900,
    lastTrainedDate: "2026-11-08",
    recoveryScorePercent: 100,
    personalRecord: "DB Bulgarian Split Squat 15kg × 10 reps",
  },
  quads: {
    id: "quads",
    name: "Quadriceps",
    view: "front",
    weeklySets: 8,
    optimalWeeklySetsTarget: 12,
    totalVolumeTonnageKg: 2400,
    lastTrainedDate: "2026-11-08",
    recoveryScorePercent: 100,
    personalRecord: "Goblet DB Squat 25kg × 12 reps",
  },
  hamstrings: {
    id: "hamstrings",
    name: "Hamstrings",
    view: "back",
    weeklySets: 6,
    optimalWeeklySetsTarget: 10,
    totalVolumeTonnageKg: 1600,
    lastTrainedDate: "2026-11-08",
    recoveryScorePercent: 100,
    personalRecord: "DB Romanian Deadlift 22.5kg × 10 reps",
  },
  calves: {
    id: "calves",
    name: "Calves & Achillean Tendons",
    view: "both",
    weeklySets: 7,
    optimalWeeklySetsTarget: 12,
    totalVolumeTonnageKg: 850,
    lastTrainedDate: "2026-11-12",
    recoveryScorePercent: 70, // Stimulated by skipping + calf raises
    personalRecord: "100 Skips Unbroken + Single-leg DB Calf 15kg",
  },
};

const initialMeasurements: BodyMeasurementRecord[] = [
  {
    id: "meas-base",
    date: "2026-11-01",
    weightKg: 70.0,
    chestCm: 98.0,
    waistCm: 81.0,
    armsCm: 34.5,
    thighsCm: 55.0,
    calvesCm: 36.0,
    notes: "Baseline measurement at awakening.",
  },
];

const initialState: BodyState = {
  muscles: initialMuscles,
  measurements: initialMeasurements,
  selectedMuscleId: "chest",
};

export const bodySlice = createSlice({
  name: "body",
  initialState,
  reducers: {
    selectMuscle: (state, action: PayloadAction<MuscleId | null>) => {
      state.selectedMuscleId = action.payload;
    },
    recordMuscleWorkoutImpact: (
      state,
      action: PayloadAction<{ muscleId: MuscleId; addedSets: number; addedTonnage: number }>
    ) => {
      const muscle = state.muscles[action.payload.muscleId];
      if (muscle) {
        muscle.weeklySets += action.payload.addedSets;
        muscle.totalVolumeTonnageKg += action.payload.addedTonnage;
        muscle.lastTrainedDate = new Date().toISOString().split("T")[0];
        // Training sets recovery score down as fatigue accumulates
        muscle.recoveryScorePercent = Math.max(30, muscle.recoveryScorePercent - 40);
      }
    },
    addBodyMeasurement: (state, action: PayloadAction<Omit<BodyMeasurementRecord, "id">>) => {
      state.measurements.unshift({
        id: `meas-${Date.now()}`,
        ...action.payload,
      });
    },
  },
});

export const { selectMuscle, recordMuscleWorkoutImpact, addBodyMeasurement } =
  bodySlice.actions;

export default bodySlice.reducer;

