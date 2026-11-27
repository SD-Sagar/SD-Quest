// =============================================================================
// SD-QUEST: MASTER DOMAIN TYPES
// =============================================================================

export type HunterRank =
  | "Recruit"
  | "Initiate"
  | "Warrior"
  | "Vanguard"
  | "Knight"
  | "Gladiator"
  | "Warlord"
  | "Juggernaut"
  | "Sovereign"
  | "Ascendant"
  | "Spartan"
  | "Elite"; // legacy alias

export function getRankForLevel(level: number): HunterRank {
  if (level >= 100) return "Spartan";
  if (level >= 90) return "Ascendant";
  if (level >= 80) return "Sovereign";
  if (level >= 70) return "Juggernaut";
  if (level >= 60) return "Warlord";
  if (level >= 50) return "Gladiator";
  if (level >= 40) return "Knight";
  if (level >= 30) return "Vanguard";
  if (level >= 20) return "Warrior";
  if (level >= 10) return "Initiate";
  return "Recruit";
}
export type QuestClassification = "permanent" | "temporary" | "scheduled";
export type QuestCategory =
  | "career"
  | "fitness"
  | "routine"
  | "education"
  | "finance"
  | "household"
  | "social"
  | "personal"
  | "sleep"
  | "meditation";
export type QuestStatus = "pending" | "in_progress" | "completed" | "failed" | "excused";
export type ConditionStatus = "normal" | "fatigued" | "chicken" | "medical_sanctuary";
export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
export type MealType = "breakfast" | "morning_snack" | "lunch" | "evening_snack" | "dinner" | "custom";
export type FitnessExperience = "beginner" | "intermediate" | "advanced";

export type AttributeType =
  | "strength"
  | "endurance"
  | "intelligence"
  | "discipline"
  | "mentality"
  | "agility"
  | "vitality";

export interface Profile {
  id: string;
  name: string;
  dob: string;
  height_cm: number;
  weight_kg: number;
  sex: "male" | "female" | "other" | null;
  fitness_experience: FitnessExperience;
  fitness_objective: string;
  current_level: number;
  current_xp: number;
  xp_to_next_level: number;
  unallocated_stat_points?: number;
  grace_coins?: number;
  last_mystery_box_claimed_date?: string | null;
  current_streak?: number;
  longest_streak?: number;
  last_streak_date?: string | null;
  mental_fatigue?: number;
  physical_fatigue?: number;
  last_fatigue_update_at?: string;
  active_session_state?: any | null;
  poison_expires_at?: string | null;
  exp_booster_multiplier?: number;
  exp_booster_expires_at?: string | null;
  last_sleep_completed_at?: string | null;
  last_sleep_started_at?: string | null;
  rolling_sleep_minutes?: number;
  last_circadian_drain_at?: string | null;
  sleep_deprived_expires_at?: string | null;
  last_hydration_surge_at?: string | null;
  lifetime_highest_level: number;
  lifetime_total_xp: number;
  rank: HunterRank;
  title: string;
  condition: ConditionStatus;
  chicken_status_expires_at: string | null;
  medical_sanctuary_expires_at: string | null;
  active_main_quest: string;
  enable_gym?: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerAttributes {
  id: string;
  user_id: string;
  strength: number;
  endurance: number;
  intelligence: number;
  discipline: number;
  mentality: number;
  agility: number;
  vitality: number;
  highest_strength: number;
  highest_endurance: number;
  highest_intelligence: number;
  highest_discipline: number;
  highest_mentality: number;
  highest_agility: number;
  highest_vitality: number;
  updated_at: string;
}

export interface AttributeTransaction {
  id: string;
  user_id: string;
  attribute_type: AttributeType;
  delta: number;
  resulting_score: number;
  source_type: "workout" | "quest_completion" | "penalty" | "manual";
  source_id?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface XpTransaction {
  id: string;
  user_id: string;
  delta_xp: number;
  resulting_xp: number;
  resulting_level: number;
  source_type: string;
  source_id?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface EquipmentPlate {
  weightKg: number;
  count: number;
}

export interface EquipmentInventory {
  id: string;
  user_id: string;
  has_bench: boolean;
  bench_positions: string[];
  dumbbell_handle_weight_kg: number;
  has_barbell?: boolean;
  barbell_weight_kg?: number;
  has_ez_bar?: boolean;
  ez_bar_weight_kg?: number;
  has_cable_pulley?: boolean;
  has_leg_developer?: boolean;
  plate_10kg_count?: number;
  plate_5kg_count: number;
  plate_2_5kg_count: number;
  plate_2kg_count?: number;
  plate_1_25kg_count: number;
  plate_1kg_count?: number;
  custom_plates: EquipmentPlate[];
  updated_at: string;
}

export type ExerciseRequiredEquipment =
  | "dumbbells"
  | "bench_and_dumbbells"
  | "bodyweight"
  | "skipping_rope"
  | "barbell"
  | "bench_and_barbell"
  | "ez_bar"
  | "cable_pulley"
  | "leg_developer";

export type MetCategory =
  | "general_resistance"
  | "squats_deadlifts"
  | "vigorous_weightlifting"
  | "resistance_circuit"
  | "general_bodyweight"
  | "high_intensity_bodyweight"
  | "skipping_rope"
  | "walking_moderate";

export interface ExerciseDefinition {
  id: string;
  name: string;
  target_muscle: string;
  secondary_muscles: string[];
  bench_angle?: string | null;
  required_equipment: ExerciseRequiredEquipment;
  met_category?: MetCategory;
  instructions: string[];
  form_cues: string[];
  common_mistakes: string[];
  alternatives: string[];
  default_sets: number;
  default_reps_min: number;
  default_reps_max: number;
  default_rest_seconds: number;
  attributes_yield?: Partial<Record<AttributeType, number>>;
}

export interface TrainingSplitDay {
  id: string;
  user_id: string;
  day_of_week: DayOfWeek;
  title: string;
  target_muscles: string;
  is_rest_day: boolean;
  skipping_target: number;
  exercises: ExerciseDefinition[];
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_mode?: "system" | "custom";
  split_day: DayOfWeek;
  title: string;
  target_muscles: string;
  duration_minutes: number;
  total_tonnage_kg: number;
  skipping_target: number;
  skipping_completed: number;
  calories_burned?: number;
  estimated_calories_burned?: number;
  status: "in_progress" | "completed" | "abandoned";
  notes?: string | null;
  started_at: string;
  completed_at?: string;
  session_exercises?: any[];
}

export interface CustomWorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  day_routines: Record<string, CustomExerciseRoutine[]>;
  created_at: string;
  updated_at: string;
}

export interface CustomExerciseRoutine {
  id: string;
  name: string;
  target_muscle: string;
  bench_angle?: string;
  required_equipment?: ExerciseRequiredEquipment | string;
  sets: number;
  reps_target: number;
  target_weight_kg: number;
  rest_seconds: number;
  primary_attribute?: AttributeType;
  attributes_yield?: Partial<Record<AttributeType, number>>;
  is_custom_created?: boolean;
  phase?: "core" | "belly";
}

export interface WorkoutSetLog {
  id: string;
  session_id: string;
  user_id: string;
  exercise_name: string;
  target_muscle: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe?: number | null;
  bench_angle?: string | null;
  plate_breakdown?: string | null;
  completed: boolean;
  created_at: string;
}

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  classification: QuestClassification;
  category: QuestCategory;
  start_date: string;
  deadline?: string | null;
  recurrence: "none" | "daily" | "weekly" | "weekdays" | "custom";
  recurrence_days: number[]; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  estimated_duration_minutes: number;
  actual_duration_minutes?: number | null;
  priority: "low" | "medium" | "high" | "urgent";
  difficulty: HunterRank;
  attribute_rewards: Partial<Record<AttributeType, number>>;
  xp_reward: number;
  penalty_config: {
    xp?: number;
    discipline?: number;
  };
  status: QuestStatus;
  is_manual: boolean;
  is_fun?: boolean;
  last_completed_date?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UniversalSessionState {
  session_id: string;
  type: "quest" | "gym" | "timer";
  title: string;
  started_at: string;
  target_minutes: number;
  is_fun?: boolean;
  linked_attributes?: AttributeType[];
  category?: QuestCategory;
  domain?: "mental" | "physical" | "hybrid";
  intensity?: "light" | "moderate" | "rigorous";
  notes?: string;
}

export interface BodyMeasurement {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number;
  chest_cm?: number | null;
  waist_cm?: number | null;
  hips_cm?: number | null;
  neck_cm?: number | null;
  arms_cm?: number | null;
  forearms_cm?: number | null;
  thighs_cm?: number | null;
  calves_cm?: number | null;
  notes?: string | null;
  created_at: string;
}

export interface ProgressPhoto {
  id: string;
  user_id: string;
  date: string;
  photo_url: string;
  photo_type: "front" | "side" | "back";
  notes?: string | null;
  created_at: string;
}

export interface DailyNutritionTargets {
  user_id: string;
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  monthly_budget_inr: number;
  sattu_daily_grams: number;
  boiled_eggs_weekly_days: number;
  updated_at: string;
}

export interface FoodItem {
  id: string;
  user_id?: string | null;
  name: string;
  default_serving: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  approx_cost_inr: number;
  category: string;
  is_verified: boolean;
  description?: string | null;
  is_poisonous?: boolean;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  log_date: string;
  meal_type: MealType;
  food_name: string;
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  cost_inr: number;
  is_verified: boolean;
  logged_at: string;
}

export interface HydrationLog {
  id: string;
  user_id: string;
  log_date: string;
  amount_ml: number;
  logged_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  log_date: string;
  steps: number;
  walking_duration_minutes: number;
  distance_km: number;
  estimated_calories_burned: number;
  source: "manual" | "device_synced";
  notes?: string | null;
  created_at: string;
}

export interface MedicalSanctuaryRecord {
  id: string;
  user_id: string;
  reason: string;
  started_at: string;
  ended_at?: string | null;
  is_active: boolean;
  notes?: string | null;
}

export interface MonthlyPlayerSnapshot {
  id: string;
  user_id: string;
  year_month: string;
  ending_level: number;
  ending_rank: HunterRank;
  total_xp_gained: number;
  total_workouts_completed: number;
  total_tonnage_kg: number;
  total_skips_performed: number;
  total_quests_completed: number;
  average_discipline: number;
  created_at: string;
}

