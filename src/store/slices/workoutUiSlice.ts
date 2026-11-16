import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExerciseDefinition } from "@/types";

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
  isSingleExercise?: boolean;
  isExtraWorkout?: boolean;
  extraWorkoutMultiplier?: number;
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
      state.isSingleExercise = action.payload.isSingleExercise || false;
      state.isExtraWorkout = action.payload.isExtraWorkout || false;
      state.extraWorkoutMultiplier = action.payload.extraWorkoutMultiplier || 1.0;
      state.phase = action.payload.isSingleExercise ? "core" : "core";
      state.status = "setup"; // First exercise starts in Equipment Setup Mode!

      let coreCount = 0;
      let bellyCount = 0;

      state.exercises = action.payload.exercises.map((item) => {
        const exPhase = item.phase || "core";
        if (exPhase === "core") coreCount += 1;
        else bellyCount += 1;

        return {
          definition: item.definition,
          phase: exPhase,
          isPreCompleted: item.isPreCompleted || false,
          sets: Array.from({ length: item.definition.default_sets }, (_, i) => ({
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

    tickSetupTimer: (state) => {
      if (!state.setupTimerActive) return;
      if (state.setupTimerSeconds > 0) {
        state.setupTimerSeconds -= 1;
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

    tickTimer: (state) => {
      if (!state.restTimerActive) return;
      if (state.restTimerSeconds > 0) {
        state.restTimerSeconds -= 1;
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
      return { ...action.payload };
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
  endSession,
} = workoutUiSlice.actions;

export default workoutUiSlice.reducer;
