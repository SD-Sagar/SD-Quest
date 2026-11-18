import { DayOfWeek, HunterRank, AttributeType, MetCategory } from "@/types";
import { resolveExerciseMetCategory } from "@/lib/calculations/calorieEngine";

export interface MasterExercise {
  id: string;
  name: string;
  split_day: DayOfWeek;
  order_index: number;
  target_muscle: string;
  secondary_muscles: string[];
  bench_angle: "Flat" | "Incline 15°" | "Incline 30°" | "Incline 45°" | "Incline 60°" | "Incline 75°" | "Seated 90°" | "Decline" | "Floor / Standing";
  required_equipment: "dumbbells" | "bench_and_dumbbells" | "bodyweight" | "skipping_rope";
  unlock_tier: HunterRank;
  unlock_level: number;
  unlock_criteria: string;
  target_duration_mins: number;
  default_sets: number;
  default_reps_min: number;
  default_reps_max: number;
  default_rest_seconds: number;
  met_category?: MetCategory;
  attribute_yield?: Partial<Record<AttributeType, number>>;
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

export const MASTER_EXERCISE_CATALOG: MasterExercise[] = [
  {
    "id": "ex-goblet-squat",
    "name": "Goblet Dumbbell Squat",
    "split_day": "Monday",
    "order_index": 1,
    "target_muscle": "Quadriceps & Glutes",
    "secondary_muscles": [
      "Core",
      "Calves"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 8,
    "default_sets": 4,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 90,
    "instructions": [
      "Stand shoulder-width apart, flare toes 20° outward.",
      "Hold dumbbell vertically against upper chest with palms under the top plate.",
      "Inhale deep into belly, push hips backward and bend knees until thighs hit parallel.",
      "Drive through midfoot, exhale forcefully at top lockout."
    ],
    "form_cues": [
      "Chest tall and proud",
      "Spread the floor with feet",
      "Knees track over second toe"
    ],
    "common_mistakes": [
      "Knees collapsing inward (valgus)",
      "Rounding lower back at bottom",
      "Heels lifting off ground"
    ],
    "alternatives": [
      "Dumbbell Front Squat",
      "Dumbbell Sumo Squat"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Torso & Horn Grip",
        "description": "Cup dumbbell against sternum like a goblet, elbows tucked tight to ribs.",
        "coachTip": "Maintain proud ribcage."
      },
      {
        "step": 2,
        "title": "The Descent",
        "description": "Hinge hips slightly back then drop straight down between heels.",
        "coachTip": "Inhale and brace core."
      },
      {
        "step": 3,
        "title": "Concentric Drive",
        "description": "Push the ground away to return to full upright lockout.",
        "coachTip": "Squeeze glutes at top."
      }
    ]
  },
  {
    "id": "ex-db-front-squat",
    "name": "Dumbbell Front Squat",
    "split_day": "Monday",
    "order_index": 2,
    "target_muscle": "Quadriceps & Core",
    "secondary_muscles": [
      "Upper Back",
      "Glutes"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Stage II",
    "target_duration_mins": 8,
    "default_sets": 4,
    "default_reps_min": 8,
    "default_reps_max": 10,
    "default_rest_seconds": 90,
    "instructions": [
      "Rest two dumbbells on front shoulders with elbows pointing forward.",
      "Keep torso completely upright as you descend into a deep squat.",
      "Drive up through heels while keeping elbows lifted."
    ],
    "form_cues": [
      "Elbows high throughout",
      "Sit between your heels"
    ],
    "common_mistakes": [
      "Dropping elbows forward",
      "Excessive forward torso pitch"
    ],
    "alternatives": [
      "Goblet Dumbbell Squat",
      "Dumbbell Sumo Squat"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Front Rack Anchor",
        "description": "Rest heads of dumbbells on deltoids.",
        "coachTip": "Elbows up parallel to floor."
      },
      {
        "step": 2,
        "title": "Deep Knee Flexion",
        "description": "Squat down with vertical torso angle.",
        "coachTip": "Deep breath in on descent."
      },
      {
        "step": 3,
        "title": "Quad Drive",
        "description": "Drive vertically to lockout.",
        "coachTip": "Exhale through teeth at top."
      }
    ]
  },
  {
    "id": "ex-db-sumo-squat",
    "name": "Dumbbell Sumo Squat",
    "split_day": "Monday",
    "order_index": 3,
    "target_muscle": "Adductors & Glutes",
    "secondary_muscles": [
      "Quadriceps",
      "Hamstrings"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 15,
    "default_rest_seconds": 75,
    "instructions": [
      "Take a wide stance (1.5x shoulder width) with toes angled 45° outward.",
      "Hold single dumbbell hanging straight down between legs.",
      "Squat straight down, pushing knees wide along toe angle.",
      "Squeeze inner thighs and glutes to return to stand."
    ],
    "form_cues": [
      "Knees wide and flared",
      "Vertical pelvis descent"
    ],
    "common_mistakes": [
      "Leaning forward excessively",
      "Knees caving inwards"
    ],
    "alternatives": [
      "Goblet Dumbbell Squat",
      "Dumbbell Lateral Lunge"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Wide Stance",
        "description": "Set feet wide, toes flared 45 degrees.",
        "coachTip": "Dumbbell hangs perpendicular."
      },
      {
        "step": 2,
        "title": "Adductor Descent",
        "description": "Drop hips straight down, knees opening wide.",
        "coachTip": "Feel inner thigh stretch."
      },
      {
        "step": 3,
        "title": "Glute Lockout",
        "description": "Drive up and contract glutes forcefully.",
        "coachTip": "Do not hyperextend spine."
      }
    ]
  },
  {
    "id": "ex-db-rdl",
    "name": "Dumbbell Romanian Deadlift (RDL)",
    "split_day": "Monday",
    "order_index": 4,
    "target_muscle": "Hamstrings & Glutes",
    "secondary_muscles": [
      "Erectors",
      "Grip",
      "Forearms"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 8,
    "default_sets": 4,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 90,
    "instructions": [
      "Hold two dumbbells against front of thighs with soft, unlocked knees.",
      "Push hips backward as if trying to touch the wall behind you.",
      "Lower dumbbells grazing along shins until hamstrings reach peak stretch.",
      "Drive hips forward by contracting glutes and hamstrings to return to standing."
    ],
    "form_cues": [
      "Push butt backward",
      "Shins remain vertical",
      "Keep dumbbells tight to legs"
    ],
    "common_mistakes": [
      "Rounding the lumbar spine",
      "Squatting down instead of hip hinging",
      "Letting dumbbells drift away"
    ],
    "alternatives": [
      "Single-Leg Romanian Deadlift",
      "Dumbbell Good Morning"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "The Hinge Setup",
        "description": "Stand tall, soft knees, shoulder blades packed.",
        "coachTip": "Look 6 feet ahead on floor."
      },
      {
        "step": 2,
        "title": "Posterior Glide",
        "description": "Slide hips back as dumbbells shave shins.",
        "coachTip": "Stop when hips stop moving back."
      },
      {
        "step": 3,
        "title": "Hip Extension",
        "description": "Drive hips forward into the dumbbells.",
        "coachTip": "Exhale and lock glutes."
      }
    ]
  },
  {
    "id": "ex-db-stiff-leg-dl",
    "name": "Dumbbell Stiff-Leg Deadlift",
    "split_day": "Monday",
    "order_index": 5,
    "target_muscle": "Hamstrings (Lower/Tendon)",
    "secondary_muscles": [
      "Glutes",
      "Lower Back"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 10,
    "unlock_criteria": "Warrior Rank Hinge Mastery",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 90,
    "instructions": [
      "Keep knees nearly straight with minimal micro-bend.",
      "Hinge at the hips, keeping back flat as weights descend lower toward ankles.",
      "Feel intense loaded stretch in hamstrings before reversing."
    ],
    "form_cues": [
      "Knees almost locked but not hyperextended",
      "Focus on hamstring stretch"
    ],
    "common_mistakes": [
      "Rounding thoracic or lumbar spine",
      "Jerking the weights at the bottom"
    ],
    "alternatives": [
      "Dumbbell Romanian Deadlift (RDL)",
      "Single-Leg Romanian Deadlift"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Fixed Knee Angle",
        "description": "Set minimal micro-bend in knees and lock the joint angle.",
        "coachTip": "Neutral neck."
      },
      {
        "step": 2,
        "title": "Deep Stretch Descent",
        "description": "Hinge pure at hips down to mid-shin.",
        "coachTip": "Inhale controlled."
      },
      {
        "step": 3,
        "title": "Hamstring Pull",
        "description": "Pull torso upright purely with hamstrings.",
        "coachTip": "Smooth steady tempo."
      }
    ]
  },
  {
    "id": "ex-db-reverse-lunge",
    "name": "Dumbbell Reverse Lunge",
    "split_day": "Monday",
    "order_index": 6,
    "target_muscle": "Quadriceps & Glutes",
    "secondary_muscles": [
      "Calves",
      "Core"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Stage II",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Hold dumbbells at sides.",
      "Take a controlled step backward and lower back knee until it hovers 1 inch above floor.",
      "Front shin stays vertical.",
      "Push through front heel to step back forward."
    ],
    "form_cues": [
      "Soft landing with rear foot",
      "Front heel firmly planted",
      "Torso upright"
    ],
    "common_mistakes": [
      "Slamming rear knee into floor",
      "Forward knee pushing past toes uncontrollably"
    ],
    "alternatives": [
      "Dumbbell Forward Lunge",
      "Bulgarian Split Squat"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Backward Step",
        "description": "Step back smoothly onto ball of rear foot.",
        "coachTip": "Keep hips square."
      },
      {
        "step": 2,
        "title": "Double 90° Bend",
        "description": "Lower until front and rear knees form 90 degrees.",
        "coachTip": "Back knee hovers."
      },
      {
        "step": 3,
        "title": "Front Leg Drive",
        "description": "Power forward through front midfoot.",
        "coachTip": "Exhale to stand."
      }
    ]
  },
  {
    "id": "ex-db-forward-lunge",
    "name": "Dumbbell Forward Lunge",
    "split_day": "Monday",
    "order_index": 7,
    "target_muscle": "Quadriceps & Deceleration",
    "secondary_muscles": [
      "Glutes",
      "Calves"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Rank Unlocked",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Step forward with dumbbells at sides.",
      "Decelerate smoothly and bend both knees.",
      "Push explosively off the front heel to return to start."
    ],
    "form_cues": [
      "Control the landing",
      "Abs braced tight"
    ],
    "common_mistakes": [
      "Stomping forward foot",
      "Torso collapsing forward"
    ],
    "alternatives": [
      "Dumbbell Reverse Lunge",
      "Dumbbell Walking Lunge"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Lunge Entry",
        "description": "Step forward cleanly.",
        "coachTip": "Brace core."
      },
      {
        "step": 2,
        "title": "Braking Phase",
        "description": "Absorb impact through quadriceps.",
        "coachTip": "Stay centered."
      },
      {
        "step": 3,
        "title": "Push Back",
        "description": "Explode off lead heel back to starting stance.",
        "coachTip": "Drive cleanly."
      }
    ]
  },
  {
    "id": "ex-db-walking-lunge",
    "name": "Dumbbell Walking Lunge",
    "split_day": "Monday",
    "order_index": 8,
    "target_muscle": "Total Leg Hypertrophy",
    "secondary_muscles": [
      "Glutes",
      "Hamstrings",
      "Calves"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 7,
    "unlock_criteria": "Initiate Dynamic Legs",
    "target_duration_mins": 8,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 16,
    "default_rest_seconds": 90,
    "instructions": [
      "Step forward continuously, alternating legs with each stride.",
      "Maintain steady fluid pace without rushing.",
      "Keep dumbbells steady at sides without swinging."
    ],
    "form_cues": [
      "Continuous forward motion",
      "Knees track over toes"
    ],
    "common_mistakes": [
      "Swinging dumbbells for momentum",
      "Short shallow strides"
    ],
    "alternatives": [
      "Dumbbell Reverse Lunge",
      "Dumbbell Step-Up"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Lead Step",
        "description": "Step forward into lunge.",
        "coachTip": "Torso tall."
      },
      {
        "step": 2,
        "title": "Transition",
        "description": "Drive directly through front heel into the next stride.",
        "coachTip": "Seamless movement."
      },
      {
        "step": 3,
        "title": "Stride Rhythm",
        "description": "Continue smoothly alternating legs.",
        "coachTip": "Keep dumbbells silent."
      }
    ]
  },
  {
    "id": "ex-bulgarian-split-squat",
    "name": "Bulgarian Split Squat",
    "split_day": "Monday",
    "order_index": 9,
    "target_muscle": "Quadriceps & Glute Isolation",
    "secondary_muscles": [
      "Adductors",
      "Core Balance"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Rank Bench Unlocked",
    "target_duration_mins": 8,
    "default_sets": 3,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 90,
    "instructions": [
      "Place rear foot laces-down on flat bench behind you.",
      "Lower hips down and slightly back until front thigh is parallel to floor.",
      "Push aggressively through front heel to return to top."
    ],
    "form_cues": [
      "Front shin vertical",
      "Lean slightly forward to bias glutes",
      "Deep hip flexion"
    ],
    "common_mistakes": [
      "Pushing off rear foot instead of front leg",
      "Front heel lifting off floor"
    ],
    "alternatives": [
      "Static Split Squat",
      "Dumbbell Reverse Lunge"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Bench Placement",
        "description": "Rest rear shoelaces on flat bench.",
        "coachTip": "Find comfortable stride length."
      },
      {
        "step": 2,
        "title": "Descent",
        "description": "Lower straight down until front thigh is parallel.",
        "coachTip": "Front knee tracks toe."
      },
      {
        "step": 3,
        "title": "Drive",
        "description": "Push directly through front midfoot to stand.",
        "coachTip": "Exhale through teeth."
      }
    ]
  },
  {
    "id": "ex-static-split-squat",
    "name": "Static Split Squat",
    "split_day": "Monday",
    "order_index": 10,
    "target_muscle": "Quadriceps & Hip Flexors",
    "secondary_muscles": [
      "Glutes",
      "Balance"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 3,
    "unlock_criteria": "Recruit Stage III",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Set feet in stationary staggered split stance.",
      "Perform all reps on one leg before switching, without moving feet between reps."
    ],
    "form_cues": [
      "Both feet stay anchored",
      "Even weight distribution"
    ],
    "common_mistakes": [
      "Shifting feet between reps",
      "Front knee caving inward"
    ],
    "alternatives": [
      "Bulgarian Split Squat",
      "Dumbbell Reverse Lunge"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Split Anchor",
        "description": "Set wide split stance on floor.",
        "coachTip": "Feet stay glued."
      },
      {
        "step": 2,
        "title": "Vertical Reps",
        "description": "Pump reps up and down smoothly.",
        "coachTip": "Smooth rhythm."
      },
      {
        "step": 3,
        "title": "Side Switch",
        "description": "Complete sets on both legs.",
        "coachTip": "Equal intensity."
      }
    ]
  },
  {
    "id": "ex-db-step-up",
    "name": "Dumbbell Step-Up",
    "split_day": "Monday",
    "order_index": 11,
    "target_muscle": "Glute & Quad Power",
    "secondary_muscles": [
      "Calves",
      "Core"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 3,
    "unlock_criteria": "Recruit Bench Agility",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Place entire foot on flat bench.",
      "Drive through top foot to stand atop bench.",
      "Lower back down with controlled 2-second negative."
    ],
    "form_cues": [
      "Lead leg does 90% of the work",
      "Do not jump off bottom foot"
    ],
    "common_mistakes": [
      "Bouncing off bottom toe",
      "Incomplete hip extension at top"
    ],
    "alternatives": [
      "Bulgarian Split Squat",
      "Dumbbell Forward Lunge"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Bench Footing",
        "description": "Plant entire foot on bench surface.",
        "coachTip": "No heel hanging."
      },
      {
        "step": 2,
        "title": "Top Leg Lift",
        "description": "Stand up without jumping off back foot.",
        "coachTip": "Feel top quad/glute."
      },
      {
        "step": 3,
        "title": "Slow Descent",
        "description": "Step down softly.",
        "coachTip": "Control the negative."
      }
    ]
  },
  {
    "id": "ex-lateral-lunge",
    "name": "Dumbbell Lateral Lunge",
    "split_day": "Monday",
    "order_index": 12,
    "target_muscle": "Adductors & Glute Medius",
    "secondary_muscles": [
      "Quadriceps",
      "Mobility"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 6,
    "unlock_criteria": "Initiate Frontal Plane",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Step wide to the side, pushing hips backward as you bend the stepping knee.",
      "Keep non-stepping leg completely straight.",
      "Push off side heel to return to center."
    ],
    "form_cues": [
      "Trail leg straight",
      "Hips push back like a squat on one side"
    ],
    "common_mistakes": [
      "Bent knee collapsing inward",
      "Torso twisting sideways"
    ],
    "alternatives": [
      "Dumbbell Sumo Squat",
      "Goblet Dumbbell Squat"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Side Step",
        "description": "Step wide to lateral side.",
        "coachTip": "Keep toes pointing forward."
      },
      {
        "step": 2,
        "title": "Lateral Hinge",
        "description": "Sink hips back on stepping leg.",
        "coachTip": "Trail leg locked straight."
      },
      {
        "step": 3,
        "title": "Center Push",
        "description": "Push off outside foot back to start.",
        "coachTip": "Brisk return."
      }
    ]
  },
  {
    "id": "ex-db-glute-bridge",
    "name": "Dumbbell Glute Bridge",
    "split_day": "Monday",
    "order_index": 13,
    "target_muscle": "Gluteus Maximus",
    "secondary_muscles": [
      "Hamstrings",
      "Core"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie on back with knees bent, feet flat.",
      "Rest dumbbell securely across hips.",
      "Drive through heels to lift hips until thighs and torso align.",
      "Squeeze glutes hard for 2 seconds at top."
    ],
    "form_cues": [
      "Ribs pinned down",
      "Squeeze glutes, do not arch lower back"
    ],
    "common_mistakes": [
      "Overarching lumbar spine",
      "Driving through toes"
    ],
    "alternatives": [
      "Dumbbell Hip Thrust",
      "Single-Leg Glute Bridge"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Floor Setup",
        "description": "Lie supine, knees at 90°, dumbbell on hip crease.",
        "coachTip": "Brace abs."
      },
      {
        "step": 2,
        "title": "Hip Lift",
        "description": "Bridge hips upward into lockout.",
        "coachTip": "Drive heels into floor."
      },
      {
        "step": 3,
        "title": "Glute Peak",
        "description": "Hold contraction 2 seconds.",
        "coachTip": "Exhale fully."
      }
    ]
  },
  {
    "id": "ex-db-hip-thrust",
    "name": "Dumbbell Hip Thrust",
    "split_day": "Monday",
    "order_index": 14,
    "target_muscle": "Glute Peak Hypertrophy",
    "secondary_muscles": [
      "Hamstrings",
      "Core"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Bench Glute Power",
    "target_duration_mins": 8,
    "default_sets": 4,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 90,
    "instructions": [
      "Anchor upper shoulder blades against flat bench edge.",
      "Place heavy dumbbell across pelvis.",
      "Lower hips toward floor then thrust upward until torso and thighs form a flat bridge."
    ],
    "form_cues": [
      "Chin tucked to chest",
      "Drive through heels",
      "Full hip extension"
    ],
    "common_mistakes": [
      "Looking at ceiling (lumbar hyperextension)",
      "Incomplete lockout"
    ],
    "alternatives": [
      "Dumbbell Glute Bridge",
      "Single-Leg Glute Bridge"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Bench Anchor",
        "description": "Rest mid-scapula on edge of bench.",
        "coachTip": "Chin tucked down."
      },
      {
        "step": 2,
        "title": "Thrust",
        "description": "Drive hips skyward through heels.",
        "coachTip": "Squeeze glutes violently."
      },
      {
        "step": 3,
        "title": "Horizontal Tabletop",
        "description": "Hold flat bridge position.",
        "coachTip": "Exhale at peak."
      }
    ]
  },
  {
    "id": "ex-single-leg-glute-bridge",
    "name": "Single-Leg Glute Bridge",
    "split_day": "Monday",
    "order_index": 15,
    "target_muscle": "Glute Unilateral Balance",
    "secondary_muscles": [
      "Hamstrings",
      "Lower Back"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Balance",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie on floor with one knee bent and other leg extended straight.",
      "Drive through working heel to lift pelvis.",
      "Keep hips level and square throughout."
    ],
    "form_cues": [
      "Hips stay parallel to ceiling",
      "Intense unilateral glute contraction"
    ],
    "common_mistakes": [
      "Hips tilting to one side",
      "Pushing through neck or shoulders"
    ],
    "alternatives": [
      "Dumbbell Glute Bridge",
      "Dumbbell Hip Thrust"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Single Leg Anchor",
        "description": "One foot flat on floor, opposite leg floating.",
        "coachTip": "Keep pelvis level."
      },
      {
        "step": 2,
        "title": "One-Leg Bridge",
        "description": "Press working heel down to elevate hips.",
        "coachTip": "Pure glute focus."
      },
      {
        "step": 3,
        "title": "Level Top",
        "description": "Hold level at top for 1 count.",
        "coachTip": "Lower under control."
      }
    ]
  },
  {
    "id": "ex-standing-db-calf-raise",
    "name": "Standing Dumbbell Calf Raise",
    "split_day": "Monday",
    "order_index": 16,
    "target_muscle": "Gastrocnemius (Calves)",
    "secondary_muscles": [
      "Tibialis",
      "Ankles"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 6,
    "default_sets": 4,
    "default_reps_min": 15,
    "default_reps_max": 20,
    "default_rest_seconds": 60,
    "instructions": [
      "Hold dumbbells at sides with balls of feet on a raised plate rim.",
      "Lower heels down into deep stretch.",
      "Press onto big toes to raise as high as possible, holding peak for 1 second."
    ],
    "form_cues": [
      "Full stretch at bottom",
      "Pause 1 second at top contraction"
    ],
    "common_mistakes": [
      "Bouncing through Achilles tendon",
      "Rolling onto pinky toes"
    ],
    "alternatives": [
      "Single-Leg Calf Raise",
      "Seated Dumbbell Calf Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Plate Edge Setup",
        "description": "Balls of feet on plate edge, heels hanging.",
        "coachTip": "Hold dumbbells steady."
      },
      {
        "step": 2,
        "title": "Deep Stretch",
        "description": "Drop heels below plate rim.",
        "coachTip": "Feel deep calf stretch."
      },
      {
        "step": 3,
        "title": "High Peak",
        "description": "Rise onto balls of feet, contracting calves.",
        "coachTip": "Squeeze 1s."
      }
    ]
  },
  {
    "id": "ex-single-leg-calf-raise",
    "name": "Single-Leg Calf Raise",
    "split_day": "Monday",
    "order_index": 17,
    "target_muscle": "Calf Unilateral Strength",
    "secondary_muscles": [
      "Ankles",
      "Balance"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Ankle Stability",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 15,
    "default_reps_max": 20,
    "default_rest_seconds": 60,
    "instructions": [
      "Hold one dumbbell in hand on working side.",
      "Perform high-range calf raises on a single foot.",
      "Control the tempo strictly (3s down, 1s hold, 1s up)."
    ],
    "form_cues": [
      "Strict slow tempo",
      "No momentum bouncing"
    ],
    "common_mistakes": [
      "Rushing the reps",
      "Bent knee"
    ],
    "alternatives": [
      "Standing Dumbbell Calf Raise",
      "Seated Dumbbell Calf Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Single Foot Anchor",
        "description": "Balance on ball of one foot.",
        "coachTip": "Light hand touch for balance."
      },
      {
        "step": 2,
        "title": "Controlled Reps",
        "description": "Lower into stretch, rise to ceiling.",
        "coachTip": "Strict control."
      },
      {
        "step": 3,
        "title": "Peak Squeeze",
        "description": "Contract calf muscle hard.",
        "coachTip": "No bouncing."
      }
    ]
  },
  {
    "id": "ex-seated-db-calf-raise",
    "name": "Seated Dumbbell Calf Raise",
    "split_day": "Monday",
    "order_index": 18,
    "target_muscle": "Soleus (Deep Calf Muscle)",
    "secondary_muscles": [
      "Ankle Stabilizers"
    ],
    "bench_angle": "Seated 90°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Soleus Focus",
    "target_duration_mins": 6,
    "default_sets": 4,
    "default_reps_min": 15,
    "default_reps_max": 20,
    "default_rest_seconds": 60,
    "instructions": [
      "Sit tall on bench set to 90° with knees at 90° angle.",
      "Place dumbbells across knees with balls of feet on floor/plate.",
      "Raise heels high to work the deep soleus muscle."
    ],
    "form_cues": [
      "Soleus activates with bent knee",
      "Keep dumbbells balanced over knees"
    ],
    "common_mistakes": [
      "Slouching torso",
      "Cutting the range of motion short"
    ],
    "alternatives": [
      "Standing Dumbbell Calf Raise",
      "Single-Leg Calf Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Seated Setup",
        "description": "Sit on 90° bench, dumbbells resting on knees.",
        "coachTip": "Feet on edge."
      },
      {
        "step": 2,
        "title": "Heel Drop",
        "description": "Drop heels into deep stretch.",
        "coachTip": "Bent knee isolates soleus."
      },
      {
        "step": 3,
        "title": "Soleus Push",
        "description": "Push onto toes to maximum height.",
        "coachTip": "Hard squeeze."
      }
    ]
  },
  {
    "id": "ex-db-good-morning",
    "name": "Dumbbell Good Morning",
    "split_day": "Monday",
    "order_index": 19,
    "target_muscle": "Hamstrings & Spinal Erectors",
    "secondary_muscles": [
      "Glutes",
      "Core"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 12,
    "unlock_criteria": "Warrior Posterior Chain",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Hold single dumbbell horizontally across upper chest.",
      "Hinge backward at hips with flat spine and soft knees.",
      "Lower torso to near-parallel to floor, then contract hamstrings to return to stand."
    ],
    "form_cues": [
      "Keep spine completely rigid",
      "Push hips far behind you"
    ],
    "common_mistakes": [
      "Rounding the lower back",
      "Bending knees excessively into a squat"
    ],
    "alternatives": [
      "Dumbbell Romanian Deadlift (RDL)",
      "Single-Leg Romanian Deadlift"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Chest Hug",
        "description": "Hold dumbbell firm against upper chest.",
        "coachTip": "Shoulders packed."
      },
      {
        "step": 2,
        "title": "Pure Hinge",
        "description": "Hinge hips straight back with flat back.",
        "coachTip": "Feel hamstrings load."
      },
      {
        "step": 3,
        "title": "Hamstring Snap",
        "description": "Contract glutes and hamstrings to return upright.",
        "coachTip": "Lock hips."
      }
    ]
  },
  {
    "id": "ex-single-leg-rdl",
    "name": "Single-Leg Romanian Deadlift",
    "split_day": "Monday",
    "order_index": 20,
    "target_muscle": "Hamstring & Hip Balance",
    "secondary_muscles": [
      "Glute Medius",
      "Foot Arch",
      "Core"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 15,
    "unlock_criteria": "Warrior Balance Mastery",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 8,
    "default_reps_max": 10,
    "default_rest_seconds": 75,
    "instructions": [
      "Hold single dumbbell in hand opposite working leg.",
      "Hinge forward while extending non-working leg straight behind you in line with torso.",
      "Touch dumbbell toward mid-shin, then drive working hip forward."
    ],
    "form_cues": [
      "Torso and back leg form straight line",
      "Square hips to floor, do not rotate open"
    ],
    "common_mistakes": [
      "Letting non-working hip flare open",
      "Rounding upper spine"
    ],
    "alternatives": [
      "Dumbbell Romanian Deadlift (RDL)",
      "Dumbbell Good Morning"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Single Leg Setup",
        "description": "Stand on one foot, soft knee, dumbbell opposite side.",
        "coachTip": "Lock core."
      },
      {
        "step": 2,
        "title": "Airplane Hinge",
        "description": "Hinge forward as rear leg elevates like a see-saw.",
        "coachTip": "Keep hips square."
      },
      {
        "step": 3,
        "title": "Hip Power",
        "description": "Drive through standing foot to stand tall.",
        "coachTip": "Exhale clean."
      }
    ]
  },
  {
    "id": "ex-flat-db-press",
    "name": "Flat Dumbbell Bench Press",
    "split_day": "Tuesday",
    "order_index": 1,
    "target_muscle": "Pectoralis Major (Mid)",
    "secondary_muscles": [
      "Triceps",
      "Front Delts"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 8,
    "default_sets": 4,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 90,
    "instructions": [
      "Lie back on flat bench, dumbbells held at chest level with neutral wrists.",
      "Drive feet into floor, retract scapulae firmly into the pad.",
      "Press dumbbells up in a slight inward arc without clanking at top.",
      "Lower with 3-second controlled eccentric to nipple line."
    ],
    "form_cues": [
      "Shoulder blades pinched tight",
      "Elbows tucked 45-60 degrees",
      "Wrists stacked above elbows"
    ],
    "common_mistakes": [
      "Elbows flaring 90 degrees out",
      "Shoulders rolling forward off bench at top",
      "Bouncing weights off chest"
    ],
    "alternatives": [
      "Dumbbell Floor Press",
      "Incline Dumbbell Bench Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Bench Lock Setup",
        "description": "Retract and depress shoulder blades into bench.",
        "coachTip": "Firm leg drive."
      },
      {
        "step": 2,
        "title": "Inward Arc Press",
        "description": "Press dumbbells up and slightly inward over sternum.",
        "coachTip": "Squeeze pecs at lockout."
      },
      {
        "step": 3,
        "title": "Controlled Stretch",
        "description": "Lower down slowly until dumbbell handles reach chest level.",
        "coachTip": "Deep inhale."
      }
    ]
  },
  {
    "id": "ex-incline-db-press",
    "name": "Incline Dumbbell Bench Press (30°)",
    "split_day": "Tuesday",
    "order_index": 2,
    "target_muscle": "Upper Pectoralis (Clavicular)",
    "secondary_muscles": [
      "Front Delts",
      "Triceps"
    ],
    "bench_angle": "Incline 30°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Stage II",
    "target_duration_mins": 8,
    "default_sets": 4,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 90,
    "instructions": [
      "Set 20-in-1 bench to 30° incline.",
      "Press dumbbells upward over upper chest with tucked elbows.",
      "Lower until dumbbells touch upper clavicle line."
    ],
    "form_cues": [
      "Bench at 30° not 60°",
      "Keep chest puffed out"
    ],
    "common_mistakes": [
      "Bench too steep (turns into shoulder press)",
      "Arching lower back off bench"
    ],
    "alternatives": [
      "High Incline Dumbbell Bench Press",
      "Flat Dumbbell Bench Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Incline Position",
        "description": "Lie against 30° backrest, feet planted.",
        "coachTip": "Shoulder blades pinned."
      },
      {
        "step": 2,
        "title": "Upper Pec Drive",
        "description": "Press upward over collarbones.",
        "coachTip": "Exhale through teeth."
      },
      {
        "step": 3,
        "title": "Deep Stretch",
        "description": "Lower smoothly with elbows at 45°.",
        "coachTip": "Feel upper chest stretch."
      }
    ]
  },
  {
    "id": "ex-decline-db-press",
    "name": "Decline Dumbbell Bench Press",
    "split_day": "Tuesday",
    "order_index": 3,
    "target_muscle": "Lower Pectoralis",
    "secondary_muscles": [
      "Triceps"
    ],
    "bench_angle": "Decline",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 10,
    "unlock_criteria": "Warrior Bench Mastery",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Set 20-in-1 bench to decline angle with leg anchors.",
      "Press dumbbells vertically over lower sternum.",
      "Lower to lower chest border."
    ],
    "form_cues": [
      "Tuck chin slightly",
      "Drive through lower pecs"
    ],
    "common_mistakes": [
      "Letting dumbbells drift toward face",
      "Rushing the lowering phase"
    ],
    "alternatives": [
      "Dumbbell Floor Press",
      "Flat Dumbbell Bench Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Decline Anchor",
        "description": "Secure legs on decline bench.",
        "coachTip": "Grip handles firm."
      },
      {
        "step": 2,
        "title": "Lower Pec Line",
        "description": "Press over bottom border of chest.",
        "coachTip": "Control path."
      },
      {
        "step": 3,
        "title": "Pec Squeeze",
        "description": "Squeeze lower chest hard.",
        "coachTip": "Smooth cadence."
      }
    ]
  },
  {
    "id": "ex-flat-db-fly",
    "name": "Flat Dumbbell Fly",
    "split_day": "Tuesday",
    "order_index": 4,
    "target_muscle": "Pectoralis Stretch & Adduction",
    "secondary_muscles": [
      "Anterior Deltoids"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 3,
    "unlock_criteria": "Recruit Stage III",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 15,
    "default_rest_seconds": 75,
    "instructions": [
      "Lie flat holding dumbbells over chest with slight elbow bend (15°).",
      "Lower arms wide to sides in hugging arc until deep chest stretch is felt.",
      "Squeeze pecs to bring dumbbells back together over chest."
    ],
    "form_cues": [
      "Lock elbow angle fixed",
      "Imagine hugging a massive tree"
    ],
    "common_mistakes": [
      "Straightening elbows (straining bicep tendon)",
      "Dropping elbows below bench plane"
    ],
    "alternatives": [
      "Incline Dumbbell Fly",
      "Dumbbell Squeeze Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Elbow Arch Lock",
        "description": "Micro-bend elbows and lock the angle.",
        "coachTip": "Wrists neutral."
      },
      {
        "step": 2,
        "title": "Wide Arc",
        "description": "Open arms wide like wings.",
        "coachTip": "Deep inhale."
      },
      {
        "step": 3,
        "title": "Pec Hug",
        "description": "Squeeze dumbbells together using inner pecs.",
        "coachTip": "Exhale at top."
      }
    ]
  },
  {
    "id": "ex-incline-db-fly",
    "name": "Incline Dumbbell Fly (30°)",
    "split_day": "Tuesday",
    "order_index": 5,
    "target_muscle": "Upper Pectoralis Adduction",
    "secondary_muscles": [
      "Anterior Deltoids"
    ],
    "bench_angle": "Incline 30°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Chest Fly",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Set bench to 30°.",
      "Open arms wide maintaining slight elbow bend.",
      "Bring dumbbells together over eye line, squeezing upper chest."
    ],
    "form_cues": [
      "Feel loaded stretch in collarbone region",
      "Smooth cadence"
    ],
    "common_mistakes": [
      "Dropping weights too fast",
      "Collapsing elbows"
    ],
    "alternatives": [
      "Flat Dumbbell Fly",
      "Incline Dumbbell Bench Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Incline Arc",
        "description": "Set bench at 30°, arms extended.",
        "coachTip": "Pack scapula."
      },
      {
        "step": 2,
        "title": "Eccentric Opening",
        "description": "Open wide horizontally.",
        "coachTip": "Inhale controlled."
      },
      {
        "step": 3,
        "title": "Peak Adduction",
        "description": "Squeeze pecs to bring weights together.",
        "coachTip": "Contract upper pecs."
      }
    ]
  },
  {
    "id": "ex-db-floor-press",
    "name": "Dumbbell Floor Press",
    "split_day": "Tuesday",
    "order_index": 6,
    "target_muscle": "Pectoralis & Triceps Lockout",
    "secondary_muscles": [
      "Anterior Deltoid"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Lie on floor with knees bent and feet flat.",
      "Press dumbbells up to arms length.",
      "Lower until triceps lightly touch the floor, pause 1 second to eliminate stretch reflex, then press up."
    ],
    "form_cues": [
      "Dead stop on floor eliminates shoulder impingement",
      "Drive elbows through floor"
    ],
    "common_mistakes": [
      "Bouncing triceps off floor violently",
      "Lifting hips into bridge"
    ],
    "alternatives": [
      "Flat Dumbbell Bench Press",
      "Neutral-Grip Dumbbell Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Floor Anchor",
        "description": "Lie supine on mat, feet flat, dumbbells over chest.",
        "coachTip": "Back flat."
      },
      {
        "step": 2,
        "title": "Dead Stop",
        "description": "Lower until upper arms rest on floor.",
        "coachTip": "Hold 1 second pause."
      },
      {
        "step": 3,
        "title": "Explosive Push",
        "description": "Press up explosively off floor.",
        "coachTip": "Lock pecs."
      }
    ]
  },
  {
    "id": "ex-neutral-grip-db-press",
    "name": "Neutral-Grip Dumbbell Press",
    "split_day": "Tuesday",
    "order_index": 7,
    "target_muscle": "Pectoralis Major & Shoulder Joint Health",
    "secondary_muscles": [
      "Triceps"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Joint Health",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Lie on bench with palms facing each other (neutral grip).",
      "Lower dumbbells alongside ribs with elbows tucked tight to torso.",
      "Press upward, focusing on chest squeeze without shoulder strain."
    ],
    "form_cues": [
      "Palms face each other throughout",
      "Shoulder-friendly pressing path"
    ],
    "common_mistakes": [
      "Flaring elbows outward",
      "Loose grip on handles"
    ],
    "alternatives": [
      "Flat Dumbbell Bench Press",
      "Dumbbell Squeeze Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Parallel Grip",
        "description": "Palms facing inwards toward ribs.",
        "coachTip": "Shoulders retracted."
      },
      {
        "step": 2,
        "title": "Tucked Descent",
        "description": "Lower handles grazing close to ribcage.",
        "coachTip": "Zero shoulder pain."
      },
      {
        "step": 3,
        "title": "Vertical Drive",
        "description": "Press straight up to lockout.",
        "coachTip": "Exhale smoothly."
      }
    ]
  },
  {
    "id": "ex-db-squeeze-press",
    "name": "Dumbbell Squeeze Press (Hex Press)",
    "split_day": "Tuesday",
    "order_index": 8,
    "target_muscle": "Inner Pectoralis Contraction",
    "secondary_muscles": [
      "Triceps",
      "Front Delts"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 6,
    "unlock_criteria": "Initiate Pec Density",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Press two dumbbells together at their flat inner faces directly over your chest.",
      "Keep squeezing them together forcefully as you lower to sternum and press back to top."
    ],
    "form_cues": [
      "Crush dumbbells together with maximum force",
      "Constant inward tension"
    ],
    "common_mistakes": [
      "Allowing dumbbells to separate apart",
      "Rushing through the movement"
    ],
    "alternatives": [
      "Neutral-Grip Dumbbell Press",
      "Flat Dumbbell Fly"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "The Clamp",
        "description": "Press plates together tightly over sternum.",
        "coachTip": "Constant inward pressure."
      },
      {
        "step": 2,
        "title": "Tension Descent",
        "description": "Lower to chest while maintaining crushing force.",
        "coachTip": "Inhale steady."
      },
      {
        "step": 3,
        "title": "Peak Clamp",
        "description": "Press to arms length while crushing handles.",
        "coachTip": "Maximum pec squeeze."
      }
    ]
  },
  {
    "id": "ex-single-arm-floor-press",
    "name": "Single-Arm Dumbbell Floor Press",
    "split_day": "Tuesday",
    "order_index": 9,
    "target_muscle": "Unilateral Chest & Anti-Rotational Core",
    "secondary_muscles": [
      "Core Obliques",
      "Triceps"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 10,
    "unlock_criteria": "Warrior Core Press",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie on floor with dumbbell in one hand, non-working hand resting on belly.",
      "Press dumbbell while bracing core to prevent torso from rolling toward the weight."
    ],
    "form_cues": [
      "Keep both shoulder blades pinned flat",
      "Strict core engagement"
    ],
    "common_mistakes": [
      "Torso tilting toward loaded side",
      "Shifting feet"
    ],
    "alternatives": [
      "Dumbbell Floor Press",
      "Alternating Dumbbell Bench Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Anti-Rotation Setup",
        "description": "Hold single dumbbell on one side.",
        "coachTip": "Pin both hips flat."
      },
      {
        "step": 2,
        "title": "Single Side Press",
        "description": "Press up while fighting rotational force.",
        "coachTip": "Core locked."
      },
      {
        "step": 3,
        "title": "Controlled Floor Touch",
        "description": "Lower elbow to floor lightly.",
        "coachTip": "Repeat on both sides."
      }
    ]
  },
  {
    "id": "ex-db-pullover",
    "name": "Dumbbell Pullover",
    "split_day": "Tuesday",
    "order_index": 10,
    "target_muscle": "Serratus Anterior & Upper Ribcage",
    "secondary_muscles": [
      "Lats",
      "Triceps Long Head"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 7,
    "unlock_criteria": "Initiate Ribcage Expansion",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Lie perpendicular across flat bench with only upper shoulders supported.",
      "Hold single dumbbell with diamond grip overhead.",
      "Lower dumbbell backward behind head in gentle arc until deep ribcage stretch is felt.",
      "Pull back over face using pecs and lats."
    ],
    "form_cues": [
      "Keep hips slightly dropped",
      "Soft elbow bend throughout"
    ],
    "common_mistakes": [
      "Bending elbows excessively (turns into triceps extension)",
      "Overstretching beyond shoulder comfort"
    ],
    "alternatives": [
      "Flat Dumbbell Fly",
      "Incline Dumbbell Fly"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Diamond Grip Setup",
        "description": "Palms cup under top plate of dumbbell over eyes.",
        "coachTip": "Hips level."
      },
      {
        "step": 2,
        "title": "Overhead Arc",
        "description": "Lower dumbbell behind head in controlled arc.",
        "coachTip": "Deep inhale into ribs."
      },
      {
        "step": 3,
        "title": "Pec Pull",
        "description": "Pull dumbbell back to vertical position.",
        "coachTip": "Exhale through teeth."
      }
    ]
  },
  {
    "id": "ex-standard-pushup",
    "name": "Standard Strict Push-Up",
    "split_day": "Tuesday",
    "order_index": 11,
    "target_muscle": "Pectoralis & Kinetic Chain",
    "secondary_muscles": [
      "Triceps",
      "Anterior Delts",
      "Core"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 20,
    "default_rest_seconds": 60,
    "instructions": [
      "Hands slightly wider than shoulders, body in rigid plank from head to heels.",
      "Lower until chest is 1 inch off floor with elbows at 45°.",
      "Push the ground away to return to top."
    ],
    "form_cues": [
      "Body as straight as a steel rod",
      "Full range of motion"
    ],
    "common_mistakes": [
      "Sagging lower back (banana back)",
      "Flaring elbows to 90 degrees",
      "Head bobbing instead of chest reaching floor"
    ],
    "alternatives": [
      "Incline Push-Up",
      "Knee Push-Up"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Plank Alignment",
        "description": "Hands under shoulders, glutes and abs squeezed tight.",
        "coachTip": "Neutral neck."
      },
      {
        "step": 2,
        "title": "Chest to Floor",
        "description": "Lower entire body in unison until chest hovers above floor.",
        "coachTip": "Inhale down."
      },
      {
        "step": 3,
        "title": "Floor Push",
        "description": "Drive palms into ground to full arm lockout.",
        "coachTip": "Exhale sharp."
      }
    ]
  },
  {
    "id": "ex-incline-pushup",
    "name": "Incline Push-Up (Hands on Bench)",
    "split_day": "Tuesday",
    "order_index": 12,
    "target_muscle": "Lower Pectoralis (Beginner/Burnout)",
    "secondary_muscles": [
      "Triceps",
      "Core"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Place hands on flat bench edge, feet back on floor in plank.",
      "Lower chest to touch bench edge, then press back up."
    ],
    "form_cues": [
      "Ideal for volume burnouts and beginners",
      "Keep body rigid"
    ],
    "common_mistakes": [
      "Piking hips upward",
      "Sagging belly"
    ],
    "alternatives": [
      "Standard Strict Push-Up",
      "Knee Push-Up"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Bench Hands Setup",
        "description": "Hands shoulder-width on bench pad.",
        "coachTip": "Plank posture."
      },
      {
        "step": 2,
        "title": "Pad Touch",
        "description": "Lower sternum to graze bench.",
        "coachTip": "Controlled speed."
      },
      {
        "step": 3,
        "title": "Press Away",
        "description": "Lock arms cleanly.",
        "coachTip": "Consistent cadence."
      }
    ]
  },
  {
    "id": "ex-decline-pushup",
    "name": "Decline Push-Up (Feet on Bench)",
    "split_day": "Tuesday",
    "order_index": 13,
    "target_muscle": "Upper Pectoralis & Clavicular Head",
    "secondary_muscles": [
      "Anterior Delts",
      "Triceps"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Bodyweight Upper Pec",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 15,
    "default_rest_seconds": 75,
    "instructions": [
      "Place toes on flat bench with hands on floor below shoulders.",
      "Lower until nose and chest hover above floor, then press up."
    ],
    "form_cues": [
      "Shifts bodyweight directly onto upper pecs",
      "Brace core hard"
    ],
    "common_mistakes": [
      "Arching lower spine",
      "Flaring elbows wide"
    ],
    "alternatives": [
      "Incline Dumbbell Bench Press",
      "Standard Strict Push-Up"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Feet Elevated",
        "description": "Place toes on bench surface, hands on mat.",
        "coachTip": "Tight abs."
      },
      {
        "step": 2,
        "title": "Deep Upper Angle",
        "description": "Lower chest between hands.",
        "coachTip": "Feel upper chest load."
      },
      {
        "step": 3,
        "title": "Drive",
        "description": "Press floor away forcefully.",
        "coachTip": "Exhale at peak."
      }
    ]
  },
  {
    "id": "ex-knee-pushup",
    "name": "Knee Push-Up",
    "split_day": "Tuesday",
    "order_index": 14,
    "target_muscle": "Pectoralis Foundation",
    "secondary_muscles": [
      "Triceps"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Set knees on mat, hands under shoulders, torso straight from knees to head.",
      "Perform controlled push-ups to build pressing strength."
    ],
    "form_cues": [
      "Straight line from knees to crown",
      "Full depth"
    ],
    "common_mistakes": [
      "Piking butt backward",
      "Cutting depth short"
    ],
    "alternatives": [
      "Incline Push-Up",
      "Standard Strict Push-Up"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Knee Base",
        "description": "Knees on mat, torso straight.",
        "coachTip": "Pivoting from knees."
      },
      {
        "step": 2,
        "title": "Full Depth",
        "description": "Lower chest to floor.",
        "coachTip": "Smooth negative."
      },
      {
        "step": 3,
        "title": "Lockout",
        "description": "Press to arm extension.",
        "coachTip": "Good tempo."
      }
    ]
  },
  {
    "id": "ex-wide-grip-pushup",
    "name": "Wide-Grip Push-Up",
    "split_day": "Tuesday",
    "order_index": 15,
    "target_muscle": "Outer Pectoralis Stretch",
    "secondary_muscles": [
      "Anterior Delts"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Recruit",
    "unlock_level": 3,
    "unlock_criteria": "Recruit Pec Stretch",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Place hands 1.5x shoulder width apart.",
      "Lower chest deeply into stretch, then press up."
    ],
    "form_cues": [
      "Focus on outer pec stretch",
      "Maintain elbow control"
    ],
    "common_mistakes": [
      "Over-flaring elbows beyond comfort",
      "Sagging neck"
    ],
    "alternatives": [
      "Standard Strict Push-Up",
      "Flat Dumbbell Fly"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Wide Base",
        "description": "Hands wide on floor.",
        "coachTip": "Fingers slightly angled out."
      },
      {
        "step": 2,
        "title": "Stretch Drop",
        "description": "Lower chest smoothly.",
        "coachTip": "Feel outer pecs stretch."
      },
      {
        "step": 3,
        "title": "Pec Squeeze",
        "description": "Drive up through palm heels.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-close-grip-pushup",
    "name": "Close-Grip Push-Up",
    "split_day": "Tuesday",
    "order_index": 16,
    "target_muscle": "Inner Pectoralis & Triceps",
    "secondary_muscles": [
      "Triceps Medial Head"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Inner Pec",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Place hands shoulder-width or slightly narrower.",
      "Lower with elbows grazing ribs, pressing through palm heels."
    ],
    "form_cues": [
      "Keep elbows pinned tight to ribcage",
      "Inner chest and triceps focus"
    ],
    "common_mistakes": [
      "Elbows flaring out",
      "Spine sagging"
    ],
    "alternatives": [
      "Standard Strict Push-Up",
      "Diamond Push-Up"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Narrow Stance",
        "description": "Hands 8-10 inches apart under sternum.",
        "coachTip": "Tight core."
      },
      {
        "step": 2,
        "title": "Rib Brush",
        "description": "Lower with elbows hugging torso.",
        "coachTip": "Brush ribs."
      },
      {
        "step": 3,
        "title": "Triceps Lock",
        "description": "Drive to straight arm lockout.",
        "coachTip": "Hard contraction."
      }
    ]
  },
  {
    "id": "ex-db-crush-press",
    "name": "Dumbbell Crush Press",
    "split_day": "Tuesday",
    "order_index": 17,
    "target_muscle": "Sternal Head of Pectoralis",
    "secondary_muscles": [
      "Front Delts"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 6,
    "unlock_criteria": "Initiate Clamp Force",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Press dumbbells together with maximum force on flat bench, pulsing through mid-range."
    ],
    "form_cues": [
      "Constant inward crushing force",
      "Intense pec burning"
    ],
    "common_mistakes": [
      "Relaxing inward pressure",
      "Fast uncontrolled reps"
    ],
    "alternatives": [
      "Dumbbell Squeeze Press",
      "Flat Dumbbell Bench Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Crush Setup",
        "description": "Push dumbbell faces together with maximum strength.",
        "coachTip": "Hold crush."
      },
      {
        "step": 2,
        "title": "Mid-Range Travel",
        "description": "Lower 4 inches above chest.",
        "coachTip": "Pecs screaming."
      },
      {
        "step": 3,
        "title": "Crush Lockout",
        "description": "Press to top while squeezing.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-alternating-db-press",
    "name": "Alternating Dumbbell Bench Press",
    "split_day": "Tuesday",
    "order_index": 18,
    "target_muscle": "Pectoralis & Unilateral Stability",
    "secondary_muscles": [
      "Core",
      "Triceps"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 12,
    "unlock_criteria": "Warrior Unilateral Chest",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 8,
    "default_reps_max": 10,
    "default_rest_seconds": 75,
    "instructions": [
      "Hold both dumbbells at top lockout.",
      "Lower and press right dumbbell while left dumbbell stays locked overhead. Alternate sides."
    ],
    "form_cues": [
      "Working arm does full stroke",
      "Non-working arm provides isometric stabilization"
    ],
    "common_mistakes": [
      "Dropping the static arm",
      "Twisting hips on bench"
    ],
    "alternatives": [
      "Flat Dumbbell Bench Press",
      "Single-Arm Dumbbell Floor Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Top Hold",
        "description": "Both dumbbells locked overhead.",
        "coachTip": "Steady core."
      },
      {
        "step": 2,
        "title": "One Arm Lower",
        "description": "Lower one dumbbell smoothly while other stays fixed.",
        "coachTip": "Inhale."
      },
      {
        "step": 3,
        "title": "Press & Switch",
        "description": "Press back to top, then lower opposite side.",
        "coachTip": "Alternate cleanly."
      }
    ]
  },
  {
    "id": "ex-db-around-the-world",
    "name": "Dumbbell Around-the-World",
    "split_day": "Tuesday",
    "order_index": 19,
    "target_muscle": "Total Chest Perimeter & Rotator Mobility",
    "secondary_muscles": [
      "Deltoids",
      "Lats"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Vanguard",
    "unlock_level": 20,
    "unlock_criteria": "Vanguard Shoulder Health",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie flat holding light dumbbells with palms facing ceiling.",
      "Sweep dumbbells in wide circle along the floor plane from thighs to overhead, then reverse."
    ],
    "form_cues": [
      "Use very light weight (1.25kg - 2.5kg plates)",
      "Smooth continuous sweeping arc"
    ],
    "common_mistakes": [
      "Using heavy weight (damages rotator cuff)",
      "Lifting weights off floor plane"
    ],
    "alternatives": [
      "Flat Dumbbell Fly",
      "Dumbbell Pullover"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Floor Plane Setup",
        "description": "Lie flat, light dumbbells at thighs, palms up.",
        "coachTip": "Light weights only."
      },
      {
        "step": 2,
        "title": "Circular Sweep",
        "description": "Trace wide circle around body to overhead.",
        "coachTip": "Feel chest perimeter open."
      },
      {
        "step": 3,
        "title": "Reverse Sweep",
        "description": "Trace circle back to hips smoothly.",
        "coachTip": "Slow rhythm."
      }
    ]
  },
  {
    "id": "ex-tempo-pushup",
    "name": "Tempo Push-Up (4-2-1-0)",
    "split_day": "Tuesday",
    "order_index": 20,
    "target_muscle": "Pectoralis Tension & Hypertrophy",
    "secondary_muscles": [
      "Triceps",
      "Core"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Warrior",
    "unlock_level": 15,
    "unlock_criteria": "Warrior Tempo Mastery",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 6,
    "default_reps_max": 10,
    "default_rest_seconds": 90,
    "instructions": [
      "Lower for 4 seconds, pause 2 seconds 1 inch off floor, explode up in 1 second, zero rest at top."
    ],
    "form_cues": [
      "Strict adherence to 4-second count",
      "No momentum bounce"
    ],
    "common_mistakes": [
      "Rushing the 4-second descent",
      "Resting at top"
    ],
    "alternatives": [
      "Standard Strict Push-Up",
      "Flat Dumbbell Bench Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "The 4-Second Drop",
        "description": "Count: 1... 2... 3... 4... lowering slowly.",
        "coachTip": "Strict cadence."
      },
      {
        "step": 2,
        "title": "The 2-Second Freeze",
        "description": "Hold chest 1 inch off floor without touching.",
        "coachTip": "Breathe through brace."
      },
      {
        "step": 3,
        "title": "Explosive Burst",
        "description": "Power to lockout in 1 second.",
        "coachTip": "Violent exhale."
      }
    ]
  },
  {
    "id": "ex-one-arm-db-row",
    "name": "One-Arm Dumbbell Row",
    "split_day": "Wednesday",
    "order_index": 1,
    "target_muscle": "Latissimus Dorsi",
    "secondary_muscles": [
      "Rhomboids",
      "Biceps",
      "Forearms"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 8,
    "default_sets": 4,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Place one knee and same-side hand on flat bench, spine parallel to floor.",
      "Grip dumbbell in free hand, letting it hang down.",
      "Pull dumbbell backward toward hip pocket, driving elbow skyward.",
      "Lower with 3-second stretch at bottom."
    ],
    "form_cues": [
      "Pull toward hip pocket not armpit",
      "Lead with elbow",
      "Shoulders square to bench"
    ],
    "common_mistakes": [
      "Twisting torso violently at top",
      "Yanking with bicep instead of back"
    ],
    "alternatives": [
      "Bent-Over Dual Dumbbell Row",
      "Incline Chest-Supported Row"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Bench Tripod Setup",
        "description": "Knee, hand on bench. Back flat as a tabletop.",
        "coachTip": "Neutral neck."
      },
      {
        "step": 2,
        "title": "Elbow to Pocket Pull",
        "description": "Drive elbow up and back toward hip bone.",
        "coachTip": "Squeeze lat hard."
      },
      {
        "step": 3,
        "title": "Protraction Stretch",
        "description": "Lower until lat reaches full loaded stretch.",
        "coachTip": "Inhale at bottom."
      }
    ]
  },
  {
    "id": "ex-bent-over-db-row",
    "name": "Bent-Over Dual Dumbbell Row",
    "split_day": "Wednesday",
    "order_index": 2,
    "target_muscle": "Upper Back & Lats",
    "secondary_muscles": [
      "Spinal Erectors",
      "Rear Delts"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Stage II",
    "target_duration_mins": 8,
    "default_sets": 4,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Stand hinged at 45° with flat back, holding dumbbells.",
      "Row both dumbbells toward hips while squeezing shoulder blades together."
    ],
    "form_cues": [
      "Torso remains locked at 45°",
      "Pinch shoulder blades"
    ],
    "common_mistakes": [
      "Standing upright into a shrug",
      "Rounding lumbar spine"
    ],
    "alternatives": [
      "Incline Chest-Supported Row",
      "One-Arm Dumbbell Row"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Hinge Lock",
        "description": "Hinge hips back, soft knees, back flat.",
        "coachTip": "Brace abs."
      },
      {
        "step": 2,
        "title": "Dual Pull",
        "description": "Row both elbows back along ribs.",
        "coachTip": "Squeeze scapulae."
      },
      {
        "step": 3,
        "title": "Controlled Lower",
        "description": "Lower to full arm hang.",
        "coachTip": "Maintain flat back."
      }
    ]
  },
  {
    "id": "ex-incline-chest-supported-row",
    "name": "Incline Chest-Supported Row (45°)",
    "split_day": "Wednesday",
    "order_index": 3,
    "target_muscle": "Mid Back & Rhomboids (Zero Lumbar Fatigue)",
    "secondary_muscles": [
      "Lats",
      "Biceps"
    ],
    "bench_angle": "Incline 45°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 7,
    "default_sets": 4,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Lie chest-down against 45° incline bench.",
      "Let dumbbells hang with neutral grip.",
      "Row up pulling elbows high past bench backrest, squeezing rhomboids tightly."
    ],
    "form_cues": [
      "Chest glued to pad",
      "Zero lower back fatigue",
      "Peak contraction squeeze"
    ],
    "common_mistakes": [
      "Lifting chest off pad (using spinal extension)",
      "Cutting range of motion"
    ],
    "alternatives": [
      "Bent-Over Dual Dumbbell Row",
      "Chest-Supported Rear Delt Row"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Pad Anchor",
        "description": "Rest chest firmly on 45° bench.",
        "coachTip": "Feet dug into floor."
      },
      {
        "step": 2,
        "title": "Rhomboid Pinch",
        "description": "Drive elbows back and pinch shoulder blades.",
        "coachTip": "Hold 1s at top."
      },
      {
        "step": 3,
        "title": "Dead Hang Stretch",
        "description": "Lower to full extension.",
        "coachTip": "Inhale deep."
      }
    ]
  },
  {
    "id": "ex-reverse-grip-db-row",
    "name": "Reverse-Grip Dumbbell Row",
    "split_day": "Wednesday",
    "order_index": 4,
    "target_muscle": "Lower Latissimus Dorsi",
    "secondary_muscles": [
      "Biceps",
      "Forearms"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Lower Lat",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Hinge at 45° with palms facing forward (underhand supinated grip).",
      "Row dumbbells dragging close to thighs toward belly button."
    ],
    "form_cues": [
      "Supinated grip heavily recruits lower lat fibers",
      "Keep elbows close to sides"
    ],
    "common_mistakes": [
      "Over-flexing wrists",
      "Jerking the torso upward"
    ],
    "alternatives": [
      "Bent-Over Dual Dumbbell Row",
      "One-Arm Dumbbell Row"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Underhand Grip",
        "description": "Palms facing forward, hinged at hips.",
        "coachTip": "Shoulders pinned back."
      },
      {
        "step": 2,
        "title": "Lower Lat Pull",
        "description": "Pull elbows along waistline toward navel.",
        "coachTip": "Exhale."
      },
      {
        "step": 3,
        "title": "Smooth Hang",
        "description": "Lower with control.",
        "coachTip": "Maintain grip."
      }
    ]
  },
  {
    "id": "ex-neutral-grip-db-row",
    "name": "Neutral-Grip Dumbbell Row",
    "split_day": "Wednesday",
    "order_index": 5,
    "target_muscle": "Lats & Brachialis",
    "secondary_muscles": [
      "Rhomboids"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Pull",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Hinge at 45° with palms facing inward toward each other.",
      "Row directly upward, elbows skimming ribs."
    ],
    "form_cues": [
      "Natural wrist orientation",
      "Elbows skim ribcage"
    ],
    "common_mistakes": [
      "Flaring elbows out",
      "Rounding shoulders"
    ],
    "alternatives": [
      "Bent-Over Dual Dumbbell Row",
      "Incline Chest-Supported Row"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Neutral Stance",
        "description": "Palms facing each other, hinged posture.",
        "coachTip": "Knees soft."
      },
      {
        "step": 2,
        "title": "Rib Skim",
        "description": "Row up brushing outer ribs.",
        "coachTip": "Tight squeeze."
      },
      {
        "step": 3,
        "title": "Lower",
        "description": "Return to starting extension.",
        "coachTip": "Steady breath."
      }
    ]
  },
  {
    "id": "ex-gorilla-row",
    "name": "Gorilla Row",
    "split_day": "Wednesday",
    "order_index": 6,
    "target_muscle": "Upper Back & Anti-Rotational Hip Stability",
    "secondary_muscles": [
      "Lats",
      "Hamstrings"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 6,
    "unlock_criteria": "Initiate Gorilla Power",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Place two dumbbells on floor between feet in deep hinge.",
      "Rest one hand on one dumbbell while rowing the opposite dumbbell forcefully to hip. Alternate."
    ],
    "form_cues": [
      "Wide hinge base",
      "Keep one dumbbell planted while rowing the other"
    ],
    "common_mistakes": [
      "Rising out of hinge",
      "Rounding spine"
    ],
    "alternatives": [
      "Renegade Row",
      "One-Arm Dumbbell Row"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Gorilla Stance",
        "description": "Wide feet, deep hinge, dumbbells on floor.",
        "coachTip": "Flat spine."
      },
      {
        "step": 2,
        "title": "Piston Pull",
        "description": "Row right dumbbell while left presses down into floor.",
        "coachTip": "Drive elbow up."
      },
      {
        "step": 3,
        "title": "Floor Switch",
        "description": "Return to floor and immediately row left dumbbell.",
        "coachTip": "Keep rhythm."
      }
    ]
  },
  {
    "id": "ex-renegade-row",
    "name": "Renegade Row",
    "split_day": "Wednesday",
    "order_index": 7,
    "target_muscle": "Lats & Core Anti-Rotation",
    "secondary_muscles": [
      "Triceps",
      "Obliques"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 12,
    "unlock_criteria": "Warrior Core Pull",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 8,
    "default_reps_max": 10,
    "default_rest_seconds": 90,
    "instructions": [
      "In push-up plank with hands on dumbbell handles and feet set wide for balance.",
      "Row one dumbbell to hip without letting hips rotate or twist. Alternate sides."
    ],
    "form_cues": [
      "Keep hips completely square to floor",
      "Feet wide (shoulder width) for stability"
    ],
    "common_mistakes": [
      "Hips twisting or swaying to the side",
      "Sagging hips in plank"
    ],
    "alternatives": [
      "Gorilla Row",
      "Single-Arm Dumbbell Floor Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Plank Grip",
        "description": "Set strong plank gripping dumbbell handles on floor.",
        "coachTip": "Feet wide."
      },
      {
        "step": 2,
        "title": "Lock & Row",
        "description": "Brace abs and row one dumbbell to hip pocket.",
        "coachTip": "Zero hip tilt."
      },
      {
        "step": 3,
        "title": "Alternate",
        "description": "Set down softly and row opposite arm.",
        "coachTip": "Control is king."
      }
    ]
  },
  {
    "id": "ex-db-lat-pullover",
    "name": "Dumbbell Lat Pullover (Across Bench)",
    "split_day": "Wednesday",
    "order_index": 8,
    "target_muscle": "Latissimus Dorsi Stretch & Terres Major",
    "secondary_muscles": [
      "Serratus",
      "Triceps Long Head"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 7,
    "unlock_criteria": "Initiate Lat Arc",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Lie across flat bench with hips low.",
      "Hold dumbbell overhead and lower behind head focusing on lat elongation.",
      "Pull forward stopping directly over forehead to keep constant tension on lats."
    ],
    "form_cues": [
      "Stop over eyes/forehead (stops tension release)",
      "Hips dropped lower than shoulders"
    ],
    "common_mistakes": [
      "Bringing dumbbell all the way over stomach (takes tension off lats)",
      "Bending elbows too much"
    ],
    "alternatives": [
      "Dumbbell Pullover",
      "Incline Chest-Supported Row"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Lat Pullover Setup",
        "description": "Hips dropped below bench height.",
        "coachTip": "Long lever."
      },
      {
        "step": 2,
        "title": "Lat Stretch",
        "description": "Lower behind crown of head.",
        "coachTip": "Feel armpit stretch."
      },
      {
        "step": 3,
        "title": "Lat Pull",
        "description": "Pull up to forehead plane only.",
        "coachTip": "Keep lats engaged."
      }
    ]
  },
  {
    "id": "ex-standing-db-shrug",
    "name": "Standing Dumbbell Shrug",
    "split_day": "Wednesday",
    "order_index": 9,
    "target_muscle": "Upper Trapezius",
    "secondary_muscles": [
      "Forearms",
      "Grip"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 6,
    "default_sets": 4,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Stand tall holding heavy dumbbells at sides.",
      "Elevate shoulders straight up toward ears.",
      "Hold peak squeeze for 2 seconds, then lower under control."
    ],
    "form_cues": [
      "Pure vertical elevator path",
      "Hold 2 seconds at top contraction"
    ],
    "common_mistakes": [
      "Rolling shoulders backward (rotator damage)",
      "Bending elbows to assist"
    ],
    "alternatives": [
      "Incline Dumbbell Shrug",
      "Farmer's Carry"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Tall Posture",
        "description": "Arms straight, chest tall, heavy dumbbells.",
        "coachTip": "No forward head poke."
      },
      {
        "step": 2,
        "title": "Vertical Elevation",
        "description": "Shrug straight up to touch ears.",
        "coachTip": "Hold 2s."
      },
      {
        "step": 3,
        "title": "Controlled Drop",
        "description": "Lower to full stretch.",
        "coachTip": "Inhale at bottom."
      }
    ]
  },
  {
    "id": "ex-incline-db-shrug",
    "name": "Incline Dumbbell Shrug (60°)",
    "split_day": "Wednesday",
    "order_index": 10,
    "target_muscle": "Mid & Upper Trapezius",
    "secondary_muscles": [
      "Rhomboids"
    ],
    "bench_angle": "Incline 60°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Mid Trap",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie chest-down on 60° bench.",
      "Shrug dumbbells up and back at an angle, squeezing mid traps."
    ],
    "form_cues": [
      "Target mid trap fibers",
      "Smooth controlled squeeze"
    ],
    "common_mistakes": [
      "Using momentum",
      "Jerking shoulders"
    ],
    "alternatives": [
      "Standing Dumbbell Shrug",
      "Incline Chest-Supported Row"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Incline Pad Setup",
        "description": "Chest against 60° bench.",
        "coachTip": "Arms hanging."
      },
      {
        "step": 2,
        "title": "Angular Shrug",
        "description": "Shrug up and back along the incline.",
        "coachTip": "Mid traps engage."
      },
      {
        "step": 3,
        "title": "Squeeze & Return",
        "description": "Squeeze 1s and return.",
        "coachTip": "Breathe steady."
      }
    ]
  },
  {
    "id": "ex-chest-supported-rear-delt-row",
    "name": "Chest-Supported Rear Delt Row",
    "split_day": "Wednesday",
    "order_index": 11,
    "target_muscle": "Rear Deltoid & Upper Rhomboids",
    "secondary_muscles": [
      "Traps"
    ],
    "bench_angle": "Incline 45°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Posterior Width",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie chest-down on 45° bench with wide elbows at 90°.",
      "Row dumbbells outward with elbows flaring wide in the scapular plane."
    ],
    "form_cues": [
      "Elbows flared wide (perpendicular to torso)",
      "Focus on rear shoulders"
    ],
    "common_mistakes": [
      "Tucking elbows to sides (turns into lat row)",
      "Lifting chest off bench"
    ],
    "alternatives": [
      "Incline Reverse Fly",
      "Prone T Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Wide Flare Setup",
        "description": "Chest on pad, palms facing backward.",
        "coachTip": "Elbows wide."
      },
      {
        "step": 2,
        "title": "High Wide Pull",
        "description": "Drive elbows high and wide to ceiling.",
        "coachTip": "Feel back of shoulders."
      },
      {
        "step": 3,
        "title": "Controlled Descent",
        "description": "Lower to arm hang.",
        "coachTip": "Keep flare."
      }
    ]
  },
  {
    "id": "ex-prone-db-row",
    "name": "Prone Dumbbell Row on Flat Bench",
    "split_day": "Wednesday",
    "order_index": 12,
    "target_muscle": "Mid Back & Latissimus",
    "secondary_muscles": [
      "Biceps"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 6,
    "unlock_criteria": "Initiate Prone Pull",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Lie face down on flat bench (elevate bench on plates if needed).",
      "Row both dumbbells from floor without using body momentum."
    ],
    "form_cues": [
      "Zero body English",
      "Pure muscular pull"
    ],
    "common_mistakes": [
      "Lifting head violently",
      "Incomplete range of motion"
    ],
    "alternatives": [
      "Incline Chest-Supported Row",
      "Bent-Over Dual Dumbbell Row"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Flat Prone Setup",
        "description": "Lie face down flat.",
        "coachTip": "Dumbbells under shoulders."
      },
      {
        "step": 2,
        "title": "Dead Pull",
        "description": "Row dumbbells up toward bench frame.",
        "coachTip": "Pure back muscle."
      },
      {
        "step": 3,
        "title": "Lower",
        "description": "Lower smoothly.",
        "coachTip": "No swing."
      }
    ]
  },
  {
    "id": "ex-db-reverse-fly",
    "name": "Dumbbell Reverse Fly (Bent-Over)",
    "split_day": "Wednesday",
    "order_index": 13,
    "target_muscle": "Rear Deltoids & Mid Trapezius",
    "secondary_muscles": [
      "Rhomboids"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 3,
    "unlock_criteria": "Recruit Stage III",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Hinge at 45° with light dumbbells.",
      "Raise arms out to sides in wide hugging arc with slight elbow bend.",
      "Squeeze rear delts and mid back at top."
    ],
    "form_cues": [
      "Lead with pinkies slightly",
      "Light weight only"
    ],
    "common_mistakes": [
      "Using heavy weight and swinging hips",
      "Bending elbows into a row"
    ],
    "alternatives": [
      "Incline Reverse Fly",
      "Prone T Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Hinge Arc",
        "description": "Hinged at 45°, arms hanging, micro-bend in elbows.",
        "coachTip": "Light plates."
      },
      {
        "step": 2,
        "title": "Fly Sweep",
        "description": "Sweep arms out wide to parallel.",
        "coachTip": "Rear delts fire."
      },
      {
        "step": 3,
        "title": "Controlled Down",
        "description": "Lower smoothly without bouncing.",
        "coachTip": "Exhale up."
      }
    ]
  },
  {
    "id": "ex-incline-reverse-fly",
    "name": "Incline Reverse Fly (30°)",
    "split_day": "Wednesday",
    "order_index": 14,
    "target_muscle": "Rear Deltoid Isolation",
    "secondary_muscles": [
      "Rhomboids"
    ],
    "bench_angle": "Incline 30°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Incline Fly",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie chest-down on 30° incline bench.",
      "Raise dumbbells out to sides, feeling pure posterior deltoid recruitment without lower back stress."
    ],
    "form_cues": [
      "Chest locked against pad",
      "Constant rear delt tension"
    ],
    "common_mistakes": [
      "Swinging arms",
      "Arching neck"
    ],
    "alternatives": [
      "Dumbbell Reverse Fly",
      "Prone Y Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Incline Chest Lock",
        "description": "Chest on 30° bench pad.",
        "coachTip": "Arms dangling."
      },
      {
        "step": 2,
        "title": "Posterior Arc",
        "description": "Raise dumbbells to horizontal level.",
        "coachTip": "Squeeze rear delts."
      },
      {
        "step": 3,
        "title": "Slow Lower",
        "description": "Lower with 3-second negative.",
        "coachTip": "Inhale."
      }
    ]
  },
  {
    "id": "ex-prone-y-raise",
    "name": "Prone Bench Y-Raise",
    "split_day": "Wednesday",
    "order_index": 15,
    "target_muscle": "Lower Trapezius & Postural Health",
    "secondary_muscles": [
      "Rear Delts",
      "Rotator Cuff"
    ],
    "bench_angle": "Incline 30°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Scapular Armor",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie chest-down on 30° bench.",
      "Raise light dumbbells or thumbs up at 45° angle forming a 'Y' shape with torso."
    ],
    "form_cues": [
      "Thumbs pointed to ceiling",
      "Forms letter Y"
    ],
    "common_mistakes": [
      "Using heavy weights",
      "Shrugging neck to ears"
    ],
    "alternatives": [
      "Prone T Raise",
      "Prone W Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Y-Shape Setup",
        "description": "Lie on 30° bench, thumbs up.",
        "coachTip": "Very light weight."
      },
      {
        "step": 2,
        "title": "Lower Trap Lift",
        "description": "Raise arms at 45° angle.",
        "coachTip": "Feel lower traps squeeze."
      },
      {
        "step": 3,
        "title": "Hold & Lower",
        "description": "Pause 1s at top, lower slowly.",
        "coachTip": "Scapular stability."
      }
    ]
  },
  {
    "id": "ex-prone-t-raise",
    "name": "Prone Bench T-Raise",
    "split_day": "Wednesday",
    "order_index": 16,
    "target_muscle": "Rhomboids & Scapular Retractors",
    "secondary_muscles": [
      "Mid Traps",
      "Rear Delts"
    ],
    "bench_angle": "Incline 30°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Scapular Armor",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie chest-down on 30° bench.",
      "Raise arms perpendicular to torso forming a 'T' shape with thumbs up."
    ],
    "form_cues": [
      "Forms letter T",
      "Squeeze shoulder blades together"
    ],
    "common_mistakes": [
      "Over-shrugging",
      "Swinging weights"
    ],
    "alternatives": [
      "Prone Y Raise",
      "Prone W Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "T-Shape Setup",
        "description": "Chest on 30° bench, arms wide.",
        "coachTip": "Thumbs to ceiling."
      },
      {
        "step": 2,
        "title": "Retract Scapulae",
        "description": "Lift arms straight out to sides.",
        "coachTip": "Pinch rhomboids."
      },
      {
        "step": 3,
        "title": "Return",
        "description": "Lower under control.",
        "coachTip": "Smooth breathing."
      }
    ]
  },
  {
    "id": "ex-prone-w-raise",
    "name": "Prone Bench W-Raise",
    "split_day": "Wednesday",
    "order_index": 17,
    "target_muscle": "External Rotators & Infraspinatus",
    "secondary_muscles": [
      "Mid Traps"
    ],
    "bench_angle": "Incline 30°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Scapular Armor",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie chest-down on 30° bench.",
      "Bend elbows and externally rotate forearms up to form a 'W' shape."
    ],
    "form_cues": [
      "Forms letter W",
      "Rotator cuff strengthening"
    ],
    "common_mistakes": [
      "Internally rotating shoulders",
      "Fast reps"
    ],
    "alternatives": [
      "Prone Y Raise",
      "Prone T Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "W-Shape Setup",
        "description": "Elbows bent at 90°, thumbs up.",
        "coachTip": "Infraspinatus focus."
      },
      {
        "step": 2,
        "title": "External Rotation",
        "description": "Rotate forearms upward into W.",
        "coachTip": "Peak rotator squeeze."
      },
      {
        "step": 3,
        "title": "Return",
        "description": "Lower smoothly.",
        "coachTip": "Keep elbows bent."
      }
    ]
  },
  {
    "id": "ex-db-deadlift",
    "name": "Dumbbell Suitcase Deadlift",
    "split_day": "Wednesday",
    "order_index": 18,
    "target_muscle": "Full Posterior Chain & Grip",
    "secondary_muscles": [
      "Quads",
      "Glutes",
      "Erectors",
      "Traps"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Heavy Carry",
    "target_duration_mins": 8,
    "default_sets": 3,
    "default_reps_min": 8,
    "default_reps_max": 10,
    "default_rest_seconds": 90,
    "instructions": [
      "Hold heavy dumbbells at sides.",
      "Hinge and squat down until dumbbells touch near mid-shin, then drive through floor to full upright stance."
    ],
    "form_cues": [
      "Back locked flat",
      "Chest proud throughout"
    ],
    "common_mistakes": [
      "Rounding lower back off floor",
      "Hyperextending spine at top"
    ],
    "alternatives": [
      "Dumbbell Romanian Deadlift (RDL)",
      "Farmer's Carry"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Suitcase Setup",
        "description": "Stand tall, heavy dumbbells at sides.",
        "coachTip": "Core braced."
      },
      {
        "step": 2,
        "title": "Descent",
        "description": "Squat-hinge down until weights graze mid-shin.",
        "coachTip": "Knees track toes."
      },
      {
        "step": 3,
        "title": "Lockout",
        "description": "Drive through feet to stand tall.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-farmers-carry",
    "name": "Dumbbell Farmer's Carry",
    "split_day": "Wednesday",
    "order_index": 19,
    "target_muscle": "Grip Strength, Traps & Core Stability",
    "secondary_muscles": [
      "Forearms",
      "Core Obliques"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Heavy Carry",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 45,
    "default_reps_max": 60,
    "default_rest_seconds": 90,
    "instructions": [
      "Pick up heavy dumbbells and walk with upright military posture for 45-60 seconds."
    ],
    "form_cues": [
      "Shoulders pinned back and down",
      "Do not let weights sway"
    ],
    "common_mistakes": [
      "Hunching forward",
      "Taking hurried, unsteady steps"
    ],
    "alternatives": [
      "Standing Dumbbell Shrug",
      "Dumbbell Suitcase Deadlift"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Grip Lock",
        "description": "White-knuckle grip on heavy dumbbells.",
        "coachTip": "Pack shoulders."
      },
      {
        "step": 2,
        "title": "Slow March",
        "description": "Walk smoothly with upright posture.",
        "coachTip": "Total body tension."
      },
      {
        "step": 3,
        "title": "Safe Unload",
        "description": "Squat down to set weights on floor.",
        "coachTip": "Never drop weights."
      }
    ]
  },
  {
    "id": "ex-single-arm-bench-high-row",
    "name": "Single-Arm Bench-Supported High Row",
    "split_day": "Wednesday",
    "order_index": 20,
    "target_muscle": "Upper Lat & Rear Deltoid Tie-in",
    "secondary_muscles": [
      "Rhomboids"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 10,
    "unlock_criteria": "Warrior Precision Back",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Supported on bench, row dumbbell up with elbow angled at 60° to hit upper lat flare."
    ],
    "form_cues": [
      "Upper lat sweep",
      "Elbow drives out and back"
    ],
    "common_mistakes": [
      "Torso rotation",
      "Shrugging into neck"
    ],
    "alternatives": [
      "One-Arm Dumbbell Row",
      "Incline Chest-Supported Row"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "High Row Base",
        "description": "One arm on bench, wide elbow angle.",
        "coachTip": "Spine neutral."
      },
      {
        "step": 2,
        "title": "60° Drive",
        "description": "Row elbow high toward shoulder line.",
        "coachTip": "Upper lat contraction."
      },
      {
        "step": 3,
        "title": "Stretch",
        "description": "Lower to full extension.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-seated-db-shoulder-press",
    "name": "Seated Dumbbell Shoulder Press (75°)",
    "split_day": "Thursday",
    "order_index": 1,
    "target_muscle": "Anterior & Lateral Deltoids",
    "secondary_muscles": [
      "Triceps",
      "Upper Chest"
    ],
    "bench_angle": "Incline 75°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 8,
    "default_sets": 4,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 90,
    "instructions": [
      "Set 20-in-1 bench to 75° (prevents lumbar arching and rotator impingement).",
      "Press dumbbells up and inward directly over ears.",
      "Lower until dumbbells touch ear level with elbows in scapular plane (30° forward)."
    ],
    "form_cues": [
      "Elbows in scapular plane (not flared flat)",
      "Drive feet into floor"
    ],
    "common_mistakes": [
      "Bench set to 90° (causes lower back over-arch)",
      "Elbows flaring 90° out",
      "Banging dumbbells at top"
    ],
    "alternatives": [
      "Standing Dumbbell Shoulder Press",
      "Arnold Dumbbell Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "75° Incline Base",
        "description": "Set bench at 75° angle, feet planted firmly.",
        "coachTip": "Scapula retracted."
      },
      {
        "step": 2,
        "title": "Scapular Plane Press",
        "description": "Press up and inward over crown of head.",
        "coachTip": "Exhale through teeth."
      },
      {
        "step": 3,
        "title": "Ear Level Descent",
        "description": "Lower under control to top of ears.",
        "coachTip": "Inhale deeply."
      }
    ]
  },
  {
    "id": "ex-standing-db-shoulder-press",
    "name": "Standing Overhead Dumbbell Press",
    "split_day": "Thursday",
    "order_index": 2,
    "target_muscle": "Anterior Deltoids & Core Stabilization",
    "secondary_muscles": [
      "Triceps",
      "Core"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Standing Power",
    "target_duration_mins": 8,
    "default_sets": 4,
    "default_reps_min": 8,
    "default_reps_max": 10,
    "default_rest_seconds": 90,
    "instructions": [
      "Stand with feet shoulder-width, glutes and abs squeezed tight.",
      "Press dumbbells overhead to full lockout without leaning backward."
    ],
    "form_cues": [
      "Squeeze glutes to protect spine",
      "Lock core rigid as granite"
    ],
    "common_mistakes": [
      "Leaning back excessively",
      "Bending knees to push-press"
    ],
    "alternatives": [
      "Seated Dumbbell Shoulder Press",
      "Neutral-Grip Shoulder Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Standing Pillar",
        "description": "Feet under hips, glutes clamped tight.",
        "coachTip": "Abs braced."
      },
      {
        "step": 2,
        "title": "Vertical Drive",
        "description": "Press straight overhead to arm lockout.",
        "coachTip": "Lock elbows softly."
      },
      {
        "step": 3,
        "title": "Control",
        "description": "Lower to collarbone line.",
        "coachTip": "Smooth cadence."
      }
    ]
  },
  {
    "id": "ex-arnold-press",
    "name": "Arnold Dumbbell Press",
    "split_day": "Thursday",
    "order_index": 3,
    "target_muscle": "All Three Deltoid Heads",
    "secondary_muscles": [
      "Triceps",
      "Rotator Cuff"
    ],
    "bench_angle": "Seated 90°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 7,
    "unlock_criteria": "Initiate Deltoid Rotation",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Start seated holding dumbbells at chest with palms facing you (supinated).",
      "As you press upward, rotate wrists 180° outward until palms face forward at top lockout.",
      "Reverse the rotation smoothly on the way down."
    ],
    "form_cues": [
      "Smooth continuous rotational corkscrew",
      "Open elbows wide during rotation"
    ],
    "common_mistakes": [
      "Jerking the weights through the rotation",
      "Starting rotation too early"
    ],
    "alternatives": [
      "Seated Dumbbell Shoulder Press",
      "Neutral-Grip Shoulder Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Supinated Start",
        "description": "Dumbbells in front of chin, palms facing chest.",
        "coachTip": "Compact setup."
      },
      {
        "step": 2,
        "title": "Rotational Drive",
        "description": "Press up while rotating wrists outward.",
        "coachTip": "Continuous spiral."
      },
      {
        "step": 3,
        "title": "Pronated Lockout",
        "description": "Lockout overhead with palms facing forward.",
        "coachTip": "Reverse smoothly down."
      }
    ]
  },
  {
    "id": "ex-neutral-grip-shoulder-press",
    "name": "Neutral-Grip Shoulder Press",
    "split_day": "Thursday",
    "order_index": 4,
    "target_muscle": "Anterior Deltoids & Shoulder Health",
    "secondary_muscles": [
      "Triceps"
    ],
    "bench_angle": "Incline 75°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Joint Health",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Hold dumbbells with palms facing each other throughout.",
      "Press straight up, elbows pointing forward."
    ],
    "form_cues": [
      "Shoulder joint friendly",
      "Zero impingement risk"
    ],
    "common_mistakes": [
      "Letting elbows flare out",
      "Rushing tempo"
    ],
    "alternatives": [
      "Seated Dumbbell Shoulder Press",
      "Standing Overhead Dumbbell Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Parallel Grip",
        "description": "Palms facing inwards at shoulders.",
        "coachTip": "Tuck elbows."
      },
      {
        "step": 2,
        "title": "Clean Line Press",
        "description": "Press up along sagittal plane.",
        "coachTip": "Zero shoulder pinch."
      },
      {
        "step": 3,
        "title": "Descent",
        "description": "Lower handles to chin height.",
        "coachTip": "Inhale."
      }
    ]
  },
  {
    "id": "ex-alternating-shoulder-press",
    "name": "Alternating Shoulder Press",
    "split_day": "Thursday",
    "order_index": 5,
    "target_muscle": "Deltoids & Isometric Core",
    "secondary_muscles": [
      "Triceps",
      "Core"
    ],
    "bench_angle": "Incline 75°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 6,
    "unlock_criteria": "Initiate Unilateral Press",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 8,
    "default_reps_max": 10,
    "default_rest_seconds": 75,
    "instructions": [
      "Press right arm while left arm holds at shoulder level. Alternate sides with strict control."
    ],
    "form_cues": [
      "Hold non-working dumbbell steady",
      "Even cadence"
    ],
    "common_mistakes": [
      "Dropping the resting dumbbell",
      "Tilting torso"
    ],
    "alternatives": [
      "Seated Dumbbell Shoulder Press",
      "Single-Arm Shoulder Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Dual Ready",
        "description": "Both dumbbells at shoulder height.",
        "coachTip": "Torso tall."
      },
      {
        "step": 2,
        "title": "One Arm Press",
        "description": "Press right arm while left arm stays loaded.",
        "coachTip": "Exhale up."
      },
      {
        "step": 3,
        "title": "Switch",
        "description": "Lower right and press left.",
        "coachTip": "Seamless rhythm."
      }
    ]
  },
  {
    "id": "ex-single-arm-shoulder-press",
    "name": "Single-Arm Shoulder Press",
    "split_day": "Thursday",
    "order_index": 6,
    "target_muscle": "Unilateral Shoulder & Oblique Balance",
    "secondary_muscles": [
      "Core Obliques"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 10,
    "unlock_criteria": "Warrior Core Press",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 8,
    "default_reps_max": 10,
    "default_rest_seconds": 75,
    "instructions": [
      "Stand holding single dumbbell at shoulder, other hand on hip.",
      "Press dumbbell directly overhead while keeping spine vertical."
    ],
    "form_cues": [
      "Total core anti-lateral flexion",
      "Vertical spine"
    ],
    "common_mistakes": [
      "Leaning sideways toward weight",
      "Knee dip"
    ],
    "alternatives": [
      "Standing Overhead Dumbbell Press",
      "Alternating Shoulder Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Unilateral Stance",
        "description": "One dumbbell at shoulder, free hand on hip.",
        "coachTip": "Brace obliques."
      },
      {
        "step": 2,
        "title": "Straight Line",
        "description": "Press straight up beside ear.",
        "coachTip": "Fight side tilt."
      },
      {
        "step": 3,
        "title": "Lower",
        "description": "Return to shoulder height.",
        "coachTip": "Repeat on both sides."
      }
    ]
  },
  {
    "id": "ex-standing-lateral-raise",
    "name": "Standing Dumbbell Lateral Raise",
    "split_day": "Thursday",
    "order_index": 7,
    "target_muscle": "Lateral Deltoid (Shoulder Width)",
    "secondary_muscles": [
      "Upper Traps",
      "Forearms"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 6,
    "default_sets": 4,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Stand with slight forward torso lean (10°), dumbbells at sides.",
      "Raise arms out to sides in wide arc, keeping pinkies slightly higher than thumbs (pouring water).",
      "Stop at shoulder height, lower with 3-second negative."
    ],
    "form_cues": [
      "Lead with elbows",
      "Slight forward torso pitch",
      "Pinkies tilted slightly upward"
    ],
    "common_mistakes": [
      "Swinging body or using hip thrust",
      "Lifting weights higher than shoulders (traps take over)",
      "Shrugging shoulders into neck"
    ],
    "alternatives": [
      "Seated Lateral Raise",
      "Leaning Lateral Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Athletic Lean Setup",
        "description": "Slight 10° forward lean, dumbbells in front of thighs.",
        "coachTip": "Elbows soft."
      },
      {
        "step": 2,
        "title": "Lateral Plane Sweep",
        "description": "Pour dumbbells out and up to shoulder level.",
        "coachTip": "Elbows lead the way."
      },
      {
        "step": 3,
        "title": "Tension Negative",
        "description": "Lower slowly over 3 seconds.",
        "coachTip": "Never drop weights."
      }
    ]
  },
  {
    "id": "ex-seated-lateral-raise",
    "name": "Seated Dumbbell Lateral Raise",
    "split_day": "Thursday",
    "order_index": 8,
    "target_muscle": "Lateral Deltoid Pure Isolation",
    "secondary_muscles": [
      "Forearms"
    ],
    "bench_angle": "Seated 90°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Stage II",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Sit tall on edge of bench, dumbbells hanging at sides.",
      "Raise dumbbells out to sides without any leg momentum."
    ],
    "form_cues": [
      "Completely eliminates leg drive",
      "Pure side delt tension"
    ],
    "common_mistakes": [
      "Rocking back and forth on bench",
      "Lifting arms too high"
    ],
    "alternatives": [
      "Standing Dumbbell Lateral Raise",
      "Leaning Lateral Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Seated Base",
        "description": "Perched on bench edge, dumbbells at sides.",
        "coachTip": "Feet glued to floor."
      },
      {
        "step": 2,
        "title": "Pure Arc",
        "description": "Sweep out to sides to parallel.",
        "coachTip": "No body rock."
      },
      {
        "step": 3,
        "title": "Controlled Down",
        "description": "Lower with slow tempo.",
        "coachTip": "Exhale up."
      }
    ]
  },
  {
    "id": "ex-leaning-lateral-raise",
    "name": "Leaning Single-Arm Lateral Raise",
    "split_day": "Thursday",
    "order_index": 9,
    "target_muscle": "Lateral Deltoid Stretch & Constant Tension",
    "secondary_muscles": [
      "Forearms"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Constant Tension",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Hold onto bench or post with one hand and lean body away at a 20° angle.",
      "Perform lateral raise with outside arm."
    ],
    "form_cues": [
      "Extended range of motion at bottom",
      "Constant tension throughout whole stroke"
    ],
    "common_mistakes": [
      "Swinging torso back upright",
      "Bending elbow too much"
    ],
    "alternatives": [
      "Standing Dumbbell Lateral Raise",
      "Seated Lateral Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Leaning Anchor",
        "description": "Hold sturdy post/bench, lean out 20°.",
        "coachTip": "Dumbbell hangs perpendicular."
      },
      {
        "step": 2,
        "title": "Long Arc",
        "description": "Raise dumbbell to horizontal line.",
        "coachTip": "Maximum tension."
      },
      {
        "step": 3,
        "title": "Deep Stretch",
        "description": "Lower past hip into full stretch.",
        "coachTip": "Hold 1s."
      }
    ]
  },
  {
    "id": "ex-bent-arm-lateral-raise",
    "name": "Bent-Arm Dumbbell Lateral Raise",
    "split_day": "Thursday",
    "order_index": 10,
    "target_muscle": "Lateral Deltoid (Heavier Overload)",
    "secondary_muscles": [
      "Upper Traps"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 6,
    "unlock_criteria": "Initiate Deltoid Overload",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Bend elbows to 90° and lock them.",
      "Raise upper arms out to sides until elbows are parallel to floor."
    ],
    "form_cues": [
      "Shortened lever arm allows slightly heavier loading",
      "Keep 90° elbow bend locked"
    ],
    "common_mistakes": [
      "Straightening arms mid-rep",
      "Shrugging traps"
    ],
    "alternatives": [
      "Standing Dumbbell Lateral Raise",
      "Partial Lateral Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "90° Elbow Lock",
        "description": "Lock elbows at 90° angle at ribs.",
        "coachTip": "Forearms forward."
      },
      {
        "step": 2,
        "title": "Elbow Lift",
        "description": "Raise elbows directly out to sides.",
        "coachTip": "Feel side delt cap."
      },
      {
        "step": 3,
        "title": "Return",
        "description": "Lower elbows back to rib line.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-partial-lateral-raise",
    "name": "Partial Range Heavy Lateral Raise",
    "split_day": "Thursday",
    "order_index": 11,
    "target_muscle": "Lateral Deltoid Bottom Overload",
    "secondary_muscles": [
      "Forearms"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 12,
    "unlock_criteria": "Warrior Deltoid Overload",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 15,
    "default_reps_max": 20,
    "default_rest_seconds": 60,
    "instructions": [
      "Use heavier dumbbells.",
      "Perform pulses through the bottom 60% of the lateral raise range."
    ],
    "form_cues": [
      "Overloads side delts where they are strongest",
      "Constant tension pulses"
    ],
    "common_mistakes": [
      "Swinging violently",
      "Lifting weights toward chin"
    ],
    "alternatives": [
      "Standing Dumbbell Lateral Raise",
      "Bent-Arm Lateral Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Heavy Load",
        "description": "Hold moderately heavier dumbbells at sides.",
        "coachTip": "Brace abs."
      },
      {
        "step": 2,
        "title": "Bottom Pulse",
        "description": "Raise to 45° angle only.",
        "coachTip": "Rapid controlled burn."
      },
      {
        "step": 3,
        "title": "Pulse Cadence",
        "description": "Pump 15-20 partial reps.",
        "coachTip": "High fatigue."
      }
    ]
  },
  {
    "id": "ex-front-db-raise",
    "name": "Front Dumbbell Raise",
    "split_day": "Thursday",
    "order_index": 12,
    "target_muscle": "Anterior Deltoids",
    "secondary_muscles": [
      "Upper Chest"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Hold dumbbells against front of thighs.",
      "Raise dumbbells straight forward to eye level with neutral or pronated grip."
    ],
    "form_cues": [
      "Stop at eye level",
      "Torso completely stationary"
    ],
    "common_mistakes": [
      "Leaning back as weights rise",
      "Swinging weights"
    ],
    "alternatives": [
      "Alternating Front Raise",
      "Seated Front Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Front Stance",
        "description": "Dumbbells resting in front of thighs.",
        "coachTip": "Shoulders packed."
      },
      {
        "step": 2,
        "title": "Forward Rise",
        "description": "Raise to eye level in straight line.",
        "coachTip": "Front delts fire."
      },
      {
        "step": 3,
        "title": "Controlled Down",
        "description": "Lower with 3-second negative.",
        "coachTip": "Inhale."
      }
    ]
  },
  {
    "id": "ex-alternating-front-raise",
    "name": "Alternating Front Raise",
    "split_day": "Thursday",
    "order_index": 13,
    "target_muscle": "Anterior Deltoid Unilateral",
    "secondary_muscles": [
      "Upper Chest"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Stage II",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Raise one dumbbell to eye level, lower under control, then raise opposite dumbbell."
    ],
    "form_cues": [
      "Smooth alternate cadence",
      "Controlled descent"
    ],
    "common_mistakes": [
      "Rushing the reps",
      "Rocking hips"
    ],
    "alternatives": [
      "Front Dumbbell Raise",
      "Incline Front Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Alternate Base",
        "description": "Stand tall, dumbbells ready.",
        "coachTip": "Quiet body."
      },
      {
        "step": 2,
        "title": "Single Raise",
        "description": "Raise right dumbbell to eye height.",
        "coachTip": "Exhale."
      },
      {
        "step": 3,
        "title": "Switch",
        "description": "Lower and raise left dumbbell.",
        "coachTip": "Continuous tempo."
      }
    ]
  },
  {
    "id": "ex-seated-front-raise",
    "name": "Seated Front Raise",
    "split_day": "Thursday",
    "order_index": 14,
    "target_muscle": "Anterior Deltoid Strict Isolation",
    "secondary_muscles": [
      "Upper Chest"
    ],
    "bench_angle": "Seated 90°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 3,
    "unlock_criteria": "Recruit Strict Shoulders",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Sit tall on 90° bench, raise dumbbells straight ahead to eye level."
    ],
    "form_cues": [
      "Zero body momentum",
      "Strict anterior deltoid loading"
    ],
    "common_mistakes": [
      "Arching off backrest",
      "Lifting overhead"
    ],
    "alternatives": [
      "Front Dumbbell Raise",
      "Incline Front Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Seated Setup",
        "description": "Sit firm against 90° bench pad.",
        "coachTip": "Head neutral."
      },
      {
        "step": 2,
        "title": "Strict Raise",
        "description": "Lift straight forward to eye line.",
        "coachTip": "Pure shoulder power."
      },
      {
        "step": 3,
        "title": "Lower",
        "description": "Lower with control.",
        "coachTip": "Inhale."
      }
    ]
  },
  {
    "id": "ex-db-scaption-raise",
    "name": "Dumbbell Scaption Raise (30° Angle)",
    "split_day": "Thursday",
    "order_index": 15,
    "target_muscle": "Serratus Anterior & Supraspinatus Health",
    "secondary_muscles": [
      "Lateral Deltoid"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Rotator Armor",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Raise dumbbells with thumbs up at a 30° forward angle (in the true scapular plane)."
    ],
    "form_cues": [
      "Natural scapular plane",
      "Thumbs pointing up"
    ],
    "common_mistakes": [
      "Flaring directly out to sides",
      "Over-shrugging"
    ],
    "alternatives": [
      "Standing Dumbbell Lateral Raise",
      "Front Dumbbell Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Scapular Alignment",
        "description": "Arms at 30° angle forward from torso, thumbs up.",
        "coachTip": "Optimal joint biomechanics."
      },
      {
        "step": 2,
        "title": "Smooth Rise",
        "description": "Raise to shoulder height.",
        "coachTip": "Rotator cuff protective."
      },
      {
        "step": 3,
        "title": "Descent",
        "description": "Lower gently.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-incline-front-raise",
    "name": "Incline Front Raise (45°)",
    "split_day": "Thursday",
    "order_index": 16,
    "target_muscle": "Anterior Deltoid Peak Stretch",
    "secondary_muscles": [
      "Upper Pecs"
    ],
    "bench_angle": "Incline 45°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 6,
    "unlock_criteria": "Initiate Shoulder Angle",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie back on 45° incline bench, raise dumbbells forward and up."
    ],
    "form_cues": [
      "Extended range of motion",
      "Loaded stretch at bottom"
    ],
    "common_mistakes": [
      "Swinging arms",
      "Bending elbows"
    ],
    "alternatives": [
      "Front Dumbbell Raise",
      "Seated Front Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Incline Base",
        "description": "Lie against 45° bench, arms hanging.",
        "coachTip": "Feet flat."
      },
      {
        "step": 2,
        "title": "High Arc",
        "description": "Raise forward past eye line.",
        "coachTip": "Feel anterior delt stretch."
      },
      {
        "step": 3,
        "title": "Return",
        "description": "Lower smoothly.",
        "coachTip": "Inhale down."
      }
    ]
  },
  {
    "id": "ex-db-upright-row",
    "name": "Controlled Wide-Grip Dumbbell Upright Row",
    "split_day": "Thursday",
    "order_index": 17,
    "target_muscle": "Lateral Deltoids & Upper Traps",
    "secondary_muscles": [
      "Biceps"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 7,
    "unlock_criteria": "Initiate Wide Upright Row",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Hold dumbbells in front of thighs with wide spacing.",
      "Pull elbows high and wide, stopping when elbows reach chest level (never above shoulders)."
    ],
    "form_cues": [
      "Wide dumbbell spacing protects subacromial space",
      "Never pull higher than lower chest"
    ],
    "common_mistakes": [
      "Pulling with hands touching (damages rotator cuff)",
      "Jerking weights with lower back"
    ],
    "alternatives": [
      "Standing Dumbbell Lateral Raise",
      "Bent-Arm Lateral Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Wide Grip Setup",
        "description": "Dumbbells 12 inches apart in front of thighs.",
        "coachTip": "Hands wide."
      },
      {
        "step": 2,
        "title": "Wide High Pull",
        "description": "Pull elbows wide and up to chest line.",
        "coachTip": "Stop at mid-chest."
      },
      {
        "step": 3,
        "title": "Smooth Descent",
        "description": "Lower to thighs.",
        "coachTip": "Zero shoulder pain."
      }
    ]
  },
  {
    "id": "ex-pike-pushup",
    "name": "Pike Push-Up (Bodyweight Vertical Press)",
    "split_day": "Thursday",
    "order_index": 18,
    "target_muscle": "Anterior Deltoids & Triceps Lockout",
    "secondary_muscles": [
      "Upper Traps",
      "Core"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Bodyweight Press",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Get into downward dog position with hips high in air.",
      "Lower head diagonally forward between hands, then press back up and through."
    ],
    "form_cues": [
      "Hips stay high in the air",
      "Head moves forward of hands in tripod"
    ],
    "common_mistakes": [
      "Flaring elbows wide",
      "Turning into a normal flat push-up"
    ],
    "alternatives": [
      "Seated Dumbbell Shoulder Press",
      "Standing Overhead Dumbbell Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "V-Shape Pike",
        "description": "Hands and feet on floor, hips high in air like inverted V.",
        "coachTip": "Look at feet."
      },
      {
        "step": 2,
        "title": "Diagonal Dip",
        "description": "Lower crown of head diagonally between hands.",
        "coachTip": "Elbows tucked 45°."
      },
      {
        "step": 3,
        "title": "Press Through",
        "description": "Push ground away, driving head back between shoulders.",
        "coachTip": "Full lockout."
      }
    ]
  },
  {
    "id": "ex-lateral-raise-hold",
    "name": "Isometric Lateral Raise Hold",
    "split_day": "Thursday",
    "order_index": 19,
    "target_muscle": "Lateral Deltoid Time Under Tension",
    "secondary_muscles": [
      "Traps"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 10,
    "unlock_criteria": "Warrior Isometric Burn",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 20,
    "default_reps_max": 30,
    "default_rest_seconds": 60,
    "instructions": [
      "Raise light dumbbells to shoulder level and hold statically for 20-30 seconds."
    ],
    "form_cues": [
      "Maintain strict horizontal arm angle",
      "Breathe steadily"
    ],
    "common_mistakes": [
      "Dropping arms below parallel",
      "Leaning torso backward"
    ],
    "alternatives": [
      "Standing Dumbbell Lateral Raise",
      "Partial Lateral Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Horizontal Freeze",
        "description": "Raise light dumbbells to parallel and freeze.",
        "coachTip": "Shoulders down."
      },
      {
        "step": 2,
        "title": "Breathe Through Burn",
        "description": "Hold for 20 to 30 continuous seconds.",
        "coachTip": "Delts on fire."
      },
      {
        "step": 3,
        "title": "Controlled Release",
        "description": "Lower slowly to sides.",
        "coachTip": "Never drop."
      }
    ]
  },
  {
    "id": "ex-lateral-drop-set",
    "name": "Controlled Lateral Raise Mechanical Drop Set",
    "split_day": "Thursday",
    "order_index": 20,
    "target_muscle": "Total Lateral Deltoid Exhaustion",
    "secondary_muscles": [
      "Traps",
      "Forearms"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 15,
    "unlock_criteria": "Warrior Mechanical Drop Set",
    "target_duration_mins": 8,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 15,
    "default_rest_seconds": 90,
    "instructions": [
      "Perform 8 reps strict standing lateral raises, then immediately switch to bent-arm raises for 8 more reps with same weight."
    ],
    "form_cues": [
      "Seamless transition from long lever to short lever",
      "Maximum metabolic burn"
    ],
    "common_mistakes": [
      "Resting between movements",
      "Swinging with hips"
    ],
    "alternatives": [
      "Standing Dumbbell Lateral Raise",
      "Bent-Arm Lateral Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Strict Phase",
        "description": "8 strict straight-arm lateral raises.",
        "coachTip": "Full range."
      },
      {
        "step": 2,
        "title": "Lever Transition",
        "description": "Immediately bend elbows to 90°.",
        "coachTip": "Zero rest."
      },
      {
        "step": 3,
        "title": "Mechanical Burnout",
        "description": "8 bent-arm raises to complete failure.",
        "coachTip": "Maximum growth stimulus."
      }
    ]
  },
  {
    "id": "ex-incline-rear-delt-fly",
    "name": "Incline Rear Delt Fly (30°)",
    "split_day": "Friday",
    "order_index": 1,
    "target_muscle": "Posterior Deltoid",
    "secondary_muscles": [
      "Rhomboids",
      "Mid Traps"
    ],
    "bench_angle": "Incline 30°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 6,
    "default_sets": 4,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie chest-down on 30° bench, arms dangling with light dumbbells.",
      "Sweep arms out to sides leading with pinkies until parallel with floor.",
      "Lower over 3 seconds to full stretch."
    ],
    "form_cues": [
      "Lead with pinkies",
      "Chest stays glued to pad",
      "Feel back of shoulders"
    ],
    "common_mistakes": [
      "Using heavy weight and rowing with lats",
      "Shrugging into neck"
    ],
    "alternatives": [
      "Chest-Supported Rear Delt Fly",
      "Bent-Over Rear Delt Fly"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Chest Pad Anchor",
        "description": "Lie chest down on 30° bench, palms facing each other.",
        "coachTip": "Relax neck."
      },
      {
        "step": 2,
        "title": "Posterior Arc",
        "description": "Sweep dumbbells wide to sides like wings.",
        "coachTip": "Feel rear delt cap."
      },
      {
        "step": 3,
        "title": "Slow Stretch",
        "description": "Lower with controlled 3-second negative.",
        "coachTip": "Deep inhale."
      }
    ]
  },
  {
    "id": "ex-chest-supported-rear-delt-fly",
    "name": "Chest-Supported Rear Delt Fly (45°)",
    "split_day": "Friday",
    "order_index": 2,
    "target_muscle": "Posterior Deltoid",
    "secondary_muscles": [
      "Rhomboids"
    ],
    "bench_angle": "Incline 45°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Stage II",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie chest down on 45° bench.",
      "Raise arms wide to horizontal plane, focusing on rear delt contraction."
    ],
    "form_cues": [
      "Target rear delt fibers from 45° angle",
      "Clean squeeze"
    ],
    "common_mistakes": [
      "Squeezing traps instead of rear delts",
      "Jerking dumbbells"
    ],
    "alternatives": [
      "Incline Rear Delt Fly",
      "Seated Rear Delt Fly"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "45° Setup",
        "description": "Chest against 45° bench.",
        "coachTip": "Arms hanging."
      },
      {
        "step": 2,
        "title": "Wide Sweep",
        "description": "Open arms wide.",
        "coachTip": "Rear delts fire."
      },
      {
        "step": 3,
        "title": "Return",
        "description": "Lower under control.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-bent-over-rear-delt-fly",
    "name": "Bent-Over Rear Delt Fly",
    "split_day": "Friday",
    "order_index": 3,
    "target_muscle": "Posterior Deltoids & Upper Rhomboids",
    "secondary_muscles": [
      "Mid Traps"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 3,
    "unlock_criteria": "Recruit Stage III",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Hinge at hips to 45°, arms hanging.",
      "Raise arms wide to sides in wide arc, squeezing back of shoulders."
    ],
    "form_cues": [
      "Torso stays still",
      "Wide arc sweep"
    ],
    "common_mistakes": [
      "Bouncing torso",
      "Bending elbows into row"
    ],
    "alternatives": [
      "Incline Rear Delt Fly",
      "Seated Rear Delt Fly"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Hinge Stance",
        "description": "Hinged at 45°, flat spine.",
        "coachTip": "Light weights."
      },
      {
        "step": 2,
        "title": "Horizontal Fly",
        "description": "Raise arms out wide.",
        "coachTip": "Focus on rear delts."
      },
      {
        "step": 3,
        "title": "Lower",
        "description": "Lower smoothly.",
        "coachTip": "Inhale."
      }
    ]
  },
  {
    "id": "ex-seated-rear-delt-fly",
    "name": "Seated Rear Delt Fly (Torso on Thighs)",
    "split_day": "Friday",
    "order_index": 4,
    "target_muscle": "Posterior Deltoid Strict Isolation",
    "secondary_muscles": [
      "Rhomboids"
    ],
    "bench_angle": "Seated 90°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Strict Isolation",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Sit on bench edge, lean torso forward resting chest against thighs.",
      "Dumbbells hang behind heels.",
      "Raise dumbbells wide to sides without moving torso."
    ],
    "form_cues": [
      "Chest locked against thighs eliminates cheating",
      "Pinkies lead"
    ],
    "common_mistakes": [
      "Lifting chest off thighs",
      "Using momentum"
    ],
    "alternatives": [
      "Incline Rear Delt Fly",
      "Bent-Over Rear Delt Fly"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Thigh Rest Setup",
        "description": "Sit on bench edge, fold torso over thighs.",
        "coachTip": "Weights behind heels."
      },
      {
        "step": 2,
        "title": "Pure Fly",
        "description": "Fly arms wide to sides.",
        "coachTip": "Zero body English."
      },
      {
        "step": 3,
        "title": "Return",
        "description": "Lower softly.",
        "coachTip": "Exhale up."
      }
    ]
  },
  {
    "id": "ex-single-arm-rear-delt-fly",
    "name": "Single-Arm Incline Rear Delt Fly",
    "split_day": "Friday",
    "order_index": 5,
    "target_muscle": "Unilateral Posterior Deltoid",
    "secondary_muscles": [
      "Rhomboids"
    ],
    "bench_angle": "Incline 30°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Unilateral Delt",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie sideways or chest-down on 30° bench, performing fly with one arm at a time."
    ],
    "form_cues": [
      "Intense mind-muscle connection",
      "Eliminates side imbalances"
    ],
    "common_mistakes": [
      "Torso twisting",
      "Dropping arm fast"
    ],
    "alternatives": [
      "Incline Rear Delt Fly",
      "Prone Rear Delt Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "One Arm Setup",
        "description": "Chest on bench, working arm hanging.",
        "coachTip": "Free hand anchored."
      },
      {
        "step": 2,
        "title": "Focused Sweep",
        "description": "Sweep out to side smoothly.",
        "coachTip": "Feel rear head contract."
      },
      {
        "step": 3,
        "title": "Descent",
        "description": "Slow negative.",
        "coachTip": "Repeat on both sides."
      }
    ]
  },
  {
    "id": "ex-prone-rear-delt-raise",
    "name": "Prone Rear Delt Raise on Flat Bench",
    "split_day": "Friday",
    "order_index": 6,
    "target_muscle": "Posterior Deltoid",
    "secondary_muscles": [
      "Mid Traps"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 6,
    "unlock_criteria": "Initiate Prone Delt",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie face down on flat bench, raise light dumbbells out to sides."
    ],
    "form_cues": [
      "Zero lumbar involvement",
      "Direct rear delt loading"
    ],
    "common_mistakes": [
      "Swinging arms",
      "Arching neck"
    ],
    "alternatives": [
      "Incline Rear Delt Fly",
      "Prone T Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Flat Prone Setup",
        "description": "Lie face down on flat bench.",
        "coachTip": "Palms facing down."
      },
      {
        "step": 2,
        "title": "Fly Lift",
        "description": "Raise arms out to sides to bench height.",
        "coachTip": "Squeeze rear delts."
      },
      {
        "step": 3,
        "title": "Lower",
        "description": "Lower smoothly.",
        "coachTip": "Inhale."
      }
    ]
  },
  {
    "id": "ex-rear-delt-row",
    "name": "Wide-Flared Rear Delt Row",
    "split_day": "Friday",
    "order_index": 7,
    "target_muscle": "Posterior Deltoids (Overload)",
    "secondary_muscles": [
      "Upper Lats",
      "Rhomboids"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Rear Delt Power",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Hinge at 45°, row dumbbells with elbows flared wide at 90° from torso."
    ],
    "form_cues": [
      "Elbows stay flared 90°",
      "Allows heavier loading on posterior shoulder"
    ],
    "common_mistakes": [
      "Tucking elbows to ribs",
      "Rounding back"
    ],
    "alternatives": [
      "Incline High Row",
      "Incline Rear Delt Fly"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Flared Hinge",
        "description": "Hinged at 45°, knuckles facing forward.",
        "coachTip": "Wide grip."
      },
      {
        "step": 2,
        "title": "Elbow Flare Pull",
        "description": "Drive elbows high and wide.",
        "coachTip": "Feel rear delt knot."
      },
      {
        "step": 3,
        "title": "Lower",
        "description": "Lower to full hang.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-incline-high-row",
    "name": "Incline High Row (Chest Supported 45°)",
    "split_day": "Friday",
    "order_index": 8,
    "target_muscle": "Posterior Deltoid & Upper Back",
    "secondary_muscles": [
      "Rhomboids"
    ],
    "bench_angle": "Incline 45°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 6,
    "unlock_criteria": "Initiate High Row",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie chest-down on 45° bench, row elbows high toward ceiling."
    ],
    "form_cues": [
      "Zero lower back fatigue",
      "High elbow path"
    ],
    "common_mistakes": [
      "Lifting torso off pad",
      "Short reps"
    ],
    "alternatives": [
      "Wide-Flared Rear Delt Row",
      "Incline Rear Delt Fly"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Chest Anchor",
        "description": "Chest glued to 45° bench.",
        "coachTip": "Arms hanging."
      },
      {
        "step": 2,
        "title": "High Elbow Row",
        "description": "Drive elbows high toward ears.",
        "coachTip": "Upper back and rear delts."
      },
      {
        "step": 3,
        "title": "Return",
        "description": "Lower to starting hang.",
        "coachTip": "Inhale."
      }
    ]
  },
  {
    "id": "ex-prone-y-raise-fri",
    "name": "Prone Bench Y-Raise (Scapular Health)",
    "split_day": "Friday",
    "order_index": 9,
    "target_muscle": "Lower Trapezius & Rear Shoulder",
    "secondary_muscles": [
      "Rotator Cuff"
    ],
    "bench_angle": "Incline 30°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Scapular Armor",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie chest down on 30° bench, raise thumbs up at 45° forming Y."
    ],
    "form_cues": [
      "Thumbs to ceiling",
      "Lower trap activation"
    ],
    "common_mistakes": [
      "Heavy weights",
      "Shrugging neck"
    ],
    "alternatives": [
      "Prone T Raise",
      "Prone W Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Y-Angle",
        "description": "Arms at 45° angle forward.",
        "coachTip": "Light weights."
      },
      {
        "step": 2,
        "title": "Lift",
        "description": "Raise to shoulder height.",
        "coachTip": "Pinch lower traps."
      },
      {
        "step": 3,
        "title": "Lower",
        "description": "Lower under control.",
        "coachTip": "Breathe steady."
      }
    ]
  },
  {
    "id": "ex-prone-t-raise-fri",
    "name": "Prone Bench T-Raise (Rhomboid & Rear Delt)",
    "split_day": "Friday",
    "order_index": 10,
    "target_muscle": "Rear Deltoid & Rhomboids",
    "secondary_muscles": [
      "Mid Traps"
    ],
    "bench_angle": "Incline 30°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Scapular Armor",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie chest down on 30° bench, raise arms straight out forming T."
    ],
    "form_cues": [
      "Straight out to sides",
      "Squeeze shoulder blades"
    ],
    "common_mistakes": [
      "Bent elbows",
      "Swinging"
    ],
    "alternatives": [
      "Prone Y Raise",
      "Prone W Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "T-Angle",
        "description": "Arms straight out from shoulders.",
        "coachTip": "Thumbs up."
      },
      {
        "step": 2,
        "title": "Lift",
        "description": "Raise parallel to floor.",
        "coachTip": "Rear shoulder focus."
      },
      {
        "step": 3,
        "title": "Lower",
        "description": "Lower smoothly.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-prone-w-raise-fri",
    "name": "Prone Bench W-Raise (Rotator Cuff Armor)",
    "split_day": "Friday",
    "order_index": 11,
    "target_muscle": "Infraspinatus & External Rotators",
    "secondary_muscles": [
      "Rear Delts"
    ],
    "bench_angle": "Incline 30°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Scapular Armor",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie chest down on 30° bench, elbows bent at 90°, externally rotate up to W."
    ],
    "form_cues": [
      "Rotate forearms up",
      "External rotation focus"
    ],
    "common_mistakes": [
      "Internal rotation",
      "Jerking"
    ],
    "alternatives": [
      "Prone Y Raise",
      "Prone T Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "W-Angle",
        "description": "Elbows at 90°.",
        "coachTip": "Light weight."
      },
      {
        "step": 2,
        "title": "Rotate",
        "description": "Rotate forearms up toward ceiling.",
        "coachTip": "Rotator cuff burns."
      },
      {
        "step": 3,
        "title": "Lower",
        "description": "Lower under control.",
        "coachTip": "Inhale."
      }
    ]
  },
  {
    "id": "ex-standing-lateral-fri",
    "name": "Standing Lateral Raise (Strict Cadence)",
    "split_day": "Friday",
    "order_index": 12,
    "target_muscle": "Lateral Deltoid",
    "secondary_muscles": [
      "Forearms"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Stand tall, raise dumbbells out to sides with 3-second lowering."
    ],
    "form_cues": [
      "Lead with elbows",
      "Slight forward torso pitch"
    ],
    "common_mistakes": [
      "Swinging hips",
      "Shrugging neck"
    ],
    "alternatives": [
      "Seated Lateral Raise",
      "Leaning Lateral Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Setup",
        "description": "Athletic stance, dumbbells at sides.",
        "coachTip": "Tight abs."
      },
      {
        "step": 2,
        "title": "Raise",
        "description": "Raise to shoulder height.",
        "coachTip": "Elbows high."
      },
      {
        "step": 3,
        "title": "Slow Negative",
        "description": "Lower over 3 seconds.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-seated-lateral-fri",
    "name": "Seated Lateral Raise (Isolation)",
    "split_day": "Friday",
    "order_index": 13,
    "target_muscle": "Lateral Deltoid",
    "secondary_muscles": [
      "Forearms"
    ],
    "bench_angle": "Seated 90°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Stage II",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Sit on bench edge, raise dumbbells without leg drive."
    ],
    "form_cues": [
      "Zero leg momentum",
      "Pure side delt tension"
    ],
    "common_mistakes": [
      "Rocking body",
      "Lifting weights too high"
    ],
    "alternatives": [
      "Standing Lateral Raise",
      "Leaning Lateral Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Seated Setup",
        "description": "Perched on bench edge.",
        "coachTip": "Feet flat."
      },
      {
        "step": 2,
        "title": "Pure Arc",
        "description": "Sweep out to sides.",
        "coachTip": "Side delt cap."
      },
      {
        "step": 3,
        "title": "Down",
        "description": "Lower smoothly.",
        "coachTip": "Inhale."
      }
    ]
  },
  {
    "id": "ex-leaning-lateral-fri",
    "name": "Leaning Single-Arm Lateral Raise (Peak Stretch)",
    "split_day": "Friday",
    "order_index": 14,
    "target_muscle": "Lateral Deltoid",
    "secondary_muscles": [
      "Forearms"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Deltoid Stretch",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lean 20° from post/bench, perform lateral raise with outside arm."
    ],
    "form_cues": [
      "Extended range of motion",
      "Loaded stretch at bottom"
    ],
    "common_mistakes": [
      "Swinging torso",
      "Bent elbow"
    ],
    "alternatives": [
      "Standing Lateral Raise",
      "Seated Lateral Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Lean Setup",
        "description": "Hold bench, lean out 20°.",
        "coachTip": "Arm hanging."
      },
      {
        "step": 2,
        "title": "Sweep",
        "description": "Raise to parallel.",
        "coachTip": "Constant tension."
      },
      {
        "step": 3,
        "title": "Return",
        "description": "Lower past hip into stretch.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-single-arm-lateral-raise",
    "name": "Single-Arm Standing Lateral Raise",
    "split_day": "Friday",
    "order_index": 15,
    "target_muscle": "Lateral Deltoid Unilateral",
    "secondary_muscles": [
      "Core"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Stage II",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Perform lateral raise with one arm at a time, other hand bracing hip."
    ],
    "form_cues": [
      "Focus on single delt contraction",
      "Anti-lateral core bracing"
    ],
    "common_mistakes": [
      "Tilting torso to side",
      "Using momentum"
    ],
    "alternatives": [
      "Standing Lateral Raise",
      "Leaning Lateral Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Single Base",
        "description": "Stand tall, one dumbbell in hand.",
        "coachTip": "Free hand on hip."
      },
      {
        "step": 2,
        "title": "Unilateral Arc",
        "description": "Raise to shoulder level.",
        "coachTip": "Pure side delt."
      },
      {
        "step": 3,
        "title": "Descent",
        "description": "Lower slowly.",
        "coachTip": "Repeat on both sides."
      }
    ]
  },
  {
    "id": "ex-lateral-raise-hold-fri",
    "name": "Lateral Raise Isometric Burnout",
    "split_day": "Friday",
    "order_index": 16,
    "target_muscle": "Lateral Deltoid Time Under Tension",
    "secondary_muscles": [
      "Traps"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 10,
    "unlock_criteria": "Warrior Isometric Burn",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 20,
    "default_reps_max": 30,
    "default_rest_seconds": 60,
    "instructions": [
      "Hold dumbbells at shoulder height for 20-30 seconds statically."
    ],
    "form_cues": [
      "Hold parallel line",
      "Breathe through teeth"
    ],
    "common_mistakes": [
      "Dropping arms",
      "Leaning back"
    ],
    "alternatives": [
      "Standing Lateral Raise",
      "Partial Lateral Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Hold Setup",
        "description": "Raise dumbbells to horizontal plane.",
        "coachTip": "Lock elbows softly."
      },
      {
        "step": 2,
        "title": "Isometric Freeze",
        "description": "Hold for full 25 seconds.",
        "coachTip": "Shoulders burning."
      },
      {
        "step": 3,
        "title": "Safe Release",
        "description": "Lower under control.",
        "coachTip": "Never drop."
      }
    ]
  },
  {
    "id": "ex-partial-lateral-fri",
    "name": "Partial Lateral Heavy Pulses",
    "split_day": "Friday",
    "order_index": 17,
    "target_muscle": "Lateral Deltoid Overload",
    "secondary_muscles": [
      "Forearms"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 12,
    "unlock_criteria": "Warrior Deltoid Overload",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 15,
    "default_reps_max": 20,
    "default_rest_seconds": 60,
    "instructions": [
      "Pulse through bottom 50% of lateral raise with heavier dumbbells."
    ],
    "form_cues": [
      "Heavy bottom overload",
      "Constant pulse cadence"
    ],
    "common_mistakes": [
      "Swinging with hips",
      "Lifting to chin"
    ],
    "alternatives": [
      "Standing Lateral Raise",
      "Bent-Arm Lateral Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Heavy Grip",
        "description": "Hold heavier dumbbells at sides.",
        "coachTip": "Tight abs."
      },
      {
        "step": 2,
        "title": "Bottom Pulse",
        "description": "Pulse up to 45° only.",
        "coachTip": "Fast rhythm."
      },
      {
        "step": 3,
        "title": "Complete Set",
        "description": "15 to 20 partial reps.",
        "coachTip": "Intense fatigue."
      }
    ]
  },
  {
    "id": "ex-db-scaption-fri",
    "name": "Dumbbell Scaption (Scapular Plane)",
    "split_day": "Friday",
    "order_index": 18,
    "target_muscle": "Supraspinatus & Lateral Deltoid",
    "secondary_muscles": [
      "Serratus"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Rotator Armor",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Raise dumbbells at 30° forward angle with thumbs pointing up."
    ],
    "form_cues": [
      "Optimal scapular biomechanics",
      "Joint protective"
    ],
    "common_mistakes": [
      "Flaring 90° out",
      "Internal rotation"
    ],
    "alternatives": [
      "Standing Lateral Raise",
      "Front Dumbbell Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Scaption Base",
        "description": "Dumbbells at 30° forward angle.",
        "coachTip": "Thumbs up."
      },
      {
        "step": 2,
        "title": "Sweep Up",
        "description": "Raise to shoulder level.",
        "coachTip": "Zero impingement."
      },
      {
        "step": 3,
        "title": "Down",
        "description": "Lower smoothly.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-rear-delt-iso-hold",
    "name": "Rear Delt Isometric Bench Hold",
    "split_day": "Friday",
    "order_index": 19,
    "target_muscle": "Posterior Deltoid Isometric Density",
    "secondary_muscles": [
      "Rhomboids"
    ],
    "bench_angle": "Incline 30°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 10,
    "unlock_criteria": "Warrior Isometric Burn",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 20,
    "default_reps_max": 30,
    "default_rest_seconds": 60,
    "instructions": [
      "Hold light dumbbells at top of incline rear delt fly for 20-30 seconds."
    ],
    "form_cues": [
      "Pinch rear delts tight",
      "Breathe steadily"
    ],
    "common_mistakes": [
      "Dropping arms",
      "Lifting chest off pad"
    ],
    "alternatives": [
      "Incline Rear Delt Fly",
      "Prone Rear Delt Raise"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Top Fly Hold",
        "description": "Hold dumbbells wide at horizontal line.",
        "coachTip": "Chest on bench."
      },
      {
        "step": 2,
        "title": "Static Hold",
        "description": "Hold for 20 to 30 seconds.",
        "coachTip": "Posterior caps screaming."
      },
      {
        "step": 3,
        "title": "Release",
        "description": "Lower to floor.",
        "coachTip": "Breathe."
      }
    ]
  },
  {
    "id": "ex-three-way-shoulder-complex",
    "name": "Controlled Three-Way Shoulder Complex",
    "split_day": "Friday",
    "order_index": 20,
    "target_muscle": "Total 3D Deltoid Exhaustion",
    "secondary_muscles": [
      "Traps",
      "Rotator Cuff"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Vanguard",
    "unlock_level": 20,
    "unlock_criteria": "Vanguard Shoulder Complex",
    "target_duration_mins": 8,
    "default_sets": 3,
    "default_reps_min": 6,
    "default_reps_max": 8,
    "default_rest_seconds": 90,
    "instructions": [
      "Perform 6 Front Raises, immediately 6 Lateral Raises, immediately 6 Bent-Over Rear Delt Raises with light dumbbells."
    ],
    "form_cues": [
      "Non-stop flow through all 3 heads of the shoulder",
      "Light weight only (1.25kg - 2.5kg plates)"
    ],
    "common_mistakes": [
      "Using heavy weight (form collapses)",
      "Resting between phases"
    ],
    "alternatives": [
      "Standing Lateral Raise",
      "Incline Rear Delt Fly"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Phase 1: Front Delts",
        "description": "6 strict front raises to eye level.",
        "coachTip": "Zero rest."
      },
      {
        "step": 2,
        "title": "Phase 2: Side Delts",
        "description": "6 strict lateral raises to shoulder height.",
        "coachTip": "Direct transition."
      },
      {
        "step": 3,
        "title": "Phase 3: Rear Delts",
        "description": "Hinge at hips, 6 rear delt flyes to completion.",
        "coachTip": "Complete 3D burn."
      }
    ]
  },
  {
    "id": "ex-standing-db-curl",
    "name": "Standing Dumbbell Bicep Curl",
    "split_day": "Saturday",
    "order_index": 1,
    "target_muscle": "Biceps Brachii (Short & Long Heads)",
    "secondary_muscles": [
      "Brachialis",
      "Forearms"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 7,
    "default_sets": 4,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Stand tall holding dumbbells with elbows pinned tight to sides.",
      "Curl dumbbells upward, supinating wrists (turning palms up) as weights pass thighs.",
      "Squeeze biceps hard at top without swinging elbows forward.",
      "Lower with 3-second negative to full extension."
    ],
    "form_cues": [
      "Elbows pinned to ribcage like hinges",
      "Turn pinkies outward at top contraction",
      "Full elbow extension at bottom"
    ],
    "common_mistakes": [
      "Swinging elbows forward (shifts work to front delts)",
      "Leaning backward with lumbar spine",
      "Cutting bottom stretch short"
    ],
    "alternatives": [
      "Incline Dumbbell Curl",
      "Hammer Curl"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Elbow Pin Setup",
        "description": "Elbows glued to side seams of shirt.",
        "coachTip": "Chest proud."
      },
      {
        "step": 2,
        "title": "Supination Curl",
        "description": "Curl upward, rotating palms toward ceiling as you rise.",
        "coachTip": "Turn pinky out."
      },
      {
        "step": 3,
        "title": "Eccentric Extension",
        "description": "Lower over 3 seconds to complete straight-arm stretch.",
        "coachTip": "Flex triceps at bottom."
      }
    ]
  },
  {
    "id": "ex-alternating-db-curl",
    "name": "Alternating Dumbbell Curl",
    "split_day": "Saturday",
    "order_index": 2,
    "target_muscle": "Biceps Brachii Unilateral",
    "secondary_muscles": [
      "Forearms"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Curl one dumbbell at a time, supinating wrist at top. Alternate sides smoothly."
    ],
    "form_cues": [
      "Pure focus on single bicep",
      "Zero body rock"
    ],
    "common_mistakes": [
      "Using hip swing",
      "Dropping weight"
    ],
    "alternatives": [
      "Standing Dumbbell Bicep Curl",
      "Incline Dumbbell Curl"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Alternate Ready",
        "description": "Stand tall, dumbbells at sides.",
        "coachTip": "Lock core."
      },
      {
        "step": 2,
        "title": "Right Curl",
        "description": "Curl right arm, supinating hard.",
        "coachTip": "Peak squeeze."
      },
      {
        "step": 3,
        "title": "Switch to Left",
        "description": "Lower right, curl left.",
        "coachTip": "Continuous cadence."
      }
    ]
  },
  {
    "id": "ex-incline-db-curl",
    "name": "Incline Dumbbell Curl (45°)",
    "split_day": "Saturday",
    "order_index": 3,
    "target_muscle": "Biceps Long Head (Peak & Deep Stretch)",
    "secondary_muscles": [
      "Brachialis"
    ],
    "bench_angle": "Incline 45°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Stage II",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Lie back on 45° bench with arms hanging vertically behind torso.",
      "Curl dumbbells upward keeping upper arms perpendicular to floor.",
      "Feel intense loaded stretch in bicep long head."
    ],
    "form_cues": [
      "Upper arms perpendicular to floor throughout",
      "Feel intense stretch in front of shoulder/bicep"
    ],
    "common_mistakes": [
      "Pulling elbows forward off vertical plane",
      "Lifting shoulders off bench"
    ],
    "alternatives": [
      "Standing Dumbbell Bicep Curl",
      "Seated Concentration Curl"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Incline Hang Setup",
        "description": "Lie against 45° pad, arms hanging behind torso.",
        "coachTip": "Bicep tendon stretched."
      },
      {
        "step": 2,
        "title": "Perpendicular Curl",
        "description": "Curl up without moving upper arm position.",
        "coachTip": "Pure bicep isolation."
      },
      {
        "step": 3,
        "title": "Deep Stretch Return",
        "description": "Lower slowly to full vertical hang.",
        "coachTip": "Inhale at bottom."
      }
    ]
  },
  {
    "id": "ex-hammer-curl",
    "name": "Standing Dumbbell Hammer Curl",
    "split_day": "Saturday",
    "order_index": 4,
    "target_muscle": "Brachialis & Brachioradialis",
    "secondary_muscles": [
      "Forearms",
      "Biceps"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Hold dumbbells with neutral grip (palms facing each other) throughout.",
      "Curl dumbbells straight up without rotating wrists, squeezing brachialis."
    ],
    "form_cues": [
      "Palms face each other entire rep",
      "Builds arm thickness and forearm size"
    ],
    "common_mistakes": [
      "Swinging weights",
      "Flaring elbows wide"
    ],
    "alternatives": [
      "Cross-Body Hammer Curl",
      "Reverse Dumbbell Curl"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Neutral Grip Setup",
        "description": "Palms facing thighs like holding hammers.",
        "coachTip": "Lock wrists."
      },
      {
        "step": 2,
        "title": "Hammer Drive",
        "description": "Curl straight up toward shoulders.",
        "coachTip": "Feel outer arm and forearm."
      },
      {
        "step": 3,
        "title": "Controlled Down",
        "description": "Lower along same path.",
        "coachTip": "Exhale up."
      }
    ]
  },
  {
    "id": "ex-cross-body-hammer-curl",
    "name": "Cross-Body Hammer Curl (Pinwheel Curl)",
    "split_day": "Saturday",
    "order_index": 5,
    "target_muscle": "Brachialis & Outer Bicep Peak",
    "secondary_muscles": [
      "Forearms"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Arm Width",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Curl dumbbell diagonally across chest toward opposite shoulder with neutral grip."
    ],
    "form_cues": [
      "Curl diagonally across chest",
      "Directly targets brachialis muscle beneath bicep"
    ],
    "common_mistakes": [
      "Swinging torso",
      "Hitting chest with weight"
    ],
    "alternatives": [
      "Standing Dumbbell Hammer Curl",
      "Zottman Curl"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Cross Angle Setup",
        "description": "Dumbbell in neutral grip at hip.",
        "coachTip": "Chest upright."
      },
      {
        "step": 2,
        "title": "Diagonal Curl",
        "description": "Curl across torso toward opposite collarbone.",
        "coachTip": "Squeeze outer arm."
      },
      {
        "step": 3,
        "title": "Lower",
        "description": "Lower back to hip cleanly.",
        "coachTip": "Repeat on both sides."
      }
    ]
  },
  {
    "id": "ex-concentration-curl",
    "name": "Seated Concentration Curl",
    "split_day": "Saturday",
    "order_index": 6,
    "target_muscle": "Bicep Peak Contraction & Short Head",
    "secondary_muscles": [
      "Forearms"
    ],
    "bench_angle": "Seated 90°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 3,
    "unlock_criteria": "Recruit Stage III",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Sit on bench edge, brace tricep/elbow against inside of inner thigh.",
      "Curl dumbbell up to chin without moving upper arm. Squeeze peak for 2 seconds."
    ],
    "form_cues": [
      "Elbow glued to inner thigh",
      "Hold 2-second peak squeeze"
    ],
    "common_mistakes": [
      "Using torso momentum to rock weight up",
      "Lifting elbow off leg"
    ],
    "alternatives": [
      "Standing Dumbbell Bicep Curl",
      "Preacher-Style Incline Curl"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Inner Thigh Anchor",
        "description": "Sit on bench edge, tricep braced against inner thigh.",
        "coachTip": "Arm hanging."
      },
      {
        "step": 2,
        "title": "Peak Curl",
        "description": "Curl upward toward face.",
        "coachTip": "Hold 2s contraction."
      },
      {
        "step": 3,
        "title": "Full Stretch",
        "description": "Lower to arm lockout.",
        "coachTip": "Zero swinging."
      }
    ]
  },
  {
    "id": "ex-seated-db-curl",
    "name": "Seated Dual Dumbbell Curl",
    "split_day": "Saturday",
    "order_index": 7,
    "target_muscle": "Biceps Brachii Strict",
    "secondary_muscles": [
      "Forearms"
    ],
    "bench_angle": "Seated 90°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Stage II",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Sit tall against 90° bench, curl both dumbbells simultaneously."
    ],
    "form_cues": [
      "Strict back support eliminates cheating",
      "Supinate wrists at top"
    ],
    "common_mistakes": [
      "Leaning forward off pad",
      "Rushing negative"
    ],
    "alternatives": [
      "Standing Dumbbell Bicep Curl",
      "Incline Dumbbell Curl"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "90° Seated Setup",
        "description": "Sit upright against bench backrest.",
        "coachTip": "Palms facing forward."
      },
      {
        "step": 2,
        "title": "Simultaneous Curl",
        "description": "Curl both arms smoothly.",
        "coachTip": "Squeeze at top."
      },
      {
        "step": 3,
        "title": "Lower",
        "description": "Lower over 3 seconds.",
        "coachTip": "Inhale down."
      }
    ]
  },
  {
    "id": "ex-zottman-curl",
    "name": "Zottman Curl",
    "split_day": "Saturday",
    "order_index": 8,
    "target_muscle": "Biceps on Way Up, Forearms on Way Down",
    "secondary_muscles": [
      "Brachioradialis",
      "Biceps"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 6,
    "unlock_criteria": "Initiate Grip Mastery",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Curl up with palms facing up (supinated).",
      "At the top, rotate wrists 180° so palms face down (pronated).",
      "Lower down over 3 seconds with palms facing down to annihilate forearms."
    ],
    "form_cues": [
      "Curl supinated, lower pronated",
      "Slow 3-second negative on forearm phase"
    ],
    "common_mistakes": [
      "Rotating while moving (rotate only at top)",
      "Using too heavy weight"
    ],
    "alternatives": [
      "Reverse Dumbbell Curl",
      "Standing Dumbbell Hammer Curl"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Supinated Curl",
        "description": "Curl up with palms facing ceiling.",
        "coachTip": "Biceps do lifting."
      },
      {
        "step": 2,
        "title": "Top Rotation",
        "description": "At top peak, rotate wrists 180° palms down.",
        "coachTip": "Overhand grip."
      },
      {
        "step": 3,
        "title": "Pronated Negative",
        "description": "Lower with overhand grip over 3 seconds.",
        "coachTip": "Forearms burn."
      }
    ]
  },
  {
    "id": "ex-reverse-db-curl",
    "name": "Reverse-Grip Dumbbell Curl",
    "split_day": "Saturday",
    "order_index": 9,
    "target_muscle": "Brachioradialis & Forearm Extensors",
    "secondary_muscles": [
      "Brachialis"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Forearm Armor",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Hold dumbbells with overhand grip (palms facing down).",
      "Curl upward keeping wrists straight and firm."
    ],
    "form_cues": [
      "Keep wrists completely neutral (do not let wrists bend)",
      "Builds massive upper forearm ridge"
    ],
    "common_mistakes": [
      "Curling wrists upward (cocking wrists)",
      "Using momentum"
    ],
    "alternatives": [
      "Zottman Curl",
      "Standing Dumbbell Hammer Curl"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Overhand Grip",
        "description": "Palms facing down, knuckles forward.",
        "coachTip": "Lock wrists."
      },
      {
        "step": 2,
        "title": "Forearm Curl",
        "description": "Curl up to chest height.",
        "coachTip": "Feel top of forearms."
      },
      {
        "step": 3,
        "title": "Down",
        "description": "Lower with control.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-drag-curl",
    "name": "Dumbbell Drag Curl",
    "split_day": "Saturday",
    "order_index": 10,
    "target_muscle": "Bicep Peak & Short Head",
    "secondary_muscles": [
      "Forearms"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 7,
    "unlock_criteria": "Initiate Bicep Peak",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Pull elbows straight back behind torso as dumbbells drag up along your torso/ribs."
    ],
    "form_cues": [
      "Elbows travel backward",
      "Dumbbells drag up shirt in straight vertical line"
    ],
    "common_mistakes": [
      "Curling elbows forward",
      "Swinging weights"
    ],
    "alternatives": [
      "Standing Dumbbell Bicep Curl",
      "Seated Concentration Curl"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Drag Setup",
        "description": "Dumbbells against thighs.",
        "coachTip": "Chest proud."
      },
      {
        "step": 2,
        "title": "Elbow Pull Back",
        "description": "Pull elbows backward as weights drag up torso.",
        "coachTip": "Zero shoulder involvement."
      },
      {
        "step": 3,
        "title": "Peak Squeeze",
        "description": "Squeeze biceps at nipple line.",
        "coachTip": "Drag down."
      }
    ]
  },
  {
    "id": "ex-preacher-curl",
    "name": "Preacher-Style Incline Dumbbell Curl (60°)",
    "split_day": "Saturday",
    "order_index": 11,
    "target_muscle": "Bicep Short Head Strict Isolation",
    "secondary_muscles": [
      "Forearms"
    ],
    "bench_angle": "Incline 60°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 6,
    "unlock_criteria": "Initiate Preacher Isolation",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Stand behind 60° bench, drape arm over backrest like a preacher bench pad.",
      "Curl dumbbell up to chin with zero body momentum."
    ],
    "form_cues": [
      "Upper arm locked against bench pad",
      "Eliminates all shoulder assistance"
    ],
    "common_mistakes": [
      "Hyperextending elbow at bottom",
      "Lifting arm off pad"
    ],
    "alternatives": [
      "Seated Concentration Curl",
      "Incline Dumbbell Curl"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Bench Arm Rest",
        "description": "Rest tricep and armpit on top edge of 60° bench.",
        "coachTip": "Arm extended."
      },
      {
        "step": 2,
        "title": "Preacher Curl",
        "description": "Curl dumbbell up toward face.",
        "coachTip": "Pure bicep tension."
      },
      {
        "step": 3,
        "title": "Careful Lower",
        "description": "Lower under control stopping just shy of hyperextension.",
        "coachTip": "Repeat on both sides."
      }
    ]
  },
  {
    "id": "ex-overhead-db-tricep-ext",
    "name": "Overhead Two-Handed Dumbbell Triceps Extension",
    "split_day": "Saturday",
    "order_index": 12,
    "target_muscle": "Triceps Long Head (Arm Size & Stretch)",
    "secondary_muscles": [
      "Anconeus"
    ],
    "bench_angle": "Seated 90°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 7,
    "default_sets": 4,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Sit upright on 90° bench, cup one heavy dumbbell overhead with diamond grip under top plate.",
      "Lower dumbbell behind head keeping elbows tucked pointing forward.",
      "Drive back up to arms length, flexing triceps at top."
    ],
    "form_cues": [
      "Elbows stay tucked pointing forward (do not flare wide)",
      "Deep loaded stretch in armpits/triceps"
    ],
    "common_mistakes": [
      "Flaring elbows 90 degrees out",
      "Arching lower back off bench pad"
    ],
    "alternatives": [
      "Single-Arm Overhead Extension",
      "Dumbbell Skull Crusher"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Diamond Cup Setup",
        "description": "Sit upright, cup top dumbbell plate overhead.",
        "coachTip": "Elbows in."
      },
      {
        "step": 2,
        "title": "Behind Head Descent",
        "description": "Lower dumbbell behind neck until forearms touch biceps.",
        "coachTip": "Inhale deep."
      },
      {
        "step": 3,
        "title": "Triceps Extension",
        "description": "Press straight up to ceiling, squeezing triceps.",
        "coachTip": "Exhale through teeth."
      }
    ]
  },
  {
    "id": "ex-single-arm-overhead-ext",
    "name": "Single-Arm Overhead Dumbbell Extension",
    "split_day": "Saturday",
    "order_index": 13,
    "target_muscle": "Triceps Long Head Unilateral",
    "secondary_muscles": [
      "Core"
    ],
    "bench_angle": "Seated 90°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Stage II",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Sit on bench, hold single dumbbell overhead with one arm.",
      "Lower behind head, press to top lockout."
    ],
    "form_cues": [
      "Unilateral triceps isolation",
      "Support working elbow with free hand if needed"
    ],
    "common_mistakes": [
      "Elbow drifting forward",
      "Dropping weight"
    ],
    "alternatives": [
      "Overhead Two-Handed Dumbbell Triceps Extension",
      "Dumbbell Skull Crusher"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Single Overhead",
        "description": "One dumbbell locked overhead, elbow tucked.",
        "coachTip": "Spine straight."
      },
      {
        "step": 2,
        "title": "Deep Bend",
        "description": "Lower behind opposite ear/neck.",
        "coachTip": "Feel triceps stretch."
      },
      {
        "step": 3,
        "title": "Drive",
        "description": "Extend arm straight up.",
        "coachTip": "Repeat on both sides."
      }
    ]
  },
  {
    "id": "ex-db-skull-crusher",
    "name": "Dumbbell Skull Crusher (Lying on Bench)",
    "split_day": "Saturday",
    "order_index": 14,
    "target_muscle": "Triceps Medial & Lateral Heads",
    "secondary_muscles": [
      "Anconeus"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Recruit Stage II",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Lie flat on bench, hold two dumbbells over chest with neutral grip.",
      "Hinge only at the elbows, lowering dumbbells to sides of ears/temples.",
      "Press back up to arms length without moving upper arms."
    ],
    "form_cues": [
      "Upper arms angled slightly backward (10°) to keep constant tension",
      "Only forearms move"
    ],
    "common_mistakes": [
      "Dropping dumbbells on forehead",
      "Moving upper arms forward and back like a pullover"
    ],
    "alternatives": [
      "Lying Triceps Extension",
      "Dumbbell Floor Triceps Extension"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Bench Lock Setup",
        "description": "Lie flat, dumbbells extended over forehead with slight backward angle.",
        "coachTip": "Wrists neutral."
      },
      {
        "step": 2,
        "title": "Elbow Hinge",
        "description": "Bend elbows, lowering dumbbells beside temples.",
        "coachTip": "Upper arms stationary."
      },
      {
        "step": 3,
        "title": "Triceps Lock",
        "description": "Snap forearms back to straight lockout.",
        "coachTip": "Exhale at peak."
      }
    ]
  },
  {
    "id": "ex-lying-db-tricep-ext",
    "name": "Lying Dumbbell Triceps Extension (Behind Head)",
    "split_day": "Saturday",
    "order_index": 15,
    "target_muscle": "Triceps Long & Medial Heads",
    "secondary_muscles": [
      "Anconeus"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Triceps Length",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Lie flat, lower dumbbells past crown of head toward floor for maximum long head stretch."
    ],
    "form_cues": [
      "Deep stretch behind head",
      "Keep elbows pointing at ceiling"
    ],
    "common_mistakes": [
      "Flaring elbows wide",
      "Flaring lower back"
    ],
    "alternatives": [
      "Dumbbell Skull Crusher",
      "Overhead Two-Handed Dumbbell Triceps Extension"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Lying Setup",
        "description": "Lie flat, arms extended back 15°.",
        "coachTip": "Tight abs."
      },
      {
        "step": 2,
        "title": "Behind Crown Drop",
        "description": "Lower weights past top of head.",
        "coachTip": "Deep triceps stretch."
      },
      {
        "step": 3,
        "title": "Extend",
        "description": "Extend arms back to starting angle.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-floor-db-tricep-ext",
    "name": "Dumbbell Floor Triceps Extension",
    "split_day": "Saturday",
    "order_index": 16,
    "target_muscle": "Triceps Lockout (Elbow Safe)",
    "secondary_muscles": [
      "Anconeus"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie on floor, perform skull crushers with floor preventing excessive elbow drop."
    ],
    "form_cues": [
      "Safe for sensitive elbow tendons",
      "Controlled cadence"
    ],
    "common_mistakes": [
      "Bouncing weights on floor",
      "Moving upper arms"
    ],
    "alternatives": [
      "Dumbbell Skull Crusher",
      "Close-Grip Push-Up"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Floor Setup",
        "description": "Lie supine on floor, arms vertical.",
        "coachTip": "Feet flat."
      },
      {
        "step": 2,
        "title": "Hinge",
        "description": "Lower dumbbells beside ears until plates brush floor.",
        "coachTip": "Safe depth."
      },
      {
        "step": 3,
        "title": "Press",
        "description": "Extend arms to vertical.",
        "coachTip": "Hard triceps squeeze."
      }
    ]
  },
  {
    "id": "ex-close-grip-pushup-sat",
    "name": "Close-Grip Push-Up (Triceps Builder)",
    "split_day": "Saturday",
    "order_index": 17,
    "target_muscle": "Triceps Lateral & Medial Heads",
    "secondary_muscles": [
      "Chest",
      "Core"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Awakening Foundation",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Perform push-ups with hands shoulder-width and elbows skimming ribs."
    ],
    "form_cues": [
      "Elbows brush ribs",
      "Lock triceps at top"
    ],
    "common_mistakes": [
      "Flaring elbows wide",
      "Sagging spine"
    ],
    "alternatives": [
      "Diamond Push-Up",
      "Dumbbell Skull Crusher"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Narrow Base",
        "description": "Hands under shoulders, body in steel plank.",
        "coachTip": "Tight glutes."
      },
      {
        "step": 2,
        "title": "Brush Ribs",
        "description": "Lower with elbows hugging sides.",
        "coachTip": "Inhale."
      },
      {
        "step": 3,
        "title": "Triceps Lock",
        "description": "Press to full lockout.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-diamond-pushup",
    "name": "Diamond Push-Up",
    "split_day": "Saturday",
    "order_index": 18,
    "target_muscle": "Triceps Peak Lockout & Lateral Head",
    "secondary_muscles": [
      "Inner Pecs"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Warrior",
    "unlock_level": 10,
    "unlock_criteria": "Warrior Bodyweight Arms",
    "target_duration_mins": 7,
    "default_sets": 3,
    "default_reps_min": 8,
    "default_reps_max": 12,
    "default_rest_seconds": 75,
    "instructions": [
      "Place index fingers and thumbs together forming diamond directly under center of chest.",
      "Lower chest to touch diamond, press up to forceful triceps lockout."
    ],
    "form_cues": [
      "Diamond shape under sternum",
      "Peak triceps contraction"
    ],
    "common_mistakes": [
      "Shoulder pain (widen hands slightly if needed)",
      "Cutting depth short"
    ],
    "alternatives": [
      "Close-Grip Push-Up",
      "Dumbbell Skull Crusher"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Diamond Window",
        "description": "Thumbs and index fingers touching under sternum.",
        "coachTip": "Plank posture."
      },
      {
        "step": 2,
        "title": "Sternum Touch",
        "description": "Lower chest to graze diamond hands.",
        "coachTip": "Elbows tucked."
      },
      {
        "step": 3,
        "title": "Explosive Lock",
        "description": "Drive palms into mat to full arm lockout.",
        "coachTip": "Squeeze triceps."
      }
    ]
  },
  {
    "id": "ex-db-tricep-kickback",
    "name": "Dumbbell Triceps Kickback (Chest Supported 45°)",
    "split_day": "Saturday",
    "order_index": 19,
    "target_muscle": "Triceps Lateral Head Peak Contraction",
    "secondary_muscles": [
      "Rear Delts"
    ],
    "bench_angle": "Incline 45°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Initiate Triceps Peak",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie chest-down on 45° bench, pin upper arms parallel to torso.",
      "Extend forearms backward until arms are completely straight, squeezing triceps for 2 seconds."
    ],
    "form_cues": [
      "Chest supported eliminates cheating",
      "Hold 2-second squeeze with arms straight as rods"
    ],
    "common_mistakes": [
      "Dropping elbows below torso level",
      "Swinging weights with momentum"
    ],
    "alternatives": [
      "Overhead Two-Handed Dumbbell Triceps Extension",
      "Dumbbell Tate Press"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Pin Upper Arms",
        "description": "Chest on 45° bench, upper arms pinned high parallel to torso.",
        "coachTip": "Elbows up."
      },
      {
        "step": 2,
        "title": "Kick Back",
        "description": "Snap forearms straight back to ceiling.",
        "coachTip": "Hold 2s peak."
      },
      {
        "step": 3,
        "title": "Control",
        "description": "Return to 90° bend only.",
        "coachTip": "Never drop elbows."
      }
    ]
  },
  {
    "id": "ex-db-tate-press",
    "name": "Dumbbell Tate Press (Flat Bench)",
    "split_day": "Saturday",
    "order_index": 20,
    "target_muscle": "Triceps Lateral Head (Horseshoe Width)",
    "secondary_muscles": [
      "Anconeus"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Warrior",
    "unlock_level": 12,
    "unlock_criteria": "Warrior Triceps Horseshoe",
    "target_duration_mins": 6,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 60,
    "instructions": [
      "Lie flat, hold dumbbells over chest with palms facing feet and bells touching.",
      "Bend elbows out wide, lowering inner heads of dumbbells to touch chest, then press back up."
    ],
    "form_cues": [
      "Palms face feet",
      "Elbows flare wide as bells touch chest"
    ],
    "common_mistakes": [
      "Moving upper arms",
      "Bouncing off sternum"
    ],
    "alternatives": [
      "Dumbbell Skull Crusher",
      "Dumbbell Triceps Kickback"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Tate Setup",
        "description": "Lie flat, dumbbells over chest, palms facing feet.",
        "coachTip": "Bells touching."
      },
      {
        "step": 2,
        "title": "Chest Touch",
        "description": "Bend elbows wide, lowering bells to graze chest.",
        "coachTip": "Feel triceps stretch."
      },
      {
        "step": 3,
        "title": "Snap Lockout",
        "description": "Press back to top, locking triceps hard.",
        "coachTip": "Exhale."
      }
    ]
  },
  {
    "id": "ex-incline-bench-crunch",
    "name": "Incline Bench Crunch",
    "split_day": "Monday",
    "order_index": 21,
    "target_muscle": "Upper Rectus Abdominis",
    "secondary_muscles": [
      "Deep Core"
    ],
    "bench_angle": "Incline 30°",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Daily Belly Protocol Day A",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 15,
    "default_reps_max": 20,
    "default_rest_seconds": 45,
    "instructions": [
      "Lie on 30° bench with knees bent and feet hooked.",
      "Curl ribcage down toward pelvis, crunching upper abs hard for 1 second at top."
    ],
    "form_cues": [
      "Roll ribcage down toward hips",
      "Exhale all air at peak"
    ],
    "common_mistakes": [
      "Yanking on neck with hands",
      "Arching lower back"
    ],
    "alternatives": [
      "Dumbbell Crunch Pulse",
      "Hollow Body Hold"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Bench Curl Setup",
        "description": "Lie against incline bench, feet anchored.",
        "coachTip": "Fingertips on temples."
      },
      {
        "step": 2,
        "title": "Rib-to-Pelvis Curl",
        "description": "Curl ribcage down, flexing upper abs violently.",
        "coachTip": "Exhale fully."
      },
      {
        "step": 3,
        "title": "Controlled Unroll",
        "description": "Lower with control.",
        "coachTip": "Inhale."
      }
    ]
  },
  {
    "id": "ex-hollow-body-hold",
    "name": "Hollow Body Hold",
    "split_day": "Wednesday",
    "order_index": 21,
    "target_muscle": "Transverse Abdominis & Deep Core",
    "secondary_muscles": [
      "Rectus Abdominis"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Daily Belly Protocol Day A",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 30,
    "default_reps_max": 45,
    "default_rest_seconds": 45,
    "instructions": [
      "Lie on back, press lumbar spine flat into floor with zero gap.",
      "Extend arms overhead and legs forward hovering 6 inches off floor, holding rigid banana shape."
    ],
    "form_cues": [
      "Lower back must stay glued to floor",
      "Glutes and abs clenched"
    ],
    "common_mistakes": [
      "Lower back arching off floor (stop immediately)",
      "Holding breath"
    ],
    "alternatives": [
      "Incline Bench Crunch",
      "Dumbbell Crunch Pulse"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Floor Flatten",
        "description": "Lie flat, smash lower back into floor.",
        "coachTip": "Zero gap."
      },
      {
        "step": 2,
        "title": "Hollow Banana",
        "description": "Elevate shoulders and heels 6 inches off floor.",
        "coachTip": "Arms overhead."
      },
      {
        "step": 3,
        "title": "Steady Breathing",
        "description": "Hold for 30-45 seconds taking shallow breaths.",
        "coachTip": "Rock solid."
      }
    ]
  },
  {
    "id": "ex-db-crunch-pulse",
    "name": "Dumbbell Crunch Pulse (Plate Held High)",
    "split_day": "Friday",
    "order_index": 21,
    "target_muscle": "Upper Rectus Abdominis (Loaded)",
    "secondary_muscles": [
      "Intercostals"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Daily Belly Protocol Day A",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 15,
    "default_reps_max": 20,
    "default_rest_seconds": 45,
    "instructions": [
      "Lie on back with knees bent, holding 2.5kg or 5kg plate straight up toward ceiling.",
      "Pulse upper shoulders off floor pushing weight directly toward ceiling."
    ],
    "form_cues": [
      "Push weight vertically to ceiling",
      "Short forceful pulses"
    ],
    "common_mistakes": [
      "Swinging arms forward",
      "Jerking head"
    ],
    "alternatives": [
      "Incline Bench Crunch",
      "Hollow Body Hold"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Vertical Plate",
        "description": "Hold plate straight up over chest.",
        "coachTip": "Eyes on plate."
      },
      {
        "step": 2,
        "title": "Ceiling Pulse",
        "description": "Crunch up pushing plate toward ceiling.",
        "coachTip": "Short sharp pulse."
      },
      {
        "step": 3,
        "title": "Lower",
        "description": "Lower shoulders lightly and repeat.",
        "coachTip": "Constant burn."
      }
    ]
  },
  {
    "id": "ex-bench-accordion-crunch",
    "name": "Bench Accordion Crunch",
    "split_day": "Monday",
    "order_index": 22,
    "target_muscle": "Total Rectus Abdominis",
    "secondary_muscles": [
      "Hip Flexors"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Daily Belly Protocol Day A",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 15,
    "default_reps_max": 20,
    "default_rest_seconds": 45,
    "instructions": [
      "Sit on edge of flat bench gripping sides.",
      "Simultaneously pull knees to chest and crunch torso forward like an accordion, then extend out."
    ],
    "form_cues": [
      "Synchronized knee pull and torso crunch",
      "Full extension"
    ],
    "common_mistakes": [
      "Slouching backward",
      "Touching feet to floor"
    ],
    "alternatives": [
      "Incline Bench Crunch",
      "Hollow Body Hold"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Bench Edge Balance",
        "description": "Perched on bench edge, hands gripping sides.",
        "coachTip": "Legs extended."
      },
      {
        "step": 2,
        "title": "Accordion Squeeze",
        "description": "Pull knees to chest as torso crunches forward.",
        "coachTip": "Meet in middle."
      },
      {
        "step": 3,
        "title": "Extend",
        "description": "Extend legs and torso out together.",
        "coachTip": "Controlled rhythm."
      }
    ]
  },
  {
    "id": "ex-flat-bench-reverse-crunch",
    "name": "Flat Bench Reverse Crunch",
    "split_day": "Tuesday",
    "order_index": 21,
    "target_muscle": "Lower Rectus Abdominis",
    "secondary_muscles": [
      "Deep Core"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Daily Belly Protocol Day B",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 12,
    "default_reps_max": 15,
    "default_rest_seconds": 45,
    "instructions": [
      "Lie on flat bench, grip top of bench behind head.",
      "Curl knees toward chest and lift pelvis/tailbone off the bench toward ceiling.",
      "Lower pelvis under control with zero swinging."
    ],
    "form_cues": [
      "Lift pelvis off bench with lower abs",
      "Do not swing legs for momentum"
    ],
    "common_mistakes": [
      "Kicking legs instead of curling pelvis",
      "Dropping hips fast"
    ],
    "alternatives": [
      "Lying Dumbbell Leg Raise",
      "Seated Bench Knee Tucks"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Bench Grip Setup",
        "description": "Lie flat on bench, hands gripping edge behind head.",
        "coachTip": "Knees bent 90°."
      },
      {
        "step": 2,
        "title": "Pelvis Curl",
        "description": "Roll pelvis upward toward ribs, lifting tailbone 3 inches.",
        "coachTip": "Pure lower ab squeeze."
      },
      {
        "step": 3,
        "title": "Controlled Roll Down",
        "description": "Roll spine down one vertebra at a time.",
        "coachTip": "Inhale at bottom."
      }
    ]
  },
  {
    "id": "ex-lying-db-leg-raise",
    "name": "Lying Straight Leg Raise (with Dumbbell clamped)",
    "split_day": "Thursday",
    "order_index": 21,
    "target_muscle": "Lower Rectus Abdominis & Psoas",
    "secondary_muscles": [
      "Hip Flexors"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "dumbbells",
    "unlock_tier": "Initiate",
    "unlock_level": 5,
    "unlock_criteria": "Daily Belly Protocol Day B",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 45,
    "instructions": [
      "Lie flat, clamp a light 1kg or 2kg dumbbell between feet (or bodyweight).",
      "Raise legs to vertical, then lower slowly stopping 2 inches off floor with lower back pinned."
    ],
    "form_cues": [
      "Keep lower back pressed into mat",
      "Slow 3-second lowering"
    ],
    "common_mistakes": [
      "Lower back arching off floor",
      "Bending knees excessively"
    ],
    "alternatives": [
      "Flat Bench Reverse Crunch",
      "Seated Bench Knee Tucks"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Floor Clamp",
        "description": "Lie flat, legs extended, optional light dumbbell clamped between feet.",
        "coachTip": "Back pinned flat."
      },
      {
        "step": 2,
        "title": "Vertical Leg Lift",
        "description": "Raise legs smoothly to 90° vertical.",
        "coachTip": "Exhale through teeth."
      },
      {
        "step": 3,
        "title": "Hover Negative",
        "description": "Lower slowly until heels hover 2 inches above mat.",
        "coachTip": "Never touch floor."
      }
    ]
  },
  {
    "id": "ex-seated-bench-knee-tucks",
    "name": "Seated Bench Knee Tucks",
    "split_day": "Saturday",
    "order_index": 21,
    "target_muscle": "Lower Abdominals & Core Compression",
    "secondary_muscles": [
      "Hip Flexors"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 2,
    "unlock_criteria": "Daily Belly Protocol Day B",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 15,
    "default_reps_max": 20,
    "default_rest_seconds": 45,
    "instructions": [
      "Sit on edge of flat bench, lean back 30° gripping bench behind hips.",
      "Extend legs forward, then pull knees forcefully into chest."
    ],
    "form_cues": [
      "Continuous fluid pumping motion",
      "Feel lower ab contraction"
    ],
    "common_mistakes": [
      "Rushing without full knee extension",
      "Leaning too far back"
    ],
    "alternatives": [
      "Flat Bench Reverse Crunch",
      "Flutter Kicks"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Bench Edge Perch",
        "description": "Sit on bench end, hands gripping behind hips.",
        "coachTip": "Lean back 30°."
      },
      {
        "step": 2,
        "title": "Tuck Squeeze",
        "description": "Pull knees to sternum tightly.",
        "coachTip": "Exhale."
      },
      {
        "step": 3,
        "title": "Extend",
        "description": "Extend legs straight forward hovering.",
        "coachTip": "Inhale."
      }
    ]
  },
  {
    "id": "ex-flutter-kicks",
    "name": "Scissor & Flutter Kicks",
    "split_day": "Tuesday",
    "order_index": 22,
    "target_muscle": "Lower Ab Endurance & Transverse Core",
    "secondary_muscles": [
      "Hip Flexors"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Daily Belly Protocol Day B",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 30,
    "default_reps_max": 45,
    "default_rest_seconds": 45,
    "instructions": [
      "Lie flat, hands under glutes to support pelvis.",
      "Kick legs in alternating small rapid fluttering motions 6 inches off floor for 30-45 seconds."
    ],
    "form_cues": [
      "Small rapid kicks",
      "Lower back pressed flat"
    ],
    "common_mistakes": [
      "Kicking too high in air",
      "Arching lower back"
    ],
    "alternatives": [
      "Seated Bench Knee Tucks",
      "Flat Bench Reverse Crunch"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Pelvis Cushion",
        "description": "Hands under glutes, head slightly lifted.",
        "coachTip": "Spine flat."
      },
      {
        "step": 2,
        "title": "Flutter Cadence",
        "description": "Alternate rapid flutter kicks 6 inches off mat.",
        "coachTip": "Point toes."
      },
      {
        "step": 3,
        "title": "Endure",
        "description": "Maintain steady shallow breathing for 45s.",
        "coachTip": "Burn."
      }
    ]
  },
  {
    "id": "ex-cat-cow",
    "name": "Spinal Cat-Cow Flow",
    "split_day": "Sunday",
    "order_index": 1,
    "target_muscle": "Spinal Mobility & Lumbar Decompression",
    "secondary_muscles": [
      "Thoracic Spine",
      "Core"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Sunday Recovery Sanctuary",
    "target_duration_mins": 5,
    "default_sets": 3,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 30,
    "instructions": [
      "On all fours, inhale as you drop belly and look up (Cow).",
      "Exhale as you arch spine to ceiling and tuck chin (Cat).",
      "Move with gentle fluid breath."
    ],
    "form_cues": [
      "Synchronize movement with breath",
      "Articulate every vertebra"
    ],
    "common_mistakes": [
      "Forcing painful range of motion",
      "Rushing"
    ],
    "alternatives": [
      "Thoracic Rotation",
      "Child's Pose"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Tabletop Setup",
        "description": "Hands under shoulders, knees under hips.",
        "coachTip": "Neutral spine."
      },
      {
        "step": 2,
        "title": "Cow Inhale",
        "description": "Drop belly toward floor, look up softly.",
        "coachTip": "Inhale deep."
      },
      {
        "step": 3,
        "title": "Cat Exhale",
        "description": "Round spine up like a frightened cat, tucking chin.",
        "coachTip": "Exhale fully."
      }
    ]
  },
  {
    "id": "ex-childs-pose",
    "name": "Restorative Child's Pose",
    "split_day": "Sunday",
    "order_index": 2,
    "target_muscle": "Lat Stretch & Parasympathetic Recovery",
    "secondary_muscles": [
      "Lower Back",
      "Hips"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Sunday Recovery Sanctuary",
    "target_duration_mins": 5,
    "default_sets": 2,
    "default_reps_min": 45,
    "default_reps_max": 60,
    "default_rest_seconds": 30,
    "instructions": [
      "Sit back on heels, reach arms far forward on mat, rest forehead on floor.",
      "Breathe deeply into ribcage for 60 seconds."
    ],
    "form_cues": [
      "Sink hips back to heels",
      "Slow parasympathetic breathing"
    ],
    "common_mistakes": [
      "Tensing shoulders",
      "Shallow chest breathing"
    ],
    "alternatives": [
      "Spinal Cat-Cow Flow",
      "Hip Flexor Stretch"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Kneel & Reach",
        "description": "Knees wide, big toes touching, reach arms forward.",
        "coachTip": "Forehead on mat."
      },
      {
        "step": 2,
        "title": "Deep Belly Breath",
        "description": "Expand belly and lower back on every inhale.",
        "coachTip": "4 seconds in, 6 seconds out."
      },
      {
        "step": 3,
        "title": "Sink & Surrender",
        "description": "Allow hips to melt into heels.",
        "coachTip": "Full relaxation."
      }
    ]
  },
  {
    "id": "ex-thoracic-rotation",
    "name": "Thoracic Spine Rotations (Bench Supported)",
    "split_day": "Sunday",
    "order_index": 3,
    "target_muscle": "Thoracic Spine Mobility",
    "secondary_muscles": [
      "Chest",
      "Upper Back"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Sunday Recovery Sanctuary",
    "target_duration_mins": 5,
    "default_sets": 2,
    "default_reps_min": 10,
    "default_reps_max": 12,
    "default_rest_seconds": 30,
    "instructions": [
      "Kneel beside bench with one forearm rested on pad.",
      "Reach other hand behind head and rotate elbow open toward ceiling, then back down."
    ],
    "form_cues": [
      "Rotate through mid-back, not lower back",
      "Eyes follow elbow"
    ],
    "common_mistakes": [
      "Twisting hips",
      "Forcing stiff shoulder"
    ],
    "alternatives": [
      "Spinal Cat-Cow Flow",
      "Shoulder Dislocates"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Forearm Anchor",
        "description": "One arm rested on bench, hand behind head.",
        "coachTip": "Hips locked."
      },
      {
        "step": 2,
        "title": "Ceiling Rotation",
        "description": "Rotate elbow toward sky.",
        "coachTip": "Feel thoracic spine open."
      },
      {
        "step": 3,
        "title": "Return",
        "description": "Lower elbow smoothly.",
        "coachTip": "Repeat on both sides."
      }
    ]
  },
  {
    "id": "ex-hip-flexor-stretch",
    "name": "Half-Kneeling Hip Flexor Stretch",
    "split_day": "Sunday",
    "order_index": 4,
    "target_muscle": "Psoas & Quad Mobility",
    "secondary_muscles": [
      "Glutes",
      "Lower Back"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Sunday Recovery Sanctuary",
    "target_duration_mins": 5,
    "default_sets": 2,
    "default_reps_min": 45,
    "default_reps_max": 60,
    "default_rest_seconds": 30,
    "instructions": [
      "In half-kneeling lunge, tuck pelvis under (posterior pelvic tilt) and squeeze back glute.",
      "Shift forward slightly until deep stretch is felt in front of back hip."
    ],
    "form_cues": [
      "Posterior pelvic tilt is critical",
      "Squeeze trailing glute hard"
    ],
    "common_mistakes": [
      "Arching lower back",
      "Lunging too far forward"
    ],
    "alternatives": [
      "Restorative Child's Pose",
      "Hamstring Stretch"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Half Kneel",
        "description": "One knee down, front foot flat at 90°.",
        "coachTip": "Torso tall."
      },
      {
        "step": 2,
        "title": "Glute Tuck",
        "description": "Tuck pelvis under and clench trailing glute.",
        "coachTip": "Instant hip flexor stretch."
      },
      {
        "step": 3,
        "title": "Shift & Hold",
        "description": "Glide forward 2 inches, hold 45 seconds.",
        "coachTip": "Slow breathing."
      }
    ]
  },
  {
    "id": "ex-hamstring-stretch",
    "name": "Bench-Elevated Hamstring Stretch",
    "split_day": "Sunday",
    "order_index": 5,
    "target_muscle": "Hamstrings & Sciatic Flossing",
    "secondary_muscles": [
      "Calves"
    ],
    "bench_angle": "Flat",
    "required_equipment": "bench_and_dumbbells",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Sunday Recovery Sanctuary",
    "target_duration_mins": 5,
    "default_sets": 2,
    "default_reps_min": 45,
    "default_reps_max": 60,
    "default_rest_seconds": 30,
    "instructions": [
      "Place heel on flat bench with leg straight and toes pulled back.",
      "Hinge gently forward at hips with flat spine until hamstring stretch is felt."
    ],
    "form_cues": [
      "Keep spine completely flat",
      "Hinge from hip crease"
    ],
    "common_mistakes": [
      "Rounding back to touch toes",
      "Locking knee violently"
    ],
    "alternatives": [
      "Half-Kneeling Hip Flexor Stretch",
      "Spinal Cat-Cow Flow"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Heel on Bench",
        "description": "Place heel on flat bench, soft micro-bend.",
        "coachTip": "Toes pulled back."
      },
      {
        "step": 2,
        "title": "Hinge Forward",
        "description": "Hinge chest forward with flat back.",
        "coachTip": "Feel belly of hamstring stretch."
      },
      {
        "step": 3,
        "title": "Hold",
        "description": "Breathe into stretch for 45s.",
        "coachTip": "Switch sides."
      }
    ]
  },
  {
    "id": "ex-478-breathing",
    "name": "4-7-8 Parasympathetic Recovery Breathing",
    "split_day": "Sunday",
    "order_index": 6,
    "target_muscle": "Nervous System Reset & Cortisol Reduction",
    "secondary_muscles": [
      "Vagus Nerve",
      "Heart Rate Variability"
    ],
    "bench_angle": "Floor / Standing",
    "required_equipment": "bodyweight",
    "unlock_tier": "Recruit",
    "unlock_level": 1,
    "unlock_criteria": "Sunday Recovery Sanctuary",
    "target_duration_mins": 5,
    "default_sets": 1,
    "default_reps_min": 8,
    "default_reps_max": 10,
    "default_rest_seconds": 0,
    "instructions": [
      "Lie supine comfortably.",
      "Inhale through nose for 4 seconds, hold breath for 7 seconds, exhale completely through mouth for 8 seconds.",
      "Perform 8 cycles to activate deep parasympathetic nervous system recovery."
    ],
    "form_cues": [
      "Count: Inhale 4s, Hold 7s, Exhale 8s",
      "Triggers deep nervous system restoration"
    ],
    "common_mistakes": [
      "Rushing counts",
      "Gasping on inhale"
    ],
    "alternatives": [
      "Restorative Child's Pose",
      "Spinal Cat-Cow Flow"
    ],
    "demo_steps": [
      {
        "step": 1,
        "title": "Supine Rest",
        "description": "Lie flat on mat, one hand on belly, one on chest.",
        "coachTip": "Close eyes."
      },
      {
        "step": 2,
        "title": "The 4-7-8 Cycle",
        "description": "Inhale 4s through nose, hold 7s, whoosh exhale 8s.",
        "coachTip": "Heart rate slows."
      },
      {
        "step": 3,
        "title": "System Restored",
        "description": "Complete 8 cycles.",
        "coachTip": "Cortisol reduced."
      }
    ]
  }
];

export const UPPER_BELLY_PROTOCOL: MasterExercise[] = MASTER_EXERCISE_CATALOG.filter(
  (ex) => ex.unlock_criteria.includes("Day A")
);

export const LOWER_BELLY_PROTOCOL: MasterExercise[] = MASTER_EXERCISE_CATALOG.filter(
  (ex) => ex.unlock_criteria.includes("Day B")
);

export const SUNDAY_MOBILITY_PROTOCOL: MasterExercise[] = MASTER_EXERCISE_CATALOG.filter(
  (ex) => ex.split_day === "Sunday"
);

export function getDayExercises(day: DayOfWeek): MasterExercise[] {
  // Sunday has zero lifting exercises
  if (day === "Sunday") return [];
  return MASTER_EXERCISE_CATALOG.filter(
    (ex) => ex.split_day === day && !ex.unlock_criteria.includes("Daily Belly")
  );
}

export const getExercisesForDay = getDayExercises;

export function isExerciseUnlocked(
  exercise: MasterExercise,
  playerLevel: number,
  playerRank: HunterRank
): boolean {
  const rankTiers: Record<HunterRank, number> = {
    Recruit: 1,
    Initiate: 2,
    Warrior: 3,
    Vanguard: 4,
    Knight: 5,
    Gladiator: 6,
    Warlord: 7,
    Juggernaut: 8,
    Sovereign: 9,
    Ascendant: 10,
    Spartan: 11,
    Elite: 11,
  };

  const currentTierScore = rankTiers[playerRank] || 1;
  const requiredTierScore = rankTiers[exercise.unlock_tier] || 1;

  if (currentTierScore > requiredTierScore) return true;
  if (currentTierScore === requiredTierScore) {
    return playerLevel >= exercise.unlock_level;
  }
  return false;
}

export function getDailyBellyProtocol(day: DayOfWeek): MasterExercise[] {
  // Monday, Wednesday, Friday = Upper Belly (Day A)
  if (day === "Monday" || day === "Wednesday" || day === "Friday") {
    return UPPER_BELLY_PROTOCOL;
  }
  // Tuesday, Thursday, Saturday = Lower Belly (Day B)
  if (day === "Tuesday" || day === "Thursday" || day === "Saturday") {
    return LOWER_BELLY_PROTOCOL;
  }
  return [];
}

/**
 * Derives the active RPG attribute yield for any exercise
 */
export function getExerciseAttributeYield(exercise: MasterExercise): Partial<Record<AttributeType, number>> {
  if (exercise.attribute_yield) return exercise.attribute_yield;
  const tm = exercise.target_muscle.toLowerCase();
  if (tm.includes("chest")) {
    return { strength: 0.35, discipline: 0.20, vitality: 0.15 };
  }
  if (tm.includes("back") || tm.includes("lat")) {
    return { strength: 0.35, endurance: 0.25, discipline: 0.20 };
  }
  if (tm.includes("quad") || tm.includes("leg") || tm.includes("glute") || tm.includes("hamstring")) {
    return { strength: 0.40, vitality: 0.25, endurance: 0.20 };
  }
  if (tm.includes("shoulder") || tm.includes("delt")) {
    return { strength: 0.30, discipline: 0.20, agility: 0.15 };
  }
  if (tm.includes("bicep") || tm.includes("tricep") || tm.includes("arm")) {
    return { strength: 0.30, discipline: 0.20, mentality: 0.10 };
  }
  if (tm.includes("belly") || tm.includes("core") || tm.includes("ab")) {
    return { endurance: 0.30, discipline: 0.25, agility: 0.15 };
  }
  if (tm.includes("mobility") || tm.includes("spine")) {
    return { agility: 0.30, vitality: 0.25, mentality: 0.20 };
  }
  return { strength: 0.25, discipline: 0.20 };
}

/**
 * Calculates current calendar week index (0 = Week A, 1 = Week B)
 */
export function getCurrentWeekRotationIndex(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diffDays = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.floor(diffDays / 7) % 2;
}

/**
 * Retrieves rotated exercises for the given day so consecutive weeks vary,
 * calibrated with dynamic sets/reps matching the player's level.
 */
export function getRotatedSplitExercises(
  day: DayOfWeek,
  playerLevel: number = 1,
  playerRank: HunterRank = "Recruit",
  targetCount: number = 5
): MasterExercise[] {
  if (day === "Sunday") return [];

  const allDay = getDayExercises(day);
  const unlocked = allDay.filter((ex) => isExerciseUnlocked(ex, playerLevel, playerRank));
  if (unlocked.length === 0) return allDay.slice(0, targetCount);

  const weekRot = getCurrentWeekRotationIndex(); // 0 = Week A, 1 = Week B

  // Week A selects even-indexed unlocked movements, Week B selects odd-indexed
  const primaryCluster = unlocked.filter((_, idx) => idx % 2 === weekRot);
  const secondaryCluster = unlocked.filter((_, idx) => idx % 2 !== weekRot);
  const combined = [...primaryCluster, ...secondaryCluster].slice(0, targetCount);

  // Calibrate sets and reps dynamically to player level
  return combined.map((ex) => {
    let sets = 3;
    let minReps = 8;
    let maxReps = 10;
    let restSec = 90;

    if (playerLevel >= 20) {
      sets = 4;
      minReps = 12;
      maxReps = 15;
      restSec = 60;
    } else if (playerLevel >= 10) {
      sets = 4;
      minReps = 10;
      maxReps = 12;
      restSec = 60;
    } else if (playerLevel >= 5) {
      sets = 3;
      minReps = 10;
      maxReps = 12;
      restSec = 75;
    }

    return {
      ...ex,
      default_sets: sets,
      default_reps_min: minReps,
      default_reps_max: maxReps,
      default_rest_seconds: restSec,
    };
  });
}

export function getExerciseMetCategory(exercise: MasterExercise): MetCategory {
  if (exercise.met_category) return exercise.met_category;
  return resolveExerciseMetCategory(exercise.name, exercise.target_muscle);
}
