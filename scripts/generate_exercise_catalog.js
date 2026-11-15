const fs = require('fs');
const path = require('path');

function createCatalog() {
  const tsHeader = `import { DayOfWeek, HunterRank } from "@/types";

export interface MasterExercise {
  id: string;
  name: string;
  split_day: DayOfWeek;
  order_index: number;
  target_muscle: string;
  secondary_muscles: string[];
  bench_angle: "Flat" | "Incline 15°" | "Incline 30°" | "Incline 45°" | "Incline 60°" | "Seated 90°" | "Decline" | "Floor / Standing";
  required_equipment: "dumbbells" | "bench_and_dumbbells" | "bodyweight" | "skipping_rope";
  unlock_tier: HunterRank;
  unlock_level: number;
  unlock_criteria: string;
  target_duration_mins: number;
  default_sets: number;
  default_reps_min: number;
  default_reps_max: number;
  default_rest_seconds: number;
  instructions: string[];
  form_cues: string[];
  common_mistakes: string[];
  alternatives: string[];
  demo_steps: {
    step: number;
    title: string;
    description: string;
    coachTip: string;
  }[];
}
`;

  // We write helper function in the script to generate all 140+ movements
  const catalogCode = fs.readFileSync('sd-quest/scripts/catalog_data.js', 'utf8');
  return tsHeader + catalogCode;
}

