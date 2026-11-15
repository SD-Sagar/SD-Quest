export type HunterRank = "Recruit" | "Warrior" | "Vanguard" | "Spartan";

export type AttributeType =
  | "strength"
  | "endurance"
  | "intelligence"
  | "discipline"
  | "mentality"
  | "agility"
  | "vitality";

export interface AttributeScore {
  score: number;
  xp: number;
  level: number;
  lifetimeHighest: number;
}

export type PlayerAttributes = Record<AttributeType, AttributeScore>;

export interface PlayerProfile {
  id: string;
  name: string;
  dob: string; // ISO Date YYYY-MM-DD
  heightCm: number;
  currentWeightKg: number;
  sex?: "male" | "female" | "other";
  fitnessExperience: "beginner" | "intermediate" | "advanced";
  fitnessObjective: string;
  rank: HunterRank;
  currentLevel: number;
  currentXp: number;
  xpToNextLevel: number;
  lifetimeHighestLevel: number;
  lifetimeTotalXp: number;
  title: string;
  avatarUrl?: string;
  conditionStatus: "normal" | "fatigued" | "chicken" | "medical_sanctuary";
  chickenStatusDaysRemaining?: number;
  isInitialized: boolean;
  attributes: PlayerAttributes;
}

export type QuestClassification = "permanent" | "temporary" | "scheduled";

export type QuestCategory =
  | "career"
  | "fitness"
  | "education"
  | "routine"
  | "household"
  | "social"
  | "personal";

export type QuestRecurrence =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "weekdays"
  | "custom";

export interface Quest {
  id: string;
  title: string;
  description?: string;
  classification: QuestClassification;
  category: QuestCategory;
  startDate: string;
  deadline?: string;
  recurrence: QuestRecurrence;
  scheduledDays?: number[];
  estimatedDurationMinutes: number;
  actualDurationMinutes?: number;
  priority: "low" | "medium" | "high" | "urgent";
  difficulty: HunterRank;
  attributeRewards: Partial<Record<AttributeType, number>>;
  xpReward: number;
  completionStatus: "pending" | "in_progress" | "completed" | "failed" | "excused";
  isManual: boolean;
  notes?: string;
  completedAt?: string;
}

export type BenchAngle =
  | "Flat"
  | "Incline 15°"
  | "Incline 30°"
  | "Incline 45°"
  | "Incline 60°"
  | "Incline 75°"
  | "Seated 90°"
  | "Decline";

export interface AvailablePlate {
  weightKg: number;
  count: number;
}

export interface GymEquipmentInventory {
  dumbbellHandleWeightKg: number;
  hasBench: boolean;
  benchNotches: BenchAngle[];
  plates: AvailablePlate[];
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  benchAngle?: BenchAngle;
  requiredEquipment: "dumbbells" | "bench_and_dumbbells" | "bodyweight" | "jump_rope";
  defaultSets: number;
  defaultRepsMin: number;
  defaultRepsMax: number;
  defaultRestSeconds: number;
  instructions: string[];
  formCues: string[];
  commonMistakes: string[];
  alternatives: string[];
}

export interface WorkoutSetLog {
  setNumber: number;
  targetWeightKg: number;
  actualWeightKg: number;
  targetReps: number;
  actualReps: number;
  rpe?: number;
  completed: boolean;
  plateCombinationDesc?: string;
}

export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface WorkoutDayPlan {
  day: DayOfWeek;
  title: string;
  targetMuscles: string;
  isRestDay: boolean;
  exercises: ExerciseDefinition[];
}

export interface ActiveWorkoutSession {
  id: string;
  title: string;
  dayName: DayOfWeek;
  targetMuscleGroup: string;
  startedAt: string;
  finishedAt?: string;
  exercises: {
    definition: ExerciseDefinition;
    sets: WorkoutSetLog[];
  }[];
  skippingObjective: {
    targetSkips: number;
    actualSkips: number;
    completed: boolean;
  };
  totalTonnageKg: number;
  status: "idle" | "active" | "resting" | "completed";
  currentExerciseIndex: number;
  currentSetIndex: number;
  restTimerSeconds: number;
  restTimerActive: boolean;
}

export interface HydrationRecord {
  targetMl: number;
  currentMl: number;
  logs: { timestamp: string; amountMl: number }[];
}

export interface LoggedMealItem {
  id: string;
  name: string;
  mealType: "Breakfast" | "Lunch" | "Snack" | "Dinner";
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  approxCostInr?: number;
  isVerified: boolean;
  timeLogged: string;
}

export interface NutritionLog {
  targetCalories: number;
  targetProteinGrams: number;
  consumedCalories: number;
  consumedProteinGrams: number;
  sattuGrams: number;
  boiledEggsCount: number;
  coffeeCups: number;
  bengaliMeals: {
    mealName: "Breakfast" | "Lunch" | "Snack" | "Dinner";
    description: string;
    estimatedCalories: number;
    estimatedProtein: number;
  }[];
}

export type CalendarDayStatus = "green" | "half_green" | "red" | "neutral";

export interface CalendarDayEntry {
  date: string;
  status: CalendarDayStatus;
  gymWorkoutCompleted: boolean;
  skippingCompleted: boolean;
  questsCompletedCount: number;
  totalQuestsCount: number;
  waterTargetMet: boolean;
  notes?: string;
}
