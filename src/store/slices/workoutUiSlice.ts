import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExerciseDefinition, EquipmentInventory } from "@/types";
import {
  calculateSetFatigueDelta,
  calculateRestRecoveryPerSecond,
} from "@/lib/calculations/fatigue";

export interface ActiveSetState {
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe: number;
  benchAngle?: string;
  completed: boolean;
  plateBreakdown?: string;
}

export type WorkoutPhase = "core" | "belly" | "skipping" | "completed";
export type WorkoutUiStatus = "idle" | "setup" | "lifting" | "resting" | "skipping" | "completed";

export interface ActiveWorkoutUiState {
  isActive: boolean;
  dayName: string;
  title: string;
  targetMuscles: string;
  skippingTarget: number;
  skippingCompleted: number;
  currentExerciseIndex: number;
  currentSetIndex: number;
  restTimerSeconds: number;
  restTimerActive: boolean;
  setupTimerSeconds: number;
  setupTimerActive: boolean;
  targetDurationMinutes: number;
  startedAtTimestamp: number;
  speedBonusEarned: boolean;
  skippedCount: number;
  isMinimized?: boolean;
  isSingleExercise?: boolean;
  isExtraWorkout?: boolean;
  extraWorkoutMultiplier?: number;
  playerWeightKg?: number;
  playerHeightCm?: number;
  playerLevel?: number;
  playerRank?: string;
  currentPhysicalFatigue: number;
  currentMentalFatigue: number;
  initialPhysicalFatigue: number;
  initialMentalFatigue: number;
  totalPlannedSets: number;
  totalPlannedTonnage: number;
  completedSetsCount: number;
  phase: WorkoutPhase;
  status: WorkoutUiStatus;
  coreExercisesCount: number;
  bellyExercisesCount: number;
  exercises: {
    definition: ExerciseDefinition;
    sets: ActiveSetState[];
    phase: "core" | "belly";
    isPreCompleted?: boolean;
    extraBonusMultiplier?: number;
  }[];
  equipment?: EquipmentInventory;
}

const initialState: ActiveWorkoutUiState = {
  isActive: false,
  dayName: "Tuesday",
  title: "Tuesday: Chest & Upper Body Hypertrophy",
  targetMuscles: "Upper Chest, Mid Chest, Front Delts, Triceps",
  skippingTarget: 100,
  skippingCompleted: 0,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  restTimerSeconds: 90,
  restTimerActive: false,
  setupTimerSeconds: 60,
  setupTimerActive: false,
  targetDurationMinutes: 45,
  startedAtTimestamp: 0,
  speedBonusEarned: false,
  skippedCount: 0,
  isMinimized: false,
  playerWeightKg: 70,
  playerHeightCm: 175,
  playerLevel: 1,
  playerRank: "Recruit",
  currentPhysicalFatigue: 0,
  currentMentalFatigue: 0,
  initialPhysicalFatigue: 0,
  initialMentalFatigue: 0,
  totalPlannedSets: 0,
  totalPlannedTonnage: 0,
  completedSetsCount: 0,
  phase: "core",
  status: "idle",
  coreExercisesCount: 0,
  bellyExercisesCount: 0,
  exercises: [],
};

export const workoutUiSlice = createSlice({
  name: "workoutUi",
  initialState,
  reducers: {
    startWorkoutSession: (
      state,
      action: PayloadAction<{
        dayName: string;
        title: string;
        targetMuscles: string;
        skippingTarget: number;
        targetDurationMinutes?: number;
        isSingleExercise?: boolean;
        isExtraWorkout?: boolean;
        extraWorkoutMultiplier?: number;
        playerWeightKg?: number;
        playerHeightCm?: number;
        playerLevel?: number;
        playerRank?: string;
        initialPhysicalFatigue?: number;
        initialMentalFatigue?: number;
        equipment?: EquipmentInventory;
        exercises: {
          definition: ExerciseDefinition;
          defaultWeightKg: number;
          plateBreakdown: string;
          phase?: "core" | "belly";
          isPreCompleted?: boolean;
        }[];
      }>
    ) => {
      state.isActive = true;
      state.equipment = action.payload.equipment;
      state.dayName = action.payload.dayName;
      state.title = action.payload.title;
      state.targetMuscles = action.payload.targetMuscles;
      state.skippingTarget = action.payload.skippingTarget;
      state.skippingCompleted = 0;
      state.currentExerciseIndex = 0;
      state.currentSetIndex = 0;
      state.restTimerSeconds = 90;
      state.restTimerActive = false;
      state.setupTimerSeconds = 60;
      state.setupTimerActive = true;
      state.targetDurationMinutes = action.payload.targetDurationMinutes || (action.payload.isSingleExercise ? 12 : 45);
      state.startedAtTimestamp = Date.now();
      state.speedBonusEarned = false;
      state.skippedCount = 0;
      state.isMinimized = false;
      state.playerWeightKg = action.payload.playerWeightKg || 70;
      state.playerHeightCm = action.payload.playerHeightCm || 175;
      state.playerLevel = action.payload.playerLevel || 1;
      state.playerRank = action.payload.playerRank || "Recruit";
      state.isSingleExercise = action.payload.isSingleExercise || false;
      state.isExtraWorkout = action.payload.isExtraWorkout || false;
      state.extraWorkoutMultiplier = action.payload.extraWorkoutMultiplier || 1.0;
      state.phase = action.payload.isSingleExercise ? "core" : "core";
      state.status = "setup"; // First exercise starts in Equipment Setup Mode!

      let coreCount = 0;
      let bellyCount = 0;
      let totalSets = 0;
      let totalTonnage = 0;

      state.exercises = action.payload.exercises.map((item) => {
        const exPhase = item.phase || "core";
        if (exPhase === "core") coreCount += 1;
        else bellyCount += 1;

        const count = item.definition.default_sets || 3;
        totalSets += count;
        totalTonnage += (item.defaultWeightKg || 10) * (item.definition.default_reps_min || 10) * count;

        return {
          definition: item.definition,
          phase: exPhase,
          isPreCompleted: item.isPreCompleted || false,
          sets: Array.from({ length: count }, (_, i) => ({
            setNumber: i + 1,
            weightKg: item.defaultWeightKg,
            reps: item.definition.default_reps_min,
            rpe: 8,
            benchAngle: item.definition.bench_angle || "Flat",
            completed: false,
            plateBreakdown: item.plateBreakdown,
          })),
        };
      });

      state.coreExercisesCount = coreCount;
      state.bellyExercisesCount = bellyCount;
      state.totalPlannedSets = totalSets;
      state.totalPlannedTonnage = totalTonnage;
      state.completedSetsCount = 0;
      state.initialPhysicalFatigue = action.payload.initialPhysicalFatigue ?? 0;
      state.initialMentalFatigue = action.payload.initialMentalFatigue ?? 0;
      state.currentPhysicalFatigue = action.payload.initialPhysicalFatigue ?? 0;
      state.currentMentalFatigue = action.payload.initialMentalFatigue ?? 0;
    },

    abandonSession: () => {
      return initialState;
    },

    skipPreCompletedMovement: (state) => {
      const exercise = state.exercises[state.currentExerciseIndex];
      if (exercise) {
        exercise.sets.forEach((s) => {
          s.completed = true;
        });
      }

      state.restTimerActive = false;
      if (state.currentExerciseIndex + 1 < state.exercises.length) {
        state.currentExerciseIndex += 1;
        state.currentSetIndex = 0;
        state.setupTimerSeconds = 60;
        state.setupTimerActive = true;
        state.status = "setup";
        state.phase = state.exercises[state.currentExerciseIndex].phase;
      } else {
        if (state.isSingleExercise) {
          state.phase = "completed";
          state.status = "completed";
        } else {
          state.phase = "skipping";
          state.status = "skipping";
        }
      }
    },

    redoPreCompletedMovementForBonus: (state, action: PayloadAction<{ bonusMultiplier: number }>) => {
      const exercise = state.exercises[state.currentExerciseIndex];
      if (exercise) {
        exercise.extraBonusMultiplier = action.payload.bonusMultiplier;
        exercise.isPreCompleted = false; // User chose to redo it for the bonus!
      }
      state.setupTimerActive = false;
      state.status = "lifting";
    },

    confirmStartExercise: (state) => {
      state.setupTimerActive = false;
      state.status = "lifting";
    },

    tickSetupTimer: (state, action: PayloadAction<{ isHydrationSurge?: boolean } | undefined>) => {
      if (!state.setupTimerActive) return;
      if (state.setupTimerSeconds > 0) {
        state.setupTimerSeconds -= 1;

        // Natural biological cooldown during equipment setup / awaiting phase
        const surgeMultiplier = action.payload?.isHydrationSurge ? 1.5 : 1.0;
        const physicalRecoveryPerSec = 0.0033 * surgeMultiplier;
        const mentalRecoveryPerSec = 0.0016 * surgeMultiplier;

        state.currentPhysicalFatigue = Math.max(0, Number((state.currentPhysicalFatigue - physicalRecoveryPerSec).toFixed(3)));
        state.currentMentalFatigue = Math.max(0, Number((state.currentMentalFatigue - mentalRecoveryPerSec).toFixed(3)));
      } else {
        state.setupTimerActive = false;
      }
    },

    adjustSetupTimer: (state, action: PayloadAction<number>) => {
      state.setupTimerSeconds = Math.max(0, state.setupTimerSeconds + action.payload);
    },

    completeActiveSet: (
      state,
      action: PayloadAction<{ actualWeightKg: number; actualReps: number; rpe: number }>
    ) => {
      const exercise = state.exercises[state.currentExerciseIndex];
      if (!exercise) return;

      const currentSet = exercise.sets[state.currentSetIndex];
      if (currentSet) {
        currentSet.weightKg = action.payload.actualWeightKg;
        currentSet.reps = action.payload.actualReps;
        currentSet.rpe = action.payload.rpe;
        currentSet.completed = true;

        // Calculate compounding fatigue delta for this completed set
        const plannedWeight = exercise.sets[0]?.weightKg || action.payload.actualWeightKg;
        const plannedReps = exercise.definition.default_reps_min || action.payload.actualReps;

        const fatigueDelta = calculateSetFatigueDelta({
          setIndex: state.completedSetsCount,
          totalSets: state.totalPlannedSets || 12,
          weightKg: action.payload.actualWeightKg,
          reps: action.payload.actualReps,
          plannedWeightKg: plannedWeight,
          plannedReps: plannedReps,
          hunterLevel: state.playerLevel || 1,
        });

        state.currentPhysicalFatigue = Math.min(
          100,
          Math.max(0, Number((state.currentPhysicalFatigue + fatigueDelta.physicalDelta).toFixed(2)))
        );
        state.currentMentalFatigue = Math.min(
          100,
          Math.max(0, Number((state.currentMentalFatigue + fatigueDelta.mentalDelta).toFixed(2)))
        );
        state.completedSetsCount += 1;

        if (state.currentSetIndex + 1 < exercise.sets.length) {
          // More sets remain for this exercise -> start rest timer
          state.currentSetIndex += 1;
          state.restTimerSeconds = exercise.definition.default_rest_seconds || 90;
          state.restTimerActive = true;
          state.status = "resting";
        } else {
          // All sets completed for this exercise!
          state.restTimerActive = false;

          if (state.currentExerciseIndex + 1 < state.exercises.length) {
            // Next exercise -> Transition to Equipment Setup
            state.currentExerciseIndex += 1;
            state.currentSetIndex = 0;
            state.setupTimerSeconds = 60;
            state.setupTimerActive = true;
            state.status = "setup";
            state.phase = state.exercises[state.currentExerciseIndex].phase;
          } else {
            // All lifting exercises complete
            if (state.isSingleExercise) {
              state.phase = "completed";
              state.status = "completed";
            } else {
              state.phase = "skipping";
              state.status = "skipping";
            }
          }
        }
      }
    },

    addSetToCurrentExercise: (state) => {
      const exercise = state.exercises[state.currentExerciseIndex];
      if (!exercise || exercise.sets.length >= 10) return;
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const newSetNumber = exercise.sets.length + 1;
      exercise.sets.push({
        setNumber: newSetNumber,
        weightKg: lastSet ? lastSet.weightKg : 10,
        reps: lastSet ? lastSet.reps : 10,
        rpe: 8,
        completed: false,
      });
    },

    skipExerciseWithPenalty: (state) => {
      state.skippedCount += 1;
      const exercise = state.exercises[state.currentExerciseIndex];
      if (exercise) {
        exercise.sets.forEach((s) => {
          s.completed = false;
        });
      }

      state.restTimerActive = false;
      if (state.currentExerciseIndex + 1 < state.exercises.length) {
        state.currentExerciseIndex += 1;
        state.currentSetIndex = 0;
        state.setupTimerSeconds = 60;
        state.setupTimerActive = true;
        state.status = "setup";
        state.phase = state.exercises[state.currentExerciseIndex].phase;
      } else {
        if (state.isSingleExercise) {
          state.phase = "completed";
          state.status = "completed";
        } else {
          state.phase = "skipping";
          state.status = "skipping";
        }
      }
    },

    tickTimer: (state, action: PayloadAction<{ isHydrationSurge?: boolean } | undefined>) => {
      if (!state.restTimerActive) return;
      if (state.restTimerSeconds > 0) {
        state.restTimerSeconds -= 1;

        // Biological rest recovery per second (~2.0% per full planned rest interval)
        const plannedRest = state.exercises[state.currentExerciseIndex]?.definition.default_rest_seconds || 90;
        const baseRecoveryPerSec = calculateRestRecoveryPerSecond(plannedRest);
        const surgeMultiplier = action.payload?.isHydrationSurge ? 2.0 : 1.0;
        const recoveryPerSec = baseRecoveryPerSec * surgeMultiplier;

        // Do not recover below the hunter's initial starting fatigue (or 0)
        const fatigueFloor = Math.max(0, state.initialPhysicalFatigue);
        state.currentPhysicalFatigue = Math.max(
          fatigueFloor,
          Number((state.currentPhysicalFatigue - recoveryPerSec).toFixed(3))
        );
      } else {
        state.restTimerActive = false;
        state.status = "lifting";
      }
    },

    adjustTimer: (state, action: PayloadAction<number>) => {
      state.restTimerSeconds = Math.max(0, state.restTimerSeconds + action.payload);
    },

    skipTimer: (state) => {
      state.restTimerActive = false;
      state.restTimerSeconds = 0;
      state.status = "lifting";
    },

    logSkips: (state, action: PayloadAction<number>) => {
      state.skippingCompleted = action.payload;
    },

    finishSkippingPhase: (state) => {
      state.phase = "completed";
      state.status = "completed";

      const elapsedMins = (Date.now() - state.startedAtTimestamp) / 60000;
      if (elapsedMins > 0 && elapsedMins <= state.targetDurationMinutes) {
        state.speedBonusEarned = true;
      }
    },

    minimizeSession: (state) => {
      state.isMinimized = true;
    },

    maximizeSession: (state) => {
      state.isMinimized = false;
    },

    swapCurrentExercise: (
      state,
      action: PayloadAction<{ newDefinition: ExerciseDefinition }>
    ) => {
      const exercise = state.exercises[state.currentExerciseIndex];
      if (exercise) {
        exercise.definition = action.payload.newDefinition;
      }
    },

    restoreWorkoutSession: (_state, action: PayloadAction<ActiveWorkoutUiState>) => {
      return {
        ...action.payload,
        isMinimized: false,
        currentPhysicalFatigue: action.payload.currentPhysicalFatigue ?? 0,
        currentMentalFatigue: action.payload.currentMentalFatigue ?? 0,
        initialPhysicalFatigue: action.payload.initialPhysicalFatigue ?? 0,
        initialMentalFatigue: action.payload.initialMentalFatigue ?? 0,
        totalPlannedSets: action.payload.totalPlannedSets ?? 0,
        totalPlannedTonnage: action.payload.totalPlannedTonnage ?? 0,
        completedSetsCount: action.payload.completedSetsCount ?? 0,
      };
    },

    setEquipmentInventory: (state, action: PayloadAction<EquipmentInventory>) => {
      state.equipment = action.payload;
    },

    updateCurrentSetWeight: (
      state,
      action: PayloadAction<{ weightKg: number; plateBreakdown?: string }>
    ) => {
      const exercise = state.exercises[state.currentExerciseIndex];
      if (!exercise) return;
      const currentSet = exercise.sets[state.currentSetIndex];
      if (currentSet) {
        currentSet.weightKg = action.payload.weightKg;
        if (action.payload.plateBreakdown) {
          currentSet.plateBreakdown = action.payload.plateBreakdown;
        }
      }
    },

    endSession: () => {
      return initialState;
    },
  },
});

export const {
  startWorkoutSession,
  confirmStartExercise,
  tickSetupTimer,
  adjustSetupTimer,
  addSetToCurrentExercise,
  completeActiveSet,
  skipExerciseWithPenalty,
  abandonSession,
  skipPreCompletedMovement,
  redoPreCompletedMovementForBonus,
  tickTimer,
  adjustTimer,
  skipTimer,
  logSkips,
  finishSkippingPhase,
  swapCurrentExercise,
  restoreWorkoutSession,
  minimizeSession,
  maximizeSession,
  setEquipmentInventory,
  updateCurrentSetWeight,
  endSession,
} = workoutUiSlice.actions;

export default workoutUiSlice.reducer;
