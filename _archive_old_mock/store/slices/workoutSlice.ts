import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ActiveWorkoutSession,
  GymEquipmentInventory,
  ExerciseDefinition,
  WorkoutSetLog,
  WorkoutDayPlan,
  DayOfWeek,
} from "@/types";
import {
  DEFAULT_HOME_GYM_INVENTORY,
  calculateDumbbellPlates,
} from "@/lib/calculations/gym";

// Comprehensive 6-Day Structured Split for 20-in-1 Bench & Adjustable Dumbbells
export const MASTER_TRAINING_SCHEDULE: WorkoutDayPlan[] = [
  {
    day: "Monday",
    title: "Legs & Lower Body Foundation",
    targetMuscles: "Quadriceps, Hamstrings, Glutes, Calves",
    isRestDay: false,
    exercises: [
      {
        id: "ex-goblet-squat",
        name: "Goblet Dumbbell Squat",
        targetMuscle: "Quadriceps & Glutes",
        secondaryMuscles: ["Core", "Calves"],
        requiredEquipment: "dumbbells",
        defaultSets: 4,
        defaultRepsMin: 8,
        defaultRepsMax: 12,
        defaultRestSeconds: 90,
        instructions: [
          "Hold a single heavy dumbbell vertically against your upper chest with both hands.",
          "Keep feet shoulder-width apart, toes flared slightly out ~15 degrees.",
          "Descend under control until thighs are parallel to the floor.",
          "Drive powerfully through mid-foot and heels to full standing lockout.",
        ],
        formCues: ["Keep chest tall and proud", "Knees track in line with toes"],
        commonMistakes: ["Rounding lower back at bottom", "Knees caving inward"],
        alternatives: ["Dumbbell Front Squat with two dumbbells", "Dumbbell Sumo Squat"],
      },
      {
        id: "ex-db-rdl",
        name: "Dumbbell Romanian Deadlift (RDL)",
        targetMuscle: "Hamstrings & Glutes",
        secondaryMuscles: ["Lower Back (Erectors)", "Forearms & Grip"],
        requiredEquipment: "dumbbells",
        defaultSets: 3,
        defaultRepsMin: 8,
        defaultRepsMax: 10,
        defaultRestSeconds: 90,
        instructions: [
          "Hold two dumbbells in front of thighs with slight soft bend in knees.",
          "Hinge backward at hips, sliding dumbbells down along shins.",
          "Lower until you feel a deep, intense stretch in your hamstrings.",
          "Squeeze glutes and thrust hips forward to return to standing.",
        ],
        formCues: ["Push hips back toward wall", "Keep dumbbells tight to legs"],
        commonMistakes: ["Squatting down instead of hip-hinging", "Arching neck upward"],
        alternatives: ["Single-Leg Dumbbell RDL", "Dumbbell Good Mornings"],
      },
      {
        id: "ex-bulgarian-split-squat",
        name: "Bulgarian Split Squat",
        targetMuscle: "Quads & Glutes",
        secondaryMuscles: ["Adductors", "Core"],
        benchAngle: "Flat",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 3,
        defaultRepsMin: 8,
        defaultRepsMax: 10,
        defaultRestSeconds: 75,
        instructions: [
          "Elevate your rear foot onto the flat bench behind you.",
          "Hold dumbbells at your sides, torso leaning slightly forward ~15°.",
          "Lower your back knee smoothly toward the floor.",
          "Drive through your front heel to ascend.",
        ],
        formCues: ["Front shin stays relatively vertical", "Control the negative stretch"],
        commonMistakes: ["Overstriding causing hip strain", "Dropping knee violently to floor"],
        alternatives: ["Walking Dumbbell Lunges", "Dumbbell Step-Ups onto bench"],
      },
      {
        id: "ex-standing-calf-raise",
        name: "Standing Dumbbell Calf Raises",
        targetMuscle: "Calves (Gastrocnemius & Soleus)",
        secondaryMuscles: ["Achilles Tendon"],
        requiredEquipment: "dumbbells",
        defaultSets: 4,
        defaultRepsMin: 12,
        defaultRepsMax: 15,
        defaultRestSeconds: 60,
        instructions: [
          "Hold heavy dumbbells at your sides with balls of feet on an elevated plate edge.",
          "Lower heels into a deep, full calf stretch for 1 second.",
          "Explode upward onto big toes and peak squeeze for 1 second at the top.",
        ],
        formCues: ["Full stretch at bottom", "Pause at the apex squeeze"],
        commonMistakes: ["Bouncing reps without stretch", "Rolling ankles outward"],
        alternatives: ["Single-Leg Dumbbell Calf Raise", "Seated DB Calf Raise on Bench"],
      },
    ],
  },
  {
    day: "Tuesday",
    title: "Chest Hypertrophy & Pectoral Power",
    targetMuscles: "Upper Chest, Mid Chest, Front Delts, Triceps",
    isRestDay: false,
    exercises: [
      {
        id: "ex-inc-db-press",
        name: "Incline Dumbbell Bench Press (30°)",
        targetMuscle: "Upper Pectorals (Clavicular Head)",
        secondaryMuscles: ["Anterior Deltoids", "Triceps"],
        benchAngle: "Incline 30°",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 3,
        defaultRepsMin: 8,
        defaultRepsMax: 12,
        defaultRestSeconds: 90,
        instructions: [
          "Set 20-in-1 bench to exactly 30 degrees (notch 3).",
          "Retract shoulder blades tight into bench, maintaining natural arch.",
          "Lower dumbbells with elbows angled ~45° until a full chest stretch is achieved.",
          "Press dumbbells upward along a converging arc without clanking them together.",
        ],
        formCues: ["Keep wrists directly stacked over elbows", "Tuck elbows ~45° from ribs"],
        commonMistakes: ["Excessive incline shifting focus onto shoulders", "Flaring elbows to 90°"],
        alternatives: ["Incline 45° DB Press", "Flat Dumbbell Press"],
      },
      {
        id: "ex-flat-db-press",
        name: "Flat Dumbbell Press",
        targetMuscle: "Mid & Sternal Pectorals",
        secondaryMuscles: ["Triceps", "Front Delts"],
        benchAngle: "Flat",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 3,
        defaultRepsMin: 8,
        defaultRepsMax: 12,
        defaultRestSeconds: 90,
        instructions: [
          "Lie flat on the bench, feet driven firmly into floor.",
          "Hold dumbbells at chest level, shoulder blades retracted and depressed.",
          "Drive the dumbbells straight up over mid-chest.",
          "Lower under control with a strict 2-second negative.",
        ],
        formCues: ["Leg drive into floor", "Full deep chest stretch"],
        commonMistakes: ["Flaring elbows out horizontally", "Lifting glutes off the bench"],
        alternatives: ["Floor Dumbbell Press", "Push-ups with hands on dumbbells"],
      },
      {
        id: "ex-db-fly",
        name: "Incline Dumbbell Flyes (15°)",
        targetMuscle: "Pectoral Outer & Sternal Fibers",
        secondaryMuscles: ["Anterior Delts"],
        benchAngle: "Incline 15°",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 3,
        defaultRepsMin: 10,
        defaultRepsMax: 15,
        defaultRestSeconds: 60,
        instructions: [
          "Set bench to low 15° incline.",
          "Maintain a fixed, soft bend in elbows throughout the entire arc.",
          "Lower arms out wide until you feel an intense stretch across the chest.",
          "Bring dumbbells together in a hugging motion, squeezing pecs at the top.",
        ],
        formCues: ["Imagine hugging a wide tree trunk", "Do not bend elbows further during descent"],
        commonMistakes: ["Lowering too deep causing shoulder capsule strain", "Turning fly into a press"],
        alternatives: ["Flat Dumbbell Fly", "Close-Grip Hex DB Press"],
      },
    ],
  },
  {
    day: "Wednesday",
    title: "Back Width & Thickness (Lat Hypertrophy)",
    targetMuscles: "Lats, Rhomboids, Trapezius, Biceps, Rear Delts",
    isRestDay: false,
    exercises: [
      {
        id: "ex-one-arm-db-row",
        name: "One-Arm Dumbbell Row",
        targetMuscle: "Latissimus Dorsi",
        secondaryMuscles: ["Rhomboids", "Biceps", "Forearms"],
        benchAngle: "Flat",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 4,
        defaultRepsMin: 8,
        defaultRepsMax: 12,
        defaultRestSeconds: 75,
        instructions: [
          "Place one knee and hand on flat bench, back parallel to the floor.",
          "Hold dumbbell hanging down with full lat stretch at bottom.",
          "Pull dumbbell back toward your hip pocket, driving elbow behind torso.",
          "Pause for 1 second at full contraction before lowering smoothly.",
        ],
        formCues: ["Pull with elbow, not your bicep", "Drive toward hip pocket"],
        commonMistakes: ["Rotating torso upward to cheat weight", "Pulling dumbbell up to shoulder"],
        alternatives: ["Chest-Supported Incline DB Row", "Two-Arm Bent-Over DB Row"],
      },
      {
        id: "ex-chest-supported-row",
        name: "Chest-Supported Incline Row (45°)",
        targetMuscle: "Upper Back, Rhomboids & Mid Traps",
        secondaryMuscles: ["Rear Delts", "Lats"],
        benchAngle: "Incline 45°",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 3,
        defaultRepsMin: 10,
        defaultRepsMax: 12,
        defaultRestSeconds: 75,
        instructions: [
          "Lie face down with chest supported on the 45° bench.",
          "Let dumbbells hang straight down, fully opening shoulder blades.",
          "Row both dumbbells up, pinching shoulder blades together tightly at top.",
        ],
        formCues: ["Zero lower back strain", "Squeeze scapula for 1 count"],
        commonMistakes: ["Kicking feet or swinging on bench", "Incomplete range of motion"],
        alternatives: ["Incline Prone Rear Fly", "One-Arm Row"],
      },
      {
        id: "ex-db-shrugs",
        name: "Dumbbell Shrugs",
        targetMuscle: "Upper Trapezius",
        secondaryMuscles: ["Forearms & Grip"],
        requiredEquipment: "dumbbells",
        defaultSets: 3,
        defaultRepsMin: 12,
        defaultRepsMax: 15,
        defaultRestSeconds: 60,
        instructions: [
          "Stand tall holding heavy dumbbells at your sides.",
          "Shrug shoulders straight up toward ears.",
          "Hold peak contraction at the top for 2 full seconds.",
          "Lower slowly into a full dead-hang stretch.",
        ],
        formCues: ["Straight up and down only", "No rolling shoulders"],
        commonMistakes: ["Rolling shoulders back or forward (damages rotator cuff)"],
        alternatives: ["Seated Dumbbell Shrugs on 90° Bench"],
      },
    ],
  },
  {
    day: "Thursday",
    title: "Shoulder Overhead Power & Lateral Width",
    targetMuscles: "Lateral Deltoids, Anterior Deltoids, Upper Chest",
    isRestDay: false,
    exercises: [
      {
        id: "ex-seated-db-press",
        name: "Seated Dumbbell Overhead Press (90°)",
        targetMuscle: "Anterior & Lateral Deltoids",
        secondaryMuscles: ["Triceps", "Upper Traps"],
        benchAngle: "Seated 90°",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 3,
        defaultRepsMin: 8,
        defaultRepsMax: 12,
        defaultRestSeconds: 90,
        instructions: [
          "Set bench upright at 90° (or slight 80° notch).",
          "Kick dumbbells up to shoulder height, palms forward or semi-neutral.",
          "Press directly overhead until arms are extended overhead.",
          "Lower smoothly to chin/ear level before next repetition.",
        ],
        formCues: ["Core braced tight into bench", "Elbows slightly tucked forward ~30°"],
        commonMistakes: ["Hyperextending lower back", "Banging dumbbells violently overhead"],
        alternatives: ["Standing Dumbbell Overhead Press", "Arnold Dumbbell Press"],
      },
      {
        id: "ex-db-lat-raise",
        name: "Seated Dumbbell Lateral Raises",
        targetMuscle: "Lateral Deltoids (Boulder Shoulders)",
        secondaryMuscles: ["Upper Traps"],
        benchAngle: "Seated 90°",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 4,
        defaultRepsMin: 12,
        defaultRepsMax: 15,
        defaultRestSeconds: 60,
        instructions: [
          "Sit upright on bench, dumbbells hanging at sides.",
          "Raise dumbbells out to the sides leading with elbows and pinkies.",
          "Pause for a momentary squeeze at shoulder height.",
          "Lower with strict 2-second eccentric control.",
        ],
        formCues: ["Lead with elbows", "Do not shrug traps upward"],
        commonMistakes: ["Swinging torso for momentum", "Using too much weight with bad form"],
        alternatives: ["Standing DB Lateral Raises", "Incline Lean-Away DB Lateral Raise"],
      },
      {
        id: "ex-db-front-raise",
        name: "Dumbbell Front Raises",
        targetMuscle: "Anterior Deltoids",
        secondaryMuscles: ["Upper Pecs"],
        requiredEquipment: "dumbbells",
        defaultSets: 2,
        defaultRepsMin: 10,
        defaultRepsMax: 12,
        defaultRestSeconds: 60,
        instructions: [
          "Stand holding dumbbells resting in front of thighs.",
          "Raise one dumbbell smoothly straight forward to eye level.",
          "Lower under control, alternating arms.",
        ],
        formCues: ["Strict form", "Keep torso motionless"],
        commonMistakes: ["Leaning backward to swing weight"],
        alternatives: ["Incline Bench Front Raise"],
      },
    ],
  },
  {
    day: "Friday",
    title: "Deltoid Specialization & Rear-Delt Hypertrophy",
    targetMuscles: "Rear Delts, Lateral Delts, Upper Back, Rotator Cuff",
    isRestDay: false,
    exercises: [
      {
        id: "ex-rear-delt-fly",
        name: "Incline Prone Rear Deltoid Fly (45°)",
        targetMuscle: "Posterior Deltoids (Rear Shoulders)",
        secondaryMuscles: ["Rhomboids", "Infraspinatus"],
        benchAngle: "Incline 45°",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 4,
        defaultRepsMin: 12,
        defaultRepsMax: 15,
        defaultRestSeconds: 60,
        instructions: [
          "Lie chest-down on the 45° incline bench.",
          "Hold light dumbbells below chest with palms facing each other.",
          "Raise dumbbells out wide in a sweeping T-motion, focusing exclusively on rear delts.",
          "Lower under control without allowing weights to swing.",
        ],
        formCues: ["Feel the back of your shoulders contract", "Keep elbows slightly unlocked"],
        commonMistakes: ["Using back muscles/lats to row the weight", "Weight too heavy"],
        alternatives: ["Bent-Over Seated Rear DB Fly", "Dumbbell Face Pulls"],
      },
      {
        id: "ex-incline-y-raise",
        name: "Incline Chest-Supported Y-Raise",
        targetMuscle: "Lower Traps & Lateral/Rear Delts",
        secondaryMuscles: ["Rotator Cuff"],
        benchAngle: "Incline 45°",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 3,
        defaultRepsMin: 12,
        defaultRepsMax: 15,
        defaultRestSeconds: 60,
        instructions: [
          "Lie face down on 45° bench.",
          "Raise thumbs upward at a 45-degree angle forming a 'Y' shape with your body.",
          "Hold peak contraction for 1 second before lowering.",
        ],
        formCues: ["Thumbs pointing up to ceiling", "Bulletproof rotator cuff movement"],
        commonMistakes: ["Bending elbows", "Rushing tempo"],
        alternatives: ["Prone Cobra on Bench"],
      },
      {
        id: "ex-incline-side-raise",
        name: "Incline Side-Lying Lateral Raise (60°)",
        targetMuscle: "Lateral Deltoids (Continuous Tension)",
        secondaryMuscles: ["Upper Traps"],
        benchAngle: "Incline 60°",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 3,
        defaultRepsMin: 12,
        defaultRepsMax: 15,
        defaultRestSeconds: 60,
        instructions: [
          "Lie on your side on the 60° inclined bench.",
          "Raise single dumbbell from hip out to shoulder level.",
          "Provides maximum resistance at the stretched bottom portion.",
        ],
        formCues: ["Strict single-arm focus", "Control the descent"],
        commonMistakes: ["Jerking body backward"],
        alternatives: ["Standing Dumbbell Lateral Raise"],
      },
    ],
  },
  {
    day: "Saturday",
    title: "Arms Mastery (Biceps & Triceps Isolation)",
    targetMuscles: "Biceps Brachii, Triceps Brachii, Brachialis, Forearms",
    isRestDay: false,
    exercises: [
      {
        id: "ex-inc-db-curl",
        name: "Incline Dumbbell Bicep Curl (45°)",
        targetMuscle: "Biceps (Long Head / Pk Stretch)",
        secondaryMuscles: ["Brachialis", "Forearms"],
        benchAngle: "Incline 45°",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 3,
        defaultRepsMin: 10,
        defaultRepsMax: 12,
        defaultRestSeconds: 60,
        instructions: [
          "Set bench to 45° incline. Sit back with arms hanging straight down.",
          "Curl dumbbells up while supinating wrists (turn pinkies up toward ceiling).",
          "Squeeze biceps hard at the top without pulling elbows forward.",
          "Lower for a deep 3-second stretch at the bottom.",
        ],
        formCues: ["Keep elbows pinned behind torso", "Full supination at the peak"],
        commonMistakes: ["Swinging elbows forward turning it into a shoulder lift"],
        alternatives: ["Seated Alternating DB Curl", "Standing DB Curl"],
      },
      {
        id: "ex-hammer-curl",
        name: "Seated Dumbbell Hammer Curls",
        targetMuscle: "Brachialis & Forearms (Arm Thickness)",
        secondaryMuscles: ["Biceps Short Head"],
        benchAngle: "Seated 90°",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 3,
        defaultRepsMin: 10,
        defaultRepsMax: 12,
        defaultRestSeconds: 60,
        instructions: [
          "Sit upright on bench with dumbbells held in neutral grip (palms facing each other).",
          "Curl dumbbells up toward shoulders maintaining neutral palms.",
          "Lower under control.",
        ],
        formCues: ["Thumbs lead the upward path", "Lock elbows at your sides"],
        commonMistakes: ["Flaring elbows outward"],
        alternatives: ["Cross-Body Hammer Curls"],
      },
      {
        id: "ex-overhead-tricep-ext",
        name: "Seated Overhead Dumbbell Tricep Extension",
        targetMuscle: "Triceps (Long Head)",
        secondaryMuscles: ["Triceps Lateral Head"],
        benchAngle: "Seated 90°",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 3,
        defaultRepsMin: 10,
        defaultRepsMax: 12,
        defaultRestSeconds: 75,
        instructions: [
          "Sit on 90° bench. Cup one heavy dumbbell with both hands overhead.",
          "Lower dumbbell smoothly behind your head until your forearms touch biceps.",
          "Press dumbbell back overhead to full tricep lockout.",
        ],
        formCues: ["Keep elbows pointed relatively forward", "Deep stretch behind neck"],
        commonMistakes: ["Flaring elbows out too wide", "Short-changing depth"],
        alternatives: ["Single-Arm Overhead DB Extension", "Dumbbell Skull Crushers"],
      },
      {
        id: "ex-db-skull-crusher",
        name: "Flat Dumbbell Skull Crushers",
        targetMuscle: "Triceps (Medial & Lateral Heads)",
        secondaryMuscles: ["Forearms"],
        benchAngle: "Flat",
        requiredEquipment: "bench_and_dumbbells",
        defaultSets: 3,
        defaultRepsMin: 10,
        defaultRepsMax: 12,
        defaultRestSeconds: 60,
        instructions: [
          "Lie flat on bench, holding dumbbells straight up with neutral grip.",
          "Hinged exclusively at elbows, lower dumbbells to either side of your temples.",
          "Extend elbows powerfully back to starting lockout.",
        ],
        formCues: ["Upper arms stay perpendicular to floor", "Elbows stay tight"],
        commonMistakes: ["Moving shoulders instead of isolating elbows"],
        alternatives: ["Close-Grip Dumbbell Bench Press"],
      },
    ],
  },
  {
    day: "Sunday",
    title: "Honored Recovery & Mobility Protocol",
    targetMuscles: "Full Body Active Recovery",
    isRestDay: true,
    exercises: [],
  },
];

interface WorkoutState {
  inventory: GymEquipmentInventory;
  schedule: WorkoutDayPlan[];
  selectedSplitDay: DayOfWeek;
  activeSession: ActiveWorkoutSession | null;
  workoutHistoryCount: number;
}

const initialState: WorkoutState = {
  inventory: DEFAULT_HOME_GYM_INVENTORY,
  schedule: MASTER_TRAINING_SCHEDULE,
  selectedSplitDay: "Tuesday", // default to Tuesday Chest for testing
  activeSession: null,
  workoutHistoryCount: 14,
};

export const workoutSlice = createSlice({
  name: "workout",
  initialState,
  reducers: {
    selectSplitDay: (state, action: PayloadAction<DayOfWeek>) => {
      state.selectedSplitDay = action.payload;
    },

    updateEquipmentInventory: (state, action: PayloadAction<Partial<GymEquipmentInventory>>) => {
      state.inventory = { ...state.inventory, ...action.payload };
    },

    startWorkoutForDay: (state, action: PayloadAction<DayOfWeek | undefined>) => {
      const targetDay = action.payload || state.selectedSplitDay;
      const dayPlan = state.schedule.find((p) => p.day === targetDay) || state.schedule[1];

      if (dayPlan.isRestDay) return;

      const exercisesWithSets = dayPlan.exercises.map((ex) => {
        // Base suggested load:
        let targetWeight = 15.0;
        if (ex.id.includes("squat") || ex.id.includes("rdl")) targetWeight = 22.5;
        if (ex.id.includes("press") && !ex.id.includes("shoulder")) targetWeight = 17.5;
        if (ex.id.includes("overhead") || ex.id.includes("row")) targetWeight = 15.0;
        if (ex.id.includes("lat-raise") || ex.id.includes("rear-delt") || ex.id.includes("y-raise")) targetWeight = 5.0;
        if (ex.id.includes("curl") || ex.id.includes("tricep")) targetWeight = 10.0;

        const plateInfo = calculateDumbbellPlates(targetWeight, state.inventory, true);

        const sets: WorkoutSetLog[] = Array.from({ length: ex.defaultSets }, (_, i) => ({
          setNumber: i + 1,
          targetWeightKg: plateInfo.achievableWeightKg,
          actualWeightKg: plateInfo.achievableWeightKg,
          targetReps: ex.defaultRepsMin,
          actualReps: ex.defaultRepsMin,
          rpe: 8,
          completed: false,
          plateCombinationDesc: plateInfo.summaryString,
        }));

        return { definition: ex, sets };
      });

      state.activeSession = {
        id: `session-${Date.now()}`,
        title: `${dayPlan.day}: ${dayPlan.title}`,
        dayName: dayPlan.day,
        targetMuscleGroup: dayPlan.targetMuscles,
        startedAt: new Date().toISOString(),
        exercises: exercisesWithSets,
        skippingObjective: {
          targetSkips: 100,
          actualSkips: 0,
          completed: false,
        },
        totalTonnageKg: 0,
        status: "active",
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        restTimerSeconds: 90,
        restTimerActive: false,
      };
    },

    completeCurrentSet: (
      state,
      action: PayloadAction<{ actualWeightKg: number; actualReps: number; rpe: number }>
    ) => {
      if (!state.activeSession) return;
      const { currentExerciseIndex, currentSetIndex, exercises } = state.activeSession;
      const exercise = exercises[currentExerciseIndex];
      if (!exercise) return;

      const currentSet = exercise.sets[currentSetIndex];
      if (currentSet) {
        currentSet.actualWeightKg = action.payload.actualWeightKg;
        currentSet.actualReps = action.payload.actualReps;
        currentSet.rpe = action.payload.rpe;
        currentSet.completed = true;

        const setTonnage = action.payload.actualWeightKg * action.payload.actualReps * 2;
        state.activeSession.totalTonnageKg += Math.round(setTonnage);

        state.activeSession.restTimerSeconds = exercise.definition.defaultRestSeconds;
        state.activeSession.restTimerActive = true;
        state.activeSession.status = "resting";

        if (currentSetIndex + 1 < exercise.sets.length) {
          state.activeSession.currentSetIndex += 1;
        } else if (currentExerciseIndex + 1 < exercises.length) {
          state.activeSession.currentExerciseIndex += 1;
          state.activeSession.currentSetIndex = 0;
        }
      }
    },

    tickRestTimer: (state) => {
      if (!state.activeSession || !state.activeSession.restTimerActive) return;
      if (state.activeSession.restTimerSeconds > 0) {
        state.activeSession.restTimerSeconds -= 1;
      } else {
        state.activeSession.restTimerActive = false;
        state.activeSession.status = "active";
      }
    },

    adjustRestTimer: (state, action: PayloadAction<number>) => {
      if (!state.activeSession) return;
      state.activeSession.restTimerSeconds = Math.max(0, state.activeSession.restTimerSeconds + action.payload);
    },

    skipRestTimer: (state) => {
      if (!state.activeSession) return;
      state.activeSession.restTimerActive = false;
      state.activeSession.restTimerSeconds = 0;
      state.activeSession.status = "active";
    },

    completeSkippingObjective: (state, action: PayloadAction<number>) => {
      if (!state.activeSession) return;
      state.activeSession.skippingObjective.actualSkips = action.payload;
      state.activeSession.skippingObjective.completed =
        action.payload >= state.activeSession.skippingObjective.targetSkips;
    },

    finishWorkout: (state) => {
      if (!state.activeSession) return;
      state.activeSession.status = "completed";
      state.activeSession.finishedAt = new Date().toISOString();
      state.workoutHistoryCount += 1;
    },

    discardWorkout: (state) => {
      state.activeSession = null;
    },
  },
});

export const {
  selectSplitDay,
  updateEquipmentInventory,
  startWorkoutForDay,
  completeCurrentSet,
  tickRestTimer,
  adjustRestTimer,
  skipRestTimer,
  completeSkippingObjective,
  finishWorkout,
  discardWorkout,
} = workoutSlice.actions;

export default workoutSlice.reducer;
