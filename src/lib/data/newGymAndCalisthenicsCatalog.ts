// src/lib/data/newGymAndCalisthenicsCatalog.ts
// SD-QUEST: EXPANDED 20-IN-1 BENCH (BARBELL, EZ-BAR, CABLE PULLEY) & PURE CALISTHENICS CATALOG
// Fully conforms to MasterExercise schema, MetCategory, and Solo Leveling Rank/Level gates.

import type { MasterExercise } from "./exerciseCatalog";

export const NEW_GYM_AND_CALISTHENICS_EXERCISES: MasterExercise[] = [
  // =========================================================================
  // MONDAY: LEGS & LOWER BODY FOUNDATION
  // =========================================================================
  {
    id: "ex-barbell-back-squat",
    name: "Barbell Back Squat",
    split_day: "Monday",
    order_index: 1,
    target_muscle: "Quadriceps & Glutes",
    secondary_muscles: ["Hamstrings", "Core", "Spinal Erectors", "Calves"],
    bench_angle: "Floor / Standing",
    required_equipment: "barbell",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Foundation Barbell Compound",
    target_duration_mins: 9,
    default_sets: 4,
    default_reps_min: 6,
    default_reps_max: 10,
    default_rest_seconds: 120,
    met_category: "squats_deadlifts",
    attribute_yield: { strength: 0.45, vitality: 0.30, endurance: 0.20 },
    instructions: [
      "Position bar across upper traps (high bar) with hands gripping firmly outside shoulders.",
      "Unrack, take two controlled steps back, set feet shoulder-width with toes flared 15°-25°.",
      "Brace core deeply with Valsalva maneuver, break simultaneously at hips and knees.",
      "Descend until hip crease is below parallel, keeping knees driving outward over toes.",
      "Drive aggressively through mid-foot to stand upright, exhaling past the sticking point."
    ],
    form_cues: ["Chest proud", "Knees track over toes", "Spread the floor", "Tight upper back shelf"],
    common_mistakes: ["Knees caving inward (valgus collapse)", "Heels rising off floor", "Good-morning squatting (hips shooting up early)"],
    alternatives: ["Barbell Front Squat", "Goblet Dumbbell Squat", "Bodyweight Squats"],
    demo_steps: [
      { step: 1, title: "The Bar Shelf", description: "Rest bar securely across traps, squeeze shoulder blades together.", coachTip: "Create a muscular shelf." },
      { step: 2, title: "Deep Descent", description: "Inhale, brace belly 360°, drop smoothly between heels to parallel.", coachTip: "Control the tempo." },
      { step: 3, title: "Triple Extension", description: "Drive floor away, lock out hips and knees firmly at top.", coachTip: "Squeeze glutes at top." }
    ]
  },
  {
    id: "ex-barbell-rdl",
    name: "Barbell Romanian Deadlift (RDL)",
    split_day: "Monday",
    order_index: 2,
    target_muscle: "Hamstrings & Glutes",
    secondary_muscles: ["Lower Back", "Forearms", "Lats"],
    bench_angle: "Floor / Standing",
    required_equipment: "barbell",
    unlock_tier: "Initiate",
    unlock_level: 5,
    unlock_criteria: "Initiate Posterior Chain Mastery",
    target_duration_mins: 8,
    default_sets: 4,
    default_reps_min: 8,
    default_reps_max: 12,
    default_rest_seconds: 90,
    met_category: "squats_deadlifts",
    attribute_yield: { strength: 0.40, endurance: 0.25, vitality: 0.20 },
    instructions: [
      "Stand tall holding barbell with double-overhand grip at thigh level.",
      "Soft bend in knees (locked at ~15° throughout the movement).",
      "Hinge at the hips, pushing glutes backward towards the wall as bar slides down shins.",
      "Descend until deep stretch is felt in hamstrings (mid-shin level), keeping spine neutral.",
      "Drive hips forward to return to standing, locking glutes at top."
    ],
    form_cues: ["Push hips to the back wall", "Shaving the shins with the bar", "Spine straight like a ruler"],
    common_mistakes: ["Rounding lower back", "Squatting instead of hinging", "Letting bar drift away from legs"],
    alternatives: ["Dumbbell Romanian Deadlift (RDL)", "Single-Leg Glute Bridge"],
    demo_steps: [
      { step: 1, title: "Hip Hinge Initiation", description: "Unlock knees slightly, send hips straight back.", coachTip: "Keep bar glued to thighs." },
      { step: 2, title: "Hamstring Loading", description: "Lower bar to mid-shin feeling full hamstring stretch.", coachTip: "Spine perfectly locked." },
      { step: 3, title: "Hip Thrust Return", description: "Drive hips forward, locking out standing posture.", coachTip: "Squeeze glutes hard." }
    ]
  },
  {
    id: "ex-barbell-hip-thrust",
    name: "Barbell Hip Thrust (Bench Supported)",
    split_day: "Monday",
    order_index: 3,
    target_muscle: "Glutes",
    secondary_muscles: ["Hamstrings", "Quadriceps", "Core"],
    bench_angle: "Flat",
    required_equipment: "bench_and_barbell",
    unlock_tier: "Initiate",
    unlock_level: 10,
    unlock_criteria: "Initiate Glute Overload",
    target_duration_mins: 8,
    default_sets: 4,
    default_reps_min: 10,
    default_reps_max: 12,
    default_rest_seconds: 90,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.40, vitality: 0.25, endurance: 0.20 },
    instructions: [
      "Sit on floor with upper back against 20-in-1 flat bench, padded barbell across hip crease.",
      "Plant feet shoulder-width apart so shins are vertical at peak extension.",
      "Drive through heels and squeeze glutes to elevate hips until torso is parallel to floor.",
      "Pause 1-2 seconds at peak lockout, keeping chin tucked and ribs down.",
      "Lower hips with control back towards floor."
    ],
    form_cues: ["Vertical shins at top", "Tuck chin like holding an egg", "Full glute lockout"],
    common_mistakes: ["Hyperextending lumbar spine", "Feet placed too far forward or backward", "Failing to hit full extension"],
    alternatives: ["Dumbbell Hip Thrust", "Glute Bridges"],
    demo_steps: [
      { step: 1, title: "Setup", description: "Bench edge just beneath shoulder blades, barbell centered across hips.", coachTip: "Use pad or towel." },
      { step: 2, title: "Drive", description: "Push heels into floor, drive hips ceiling-ward.", coachTip: "Keep eyes looking forward." },
      { step: 3, title: "Peak Hold", description: "Squeeze glutes maximally for a 2-second hold at top.", coachTip: "Tabletop torso." }
    ]
  },
  {
    id: "ex-bodyweight-squats",
    name: "Bodyweight Air Squats",
    split_day: "Monday",
    order_index: 4,
    target_muscle: "Quadriceps & Glutes",
    secondary_muscles: ["Calves", "Core"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Awakening Calisthenics Baseline",
    target_duration_mins: 6,
    default_sets: 4,
    default_reps_min: 15,
    default_reps_max: 25,
    default_rest_seconds: 60,
    met_category: "general_bodyweight",
    attribute_yield: { endurance: 0.35, vitality: 0.30, strength: 0.20 },
    instructions: [
      "Stand with feet shoulder-width apart, arms extended forward for counter-balance.",
      "Inhale, push hips back and bend knees smoothly to descend into deep squat.",
      "Sink below parallel while keeping chest upright and heels firmly rooted.",
      "Exhale and drive through heels to stand upright, squeezing glutes."
    ],
    form_cues: ["Tall chest", "Weight centered on midfoot", "Knees track over toes"],
    common_mistakes: ["Partial depth squats", "Heels lifting off ground", "Excessive forward torso lean"],
    alternatives: ["Jump Squats", "Goblet Dumbbell Squat"],
    demo_steps: [
      { step: 1, title: "Descent", description: "Hips drop between heels with full control.", coachTip: "Keep chest proud." },
      { step: 2, title: "The Hole", description: "Brief pause at deepest comfortable depth below parallel.", coachTip: "Stay braced." },
      { step: 3, title: "Ascent", description: "Push floor away and lock out hips.", coachTip: "Breathe out at top." }
    ]
  },
  {
    id: "ex-jump-squats",
    name: "Plyometric Jump Squats",
    split_day: "Monday",
    order_index: 5,
    target_muscle: "Quadriceps & Calves",
    secondary_muscles: ["Glutes", "Hamstrings", "Cardiovascular"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 4,
    unlock_criteria: "Recruit Kinetic Power",
    target_duration_mins: 6,
    default_sets: 4,
    default_reps_min: 12,
    default_reps_max: 18,
    default_rest_seconds: 75,
    met_category: "high_intensity_bodyweight",
    attribute_yield: { strength: 0.35, agility: 0.30, endurance: 0.25 },
    instructions: [
      "Drop into a half-to-parallel bodyweight squat.",
      "Explode vertically off the ground as high as possible, reaching arms upward.",
      "Land softly on balls of feet and immediately absorb impact back into squat position."
    ],
    form_cues: ["Explode from floor", "Soft silent landing", "Fluid continuous rhythm"],
    common_mistakes: ["Stiff-legged landing", "Landing on heels", "Collapsing inward on landing"],
    alternatives: ["Bodyweight Air Squats", "Skater Jumps"],
    demo_steps: [
      { step: 1, title: "Load", description: "Hinge and drop into power quarter-squat.", coachTip: "Coil energy." },
      { step: 2, title: "Launch", description: "Explode skyward through toes.", coachTip: "Reach tall." },
      { step: 3, title: "Catch", description: "Decelerate softly into the next squat cycle.", coachTip: "Absorb like a spring." }
    ]
  },
  {
    id: "ex-cossack-squats",
    name: "Side Lunges (Cossack Squats)",
    split_day: "Monday",
    order_index: 6,
    target_muscle: "Adductors, Quads & Glutes",
    secondary_muscles: ["Hamstrings", "Ankles", "Core"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Initiate",
    unlock_level: 6,
    unlock_criteria: "Initiate Frontal Plane Mastery",
    target_duration_mins: 7,
    default_sets: 3,
    default_reps_min: 8,
    default_reps_max: 12,
    default_rest_seconds: 75,
    met_category: "general_bodyweight",
    attribute_yield: { agility: 0.40, endurance: 0.25, vitality: 0.20 },
    instructions: [
      "Take an extra wide stance, toes pointed slightly outward.",
      "Shift bodyweight over to right leg, bending right knee and sitting deep into right hip.",
      "Keep left leg completely straight with left toes rotating up towards ceiling.",
      "Sink as low as mobility permits while keeping right heel glued to floor.",
      "Drive out of the hole back to center, then repeat on opposite side."
    ],
    form_cues: ["Working heel stays down", "Straight leg toes to sky", "Torso stays tall"],
    common_mistakes: ["Working heel lifting off floor", "Rounding upper back", "Shallow depth"],
    alternatives: ["Dumbbell Lateral Lunge", "Forward Walking Lunges"],
    demo_steps: [
      { step: 1, title: "Lateral Shift", description: "Slide hips to the side, sinking into single leg depth.", coachTip: "Keep opposite leg long." },
      { step: 2, title: "Deep Stretch", description: "Hold bottom position briefly with chest upright.", coachTip: "Feel groin stretch." },
      { step: 3, title: "Power Up", description: "Press through working midfoot to return to center.", coachTip: "Control the transition." }
    ]
  },
  {
    id: "ex-isometric-wall-sit",
    name: "Isometric Wall Sit",
    split_day: "Monday",
    order_index: 7,
    target_muscle: "Quadriceps",
    secondary_muscles: ["Glutes", "Calves", "Mental Stamina"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Awakening Foundation Burnout",
    target_duration_mins: 5,
    default_sets: 3,
    default_reps_min: 30,
    default_reps_max: 60,
    default_rest_seconds: 60,
    met_category: "general_bodyweight",
    attribute_yield: { endurance: 0.45, mentality: 0.30, vitality: 0.15 },
    instructions: [
      "Stand with back flat against a wall, slide down until thighs are parallel to floor (90° knee angle).",
      "Knees directly above ankles, arms resting at sides or across chest (never on thighs).",
      "Press lower back firmly into wall, breathe rhythmically, and hold for prescribed seconds."
    ],
    form_cues: ["90° bend at hips and knees", "Hands off thighs", "Breathe through the quad fire"],
    common_mistakes: ["Resting hands on knees to cheat load", "Thighs higher than parallel", "Holding breath"],
    alternatives: ["Bodyweight Air Squats", "Single-Leg Calf Raises"],
    demo_steps: [
      { step: 1, title: "Slide Down", description: "Back flat against wall, slide to 90 degrees.", coachTip: "Check knee angle." },
      { step: 2, title: "Lock Position", description: "Press flat spine into wall, engage deep core.", coachTip: "Hands off legs." },
      { step: 3, title: "Endure", description: "Breathe steadily through the burning fatigue.", coachTip: "Mentality builds here." }
    ]
  },
  {
    id: "ex-pistol-squat",
    name: "Pistol Squats (Single-Leg Mastery)",
    split_day: "Monday",
    order_index: 8,
    target_muscle: "Quadriceps & Glutes",
    secondary_muscles: ["Hip Flexors", "Calves", "Core", "Ankle Mobility"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Warrior",
    unlock_level: 20,
    unlock_criteria: "Warrior Calisthenics Pinnacle",
    target_duration_mins: 8,
    default_sets: 3,
    default_reps_min: 5,
    default_reps_max: 10,
    default_rest_seconds: 90,
    met_category: "vigorous_weightlifting",
    attribute_yield: { strength: 0.45, agility: 0.40, endurance: 0.15 },
    instructions: [
      "Balance on one leg, extending non-working leg straight out in front of you.",
      "Inhale, hinge hip back and descend into deep single-leg squat with control.",
      "Reach bottom position without let non-working foot touch ground.",
      "Drive aggressively through working heel to rise to standing lockout."
    ],
    form_cues: ["Reach arms forward for counter-balance", "Working heel stays glued", "Non-working leg parallel to floor"],
    common_mistakes: ["Heel lifting off floor", "Crashing down into bottom", "Non-working leg dragging on ground"],
    alternatives: ["Bulgarian Split Squat", "Static Split Squat"],
    demo_steps: [
      { step: 1, title: "Unilateral Balance", description: "Extend one leg forward, stabilize on standing foot.", coachTip: "Lock core." },
      { step: 2, title: "Descent to Hole", description: "Smoothly drop down into full single-leg depth.", coachTip: "Stay tight." },
      { step: 3, title: "Full Lockout", description: "Drive up with pure leg power to standing.", coachTip: "Warrior feat cleared." }
    ]
  },

  // =========================================================================
  // TUESDAY: CHEST HYPERTROPHY & PECTORAL POWER
  // =========================================================================
  {
    id: "ex-barbell-bench-press",
    name: "Flat Barbell Bench Press",
    split_day: "Tuesday",
    order_index: 1,
    target_muscle: "Chest (Mid & Lower)",
    secondary_muscles: ["Anterior Deltoids", "Triceps Brachii", "Lats"],
    bench_angle: "Flat",
    required_equipment: "bench_and_barbell",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Awakening Chest Foundation",
    target_duration_mins: 9,
    default_sets: 4,
    default_reps_min: 6,
    default_reps_max: 10,
    default_rest_seconds: 120,
    met_category: "vigorous_weightlifting",
    attribute_yield: { strength: 0.45, discipline: 0.25, vitality: 0.15 },
    instructions: [
      "Lie on 20-in-1 flat bench with eyes directly beneath the racked barbell.",
      "Plant feet flat on floor with aggressive leg drive, retract scapulae firmly into pad.",
      "Grip bar with hands slightly wider than shoulder-width, thumbs wrapped completely.",
      "Unrack with straight arms, stabilize over upper chest, inhale deep into belly.",
      "Lower bar under control until it lightly touches mid-chest (nipple line), elbows at 45°-60°.",
      "Press bar forcefully upward along slight backward arc back over shoulders."
    ],
    form_cues: ["Retract and depress shoulder blades", "Tuck elbows 45°", "Drive legs into ground", "Bar touches chest lightly"],
    common_mistakes: ["Bouncing bar off sternum", "Flaring elbows 90° (rotator cuff hazard)", "Buttocks lifting off bench"],
    alternatives: ["Flat Dumbbell Bench Press", "Standard Strict Push-Up"],
    demo_steps: [
      { step: 1, title: "Arch & Scapular Lock", description: "Retract shoulder blades, establish firm arch and leg drive.", coachTip: "Solid foundation." },
      { step: 2, title: "Controlled Touch", description: "Lower bar smoothly to lower-mid sternum.", coachTip: "Elbows tucked 45 degrees." },
      { step: 3, title: "Concentric Press", description: "Drive bar forcefully back to locked out position over eyes.", coachTip: "Exhale on press." }
    ]
  },
  {
    id: "ex-incline-barbell-press",
    name: "Incline Barbell Bench Press (30°)",
    split_day: "Tuesday",
    order_index: 2,
    target_muscle: "Upper Chest (Clavicular Head)",
    secondary_muscles: ["Anterior Deltoids", "Triceps Brachii"],
    bench_angle: "Incline 30°",
    required_equipment: "bench_and_barbell",
    unlock_tier: "Initiate",
    unlock_level: 5,
    unlock_criteria: "Initiate Upper Chest Power",
    target_duration_mins: 8,
    default_sets: 4,
    default_reps_min: 8,
    default_reps_max: 12,
    default_rest_seconds: 90,
    met_category: "vigorous_weightlifting",
    attribute_yield: { strength: 0.40, discipline: 0.25, vitality: 0.15 },
    instructions: [
      "Set 20-in-1 bench to 30° incline. Lie back with shoulder blades pinned to pad.",
      "Grip barbell with hands slightly wider than shoulder width.",
      "Lower bar slowly to touch the upper chest (collarbone to upper sternum).",
      "Drive bar upward and slightly back until arms lock out over upper chest."
    ],
    form_cues: ["30° incline prevents deltoid takeover", "Touch upper chest", "Tuck elbows 45°"],
    common_mistakes: ["Using too steep an angle (turns into shoulder press)", "Bouncing bar", "Flaring elbows"],
    alternatives: ["Incline Dumbbell Bench Press (30°)", "Decline Push-Up (Feet on Bench)"],
    demo_steps: [
      { step: 1, title: "Incline Setup", description: "Lie on 30 degree incline, feet planted, grip bar.", coachTip: "Keep shoulder blades pinned." },
      { step: 2, title: "Upper Chest Touch", description: "Lower bar to clavicle area with elbows tucked.", coachTip: "Feel upper chest stretch." },
      { step: 3, title: "Drive", description: "Press up and lock out over shoulders.", coachTip: "Squeeze top chest." }
    ]
  },
  {
    id: "ex-cable-chest-fly",
    name: "Standing Cable Chest Fly (Pulley)",
    split_day: "Tuesday",
    order_index: 3,
    target_muscle: "Chest (Mid & Sternal)",
    secondary_muscles: ["Anterior Deltoids", "Biceps Short Head"],
    bench_angle: "Floor / Standing",
    required_equipment: "cable_pulley",
    unlock_tier: "Initiate",
    unlock_level: 8,
    unlock_criteria: "Initiate Cable Tension Protocol",
    target_duration_mins: 7,
    default_sets: 3,
    default_reps_min: 10,
    default_reps_max: 15,
    default_rest_seconds: 75,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.30, discipline: 0.25, agility: 0.15 },
    instructions: [
      "Attach handles to cable pulleys. Step forward into staggered stance with slight forward lean.",
      "Arms flared out with slight elbow bend (hugging a giant tree position).",
      "Squeeze pectorals to bring handles together in front of sternum in wide arcing motion.",
      "Pause 1 second at peak contraction, crossing hands slightly if comfortable.",
      "Return slowly to deep chest stretch position without letting weights crash."
    ],
    form_cues: ["Hug a big tree", "Maintain locked elbow bend throughout", "Deep peak contraction squeeze"],
    common_mistakes: ["Bending and straightening elbows (turning into press)", "Using excessive momentum", "Letting shoulders roll forward"],
    alternatives: ["Flat Dumbbell Fly", "Wide-Grip Push-Ups"],
    demo_steps: [
      { step: 1, title: "The Arc", description: "Bring handles forward and together in circular hugging sweep.", coachTip: "Pecs do the work." },
      { step: 2, title: "Contraction", description: "Squeeze pecs hard together in front of chest for 1 second.", coachTip: "Maximum tension." },
      { step: 3, title: "Eccentric Stretch", description: "Open arms slowly, feeling intense pectoral stretch.", coachTip: "Control the stack." }
    ]
  },
  {
    id: "ex-chest-dips",
    name: "Chest Dips (Parallel Bars / Sturdy Chairs)",
    split_day: "Tuesday",
    order_index: 4,
    target_muscle: "Lower Chest & Triceps",
    secondary_muscles: ["Anterior Deltoids", "Core"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Initiate",
    unlock_level: 7,
    unlock_criteria: "Initiate Bodyweight Pressing Mastery",
    target_duration_mins: 7,
    default_sets: 4,
    default_reps_min: 8,
    default_reps_max: 15,
    default_rest_seconds: 90,
    met_category: "high_intensity_bodyweight",
    attribute_yield: { strength: 0.45, endurance: 0.25, discipline: 0.15 },
    instructions: [
      "Mount parallel bars or sturdy stable supports with arms locked out.",
      "Lean torso forward ~30° and cross ankles, pulling knees slightly up.",
      "Lower body by bending elbows, allowing elbows to flare slightly outward to load pecs.",
      "Descend until shoulders are slightly below elbows (~90° bend) feeling deep chest stretch.",
      "Press through palms to lockout, squeezing chest and triceps."
    ],
    form_cues: ["Lean forward 30° for chest focus", "Control the descent", "Lock out at top"],
    common_mistakes: ["Staying completely upright (shifts load to triceps only)", "Shallow half reps", "Shrugging shoulders into ears"],
    alternatives: ["Decline Dumbbell Bench Press", "Decline Push-Ups"],
    demo_steps: [
      { step: 1, title: "Forward Lean", description: "Mount bars, hinge forward 30 degrees to bias lower chest.", coachTip: "Eyes down and forward." },
      { step: 2, title: "Controlled Dip", description: "Lower until upper arms are parallel to floor.", coachTip: "Feel deep pec stretch." },
      { step: 3, title: "Power Up", description: "Drive hands through bars to full extension.", coachTip: "Chest squeeze." }
    ]
  },
  {
    id: "ex-archer-pushups",
    name: "Archer Push-Ups",
    split_day: "Tuesday",
    order_index: 5,
    target_muscle: "Chest & Triceps",
    secondary_muscles: ["Shoulders", "Core", "Scapular Stabilizers"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Warrior",
    unlock_level: 15,
    unlock_criteria: "Warrior Asymmetric Mastery",
    target_duration_mins: 7,
    default_sets: 3,
    default_reps_min: 6,
    default_reps_max: 10,
    default_rest_seconds: 90,
    met_category: "vigorous_weightlifting",
    attribute_yield: { strength: 0.45, agility: 0.25, endurance: 0.15 },
    instructions: [
      "Assume a wide push-up position, hands placed double shoulder-width apart.",
      "Lower body down towards your right hand, bending right elbow while keeping left arm completely straight.",
      "Torso slides across to the working right side, loading ~85% of your weight on that pec.",
      "Push up through right arm and slide back to center, then repeat to left side."
    ],
    form_cues: ["Assisting arm stays bone straight", "Chest descends to working wrist", "Glutes and core locked"],
    common_mistakes: ["Bending the straight assisting arm", "Sagging hips", "Rushing transitions"],
    alternatives: ["Wide-Grip Push-Ups", "Standard Strict Push-Up"],
    demo_steps: [
      { step: 1, title: "Wide Base", description: "Take double-wide hand stance with fingers angled slightly out.", coachTip: "Solid plank." },
      { step: 2, title: "Draw the Bow", description: "Lower chest onto right hand as left arm extends fully.", coachTip: "Pure unilateral load." },
      { step: 3, title: "Press & Switch", description: "Press up and glide to opposite arm.", coachTip: "Smooth archer flow." }
    ]
  },
  {
    id: "ex-hindu-pushups",
    name: "Hindu Push-Ups (Dive Bombers)",
    split_day: "Tuesday",
    order_index: 6,
    target_muscle: "Chest, Shoulders & Triceps",
    secondary_muscles: ["Lower Back", "Hamstrings", "Core"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Initiate",
    unlock_level: 8,
    unlock_criteria: "Initiate Full Body Wave",
    target_duration_mins: 6,
    default_sets: 3,
    default_reps_min: 10,
    default_reps_max: 16,
    default_rest_seconds: 75,
    met_category: "high_intensity_bodyweight",
    attribute_yield: { strength: 0.40, agility: 0.30, endurance: 0.20 },
    instructions: [
      "Begin in downward dog position (hips high, arms and legs straight, forming inverted V).",
      "Swoop downward by bending elbows, brushing chest and nose closely along the floor.",
      "Arch upward into cobra / upward dog position with arms locked and chest proud.",
      "Reverse the movement or push hips back to inverted V position and repeat."
    ],
    form_cues: ["Swoop under a low fence", "Chest skims floor", "Upward chest expansion"],
    common_mistakes: ["Hips dropping too early", "Flaring elbows wildly", "Failing to arch into full thoracic extension"],
    alternatives: ["Pike Push-Up", "Standard Strict Push-Up"],
    demo_steps: [
      { step: 1, title: "Inverted V", description: "Hips high in pike/downward dog.", coachTip: "Length through spine." },
      { step: 2, title: "The Dive", description: "Bend elbows, glide nose and chest millimeter from floor.", coachTip: "Dive bomber motion." },
      { step: 3, title: "Cobra Lockout", description: "Press up, arch back, look upward proudly.", coachTip: "Squeeze glutes to protect spine." }
    ]
  },

  // =========================================================================
  // WEDNESDAY: BACK WIDTH & THICKNESS
  // =========================================================================
  {
    id: "ex-barbell-bent-over-row",
    name: "Barbell Bent-Over Row",
    split_day: "Wednesday",
    order_index: 1,
    target_muscle: "Lats, Rhomboids & Mid-Back",
    secondary_muscles: ["Biceps", "Posterior Deltoids", "Spinal Erectors"],
    bench_angle: "Floor / Standing",
    required_equipment: "barbell",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Awakening Back Compound",
    target_duration_mins: 8,
    default_sets: 4,
    default_reps_min: 8,
    default_reps_max: 12,
    default_rest_seconds: 90,
    met_category: "vigorous_weightlifting",
    attribute_yield: { strength: 0.45, endurance: 0.25, discipline: 0.20 },
    instructions: [
      "Stand holding barbell with overhand grip slightly wider than shoulder width.",
      "Hinge hips backward until torso is at ~45° angle to floor, spine locked neutral.",
      "Pull bar powerfully toward lower ribcage/navel, driving elbows back toward ceiling.",
      "Squeeze shoulder blades together firmly at peak contraction for 1 second.",
      "Lower bar under control until arms are fully extended without rounding upper back."
    ],
    form_cues: ["Pull with elbows", "Squeeze shoulder blades in back pocket", "Spine rigid at 45°"],
    common_mistakes: ["Using momentum and standing upright", "Rounding lower spine", "Pulling to neck instead of belly"],
    alternatives: ["Bent-Over Dual Dumbbell Row", "Inverted Rows (Bodyweight Rows)"],
    demo_steps: [
      { step: 1, title: "Hinged Base", description: "Hips back at 45 degrees, bar hanging below shoulders.", coachTip: "Tight core and hamstrings." },
      { step: 2, title: "Elbow Drive", description: "Pull bar straight to belly button, driving elbows back.", coachTip: "Crush a walnut between scapulae." },
      { step: 3, title: "Controlled Lower", description: "Lower with full eccentric tension to hang.", coachTip: "Do not lose spine angle." }
    ]
  },
  {
    id: "ex-cable-lat-pulldown-wide",
    name: "Cable Lat Pulldown (Back Pull Chain)",
    split_day: "Wednesday",
    order_index: 2,
    target_muscle: "Latissimus Dorsi (Width)",
    secondary_muscles: ["Biceps", "Rhomboids", "Lower Traps"],
    bench_angle: "Floor / Standing",
    required_equipment: "cable_pulley",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Awakening Cable Attachment",
    target_duration_mins: 8,
    default_sets: 4,
    default_reps_min: 8,
    default_reps_max: 12,
    default_rest_seconds: 90,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.35, endurance: 0.25, discipline: 0.20 },
    instructions: [
      "Attach wide bar to high pulley on 20-in-1 bench pull chain.",
      "Sit with thighs secured, gripping bar wider than shoulder-width with overhand grip.",
      "Lean back slightly (~10°-15°), pull bar down smoothly toward upper sternum.",
      "Lead with elbows driving down and back, squeezing lats maximally at chest contact.",
      "Release slowly under full control to full overhead stretch."
    ],
    form_cues: ["Drive elbows into back pockets", "Chest to bar", "Do not swing torso wildly"],
    common_mistakes: ["Pulling behind neck (cervical spine danger)", "Swinging backwards to heave weight", "Short-arming the stretch"],
    alternatives: ["Strict Deadhang Pull-Ups", "One-Arm Dumbbell Row"],
    demo_steps: [
      { step: 1, title: "Grip & Lean", description: "Grip wide, slight 15 degree lean, chest lifted.", coachTip: "Engage lats from dead hang." },
      { step: 2, title: "Drive Down", description: "Pull bar straight to collarbone, elbows driving down.", coachTip: "Squeeze lats hard." },
      { step: 3, title: "Full Return", description: "Control stack up to complete overhead stretch.", coachTip: "Feel lat elongation." }
    ]
  },
  {
    id: "ex-pull-ups-calisthenics",
    name: "Strict Deadhang Pull-Ups",
    split_day: "Wednesday",
    order_index: 3,
    target_muscle: "Latissimus Dorsi & Upper Back",
    secondary_muscles: ["Biceps", "Forearms", "Core"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Initiate",
    unlock_level: 5,
    unlock_criteria: "Initiate Calisthenics Ascendance",
    target_duration_mins: 8,
    default_sets: 4,
    default_reps_min: 6,
    default_reps_max: 12,
    default_rest_seconds: 90,
    met_category: "high_intensity_bodyweight",
    attribute_yield: { strength: 0.45, endurance: 0.25, discipline: 0.20 },
    instructions: [
      "Grip pull-up bar with overhand grip slightly wider than shoulder width.",
      "Hang in full deadhang, depress scapulae down away from ears to initiate.",
      "Pull chest toward bar, driving elbows down into ribs until chin clears bar cleanly.",
      "Lower under control back to full deadhang extension before starting next rep."
    ],
    form_cues: ["Full deadhang at bottom", "Chin completely over bar", "Zero swinging or kipping"],
    common_mistakes: ["Kipping and knee swinging", "Half reps failing to lock out elbows", "Craning neck forward to cheat chin over bar"],
    alternatives: ["Inverted Rows (Bodyweight Rows)", "Cable Lat Pulldown (Back Pull Chain)"],
    demo_steps: [
      { step: 1, title: "Dead Hang", description: "Full extension hang, pack shoulders down.", coachTip: "Active hang initiation." },
      { step: 2, title: "Chest to Bar", description: "Drive elbows down, pull chin clearly over bar.", coachTip: "Zero momentum." },
      { step: 3, title: "Controlled Descent", description: "Lower with 2-second eccentric cadence.", coachTip: "Control the bottom." }
    ]
  },
  {
    id: "ex-inverted-rows-bodyweight",
    name: "Inverted Rows (Bodyweight Rows)",
    split_day: "Wednesday",
    order_index: 4,
    target_muscle: "Mid-Back & Rhomboids",
    secondary_muscles: ["Lats", "Biceps", "Core", "Posterior Delts"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Awakening Horizontal Pull",
    target_duration_mins: 7,
    default_sets: 4,
    default_reps_min: 8,
    default_reps_max: 15,
    default_rest_seconds: 75,
    met_category: "general_bodyweight",
    attribute_yield: { strength: 0.35, endurance: 0.30, discipline: 0.20 },
    instructions: [
      "Lie beneath a sturdy table, low bar, or doorframe setup with straight arms gripping edge.",
      "Body in straight plank from head to heels, heels resting on floor.",
      "Pull chest up to touch bar/edge, squeezing shoulder blades together aggressively.",
      "Lower body with control back to full arm extension."
    ],
    form_cues: ["Body rigid like a surfboard", "Chest touches bar/edge", "Elbows pull back"],
    common_mistakes: ["Hips sagging down", "Poking chin forward", "Failing to retract scapulae"],
    alternatives: ["Bent-Over Dual Dumbbell Row", "Cable Lat Pulldown (Back Pull Chain)"],
    demo_steps: [
      { step: 1, title: "Plank Hang", description: "Grip edge, heels on floor, body aligned.", coachTip: "Tight glutes and abs." },
      { step: 2, title: "Chest Pull", description: "Pull sternum to edge, pinching shoulder blades.", coachTip: "Full midback pinch." },
      { step: 3, title: "Lower", description: "Control descent to full arm extension.", coachTip: "Smooth cadence." }
    ]
  },
  {
    id: "ex-superman-holds",
    name: "Superman Holds & Extensions",
    split_day: "Wednesday",
    order_index: 5,
    target_muscle: "Spinal Erectors & Glutes",
    secondary_muscles: ["Hamstrings", "Rear Delts", "Upper Back"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Awakening Spine Armor",
    target_duration_mins: 5,
    default_sets: 3,
    default_reps_min: 12,
    default_reps_max: 20,
    default_rest_seconds: 60,
    met_category: "general_bodyweight",
    attribute_yield: { endurance: 0.40, vitality: 0.30, discipline: 0.15 },
    instructions: [
      "Lie face down on floor with arms extended straight overhead and legs straight.",
      "Simultaneously lift chest, arms, and thighs off floor by engaging glutes and spinal muscles.",
      "Hold peak arched position for 2-3 seconds, breathing steadily.",
      "Lower with control back to floor and repeat."
    ],
    form_cues: ["Squeeze glutes to lift legs", "Lift chest by contracting midback", "Neck neutral (look at floor)"],
    common_mistakes: ["Craning neck backward", "Bending knees excessively", "Jerking movements"],
    alternatives: ["Bird-Dog", "Reverse Snow Angels"],
    demo_steps: [
      { step: 1, title: "Prone Setup", description: "Lie flat on belly, arms reaching forward.", coachTip: "Elongate spine." },
      { step: 2, title: "Ascend", description: "Lift limbs off floor like flying.", coachTip: "Feel whole posterior chain fire." },
      { step: 3, title: "Peak Hold", description: "Pause for 2-3 seconds at apex before descending.", coachTip: "Breathe through it." }
    ]
  },

  // =========================================================================
  // THURSDAY & FRIDAY: SHOULDERS & DELTOIDS
  // =========================================================================
  {
    id: "ex-barbell-overhead-press",
    name: "Standing Barbell Overhead Military Press",
    split_day: "Thursday",
    order_index: 1,
    target_muscle: "Anterior & Lateral Deltoids",
    secondary_muscles: ["Triceps", "Upper Chest", "Core", "Traps"],
    bench_angle: "Floor / Standing",
    required_equipment: "barbell",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Awakening Overhead Power",
    target_duration_mins: 8,
    default_sets: 4,
    default_reps_min: 6,
    default_reps_max: 10,
    default_rest_seconds: 120,
    met_category: "vigorous_weightlifting",
    attribute_yield: { strength: 0.45, discipline: 0.25, agility: 0.15 },
    instructions: [
      "Stand with feet shoulder-width, bar resting across clavicle / front delts in front rack position.",
      "Squeeze glutes and brace core tightly to create rigid vertical pillar.",
      "Pull chin back slightly to clear bar path, press bar straight up overhead.",
      "Once bar clears forehead, push head back through arms and lock bar directly over center of gravity.",
      "Lower under control back to clavicle."
    ],
    form_cues: ["Glutes locked like rock", "Vertical bar path", "Lock out directly over midfoot"],
    common_mistakes: ["Excessive lumbar arching (leaning back too far)", "Pressing bar forward around face", "Soft knees"],
    alternatives: ["Standing Overhead Dumbbell Press", "Pike Push-Up (Bodyweight Vertical Press)"],
    demo_steps: [
      { step: 1, title: "Front Rack", description: "Rest bar on clavicle, forearms vertical, glutes clenched.", coachTip: "Rigid pillar base." },
      { step: 2, title: "Press Path", description: "Drive bar up in straight line, clear chin.", coachTip: "Push head through at top." },
      { step: 3, title: "Overhead Lock", description: "Bar balanced directly over spine and midfoot.", coachTip: "Active trap shrug at top." }
    ]
  },
  {
    id: "ex-ez-bar-upright-row",
    name: "EZ-Bar Upright Row (Curly Rod)",
    split_day: "Thursday",
    order_index: 2,
    target_muscle: "Lateral Deltoids & Upper Traps",
    secondary_muscles: ["Biceps", "Brachialis", "Forearms"],
    bench_angle: "Floor / Standing",
    required_equipment: "ez_bar",
    unlock_tier: "Initiate",
    unlock_level: 5,
    unlock_criteria: "Initiate Cambered Rod Protocol",
    target_duration_mins: 7,
    default_sets: 4,
    default_reps_min: 10,
    default_reps_max: 12,
    default_rest_seconds: 75,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.35, agility: 0.20, discipline: 0.15 },
    instructions: [
      "Grip cambered EZ-bar with grip shoulder-width apart (camber protects wrist angles).",
      "Stand upright with core braced, arms hanging straight down.",
      "Pull bar upward along torso, leading with elbows lifting high and flared outward.",
      "Raise bar until elbows reach shoulder height (do not pull excessively high to protect rotator cuff).",
      "Lower slowly back to start."
    ],
    form_cues: ["Lead with elbows", "Cambered bar protects wrists", "Stop when elbows hit shoulder level"],
    common_mistakes: ["Narrow grip with wrists touching (rotator cuff impingement hazard)", "Pulling above neck", "Swinging body"],
    alternatives: ["Controlled Wide-Grip Dumbbell Upright Row", "Standing Dumbbell Lateral Raise"],
    demo_steps: [
      { step: 1, title: "Grip & Stance", description: "Hold EZ-bar on inner curves, shoulder-width apart.", coachTip: "Spine straight." },
      { step: 2, title: "Elbow Lift", description: "Pull bar up close to chest, leading with high elbows.", coachTip: "Feel side delts fire." },
      { step: 3, title: "Controlled Lower", description: "Lower with 2-second negative back to thighs.", coachTip: "Stay strictly upright." }
    ]
  },
  {
    id: "ex-cable-face-pull",
    name: "Cable Face Pull (Cable Pulley)",
    split_day: "Friday",
    order_index: 1,
    target_muscle: "Rear Deltoids & Rotator Cuff",
    secondary_muscles: ["Rhomboids", "Middle Traps", "Infraspinatus"],
    bench_angle: "Floor / Standing",
    required_equipment: "cable_pulley",
    unlock_tier: "Recruit",
    unlock_level: 3,
    unlock_criteria: "Recruit Shoulder Armor",
    target_duration_mins: 7,
    default_sets: 4,
    default_reps_min: 12,
    default_reps_max: 16,
    default_rest_seconds: 60,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.25, endurance: 0.30, agility: 0.20 },
    instructions: [
      "Set cable pulley to eye level with rope handle attachment.",
      "Grip ends of rope with thumbs pointing backward toward yourself.",
      "Step back into staggered stance, pull rope straight toward eye bridge / forehead.",
      "As rope approaches face, actively rotate hands backward into double bicep flex position.",
      "Squeeze rear delts and external rotators for 1 full second, then slowly release."
    ],
    form_cues: ["Thumbs point back", "Pull to eyes and externally rotate", "Elbows high and wide"],
    common_mistakes: ["Pulling down to chest like a row", "Using too much weight and leaning back", "Failing to externally rotate hands"],
    alternatives: ["Chest-Supported Rear Delt Fly (45°)", "Prone Bench W-Raise (Rotator Cuff Armor)"],
    demo_steps: [
      { step: 1, title: "Stance & Grip", description: "Thumbs backward, staggered base, eyes on pulley.", coachTip: "Light to moderate load." },
      { step: 2, title: "Face Pull & Rotate", description: "Pull rope to bridge of nose, pulling hands apart and back.", coachTip: "Elbows flared wide." },
      { step: 3, title: "Rotator Squeeze", description: "Hold peak rear delt contraction 1 second.", coachTip: "Bulletproof shoulders." }
    ]
  },
  {
    id: "ex-handstand-wall-hold",
    name: "Wall Handstand Hold",
    split_day: "Thursday",
    order_index: 3,
    target_muscle: "Anterior Deltoids & Shoulders",
    secondary_muscles: ["Trapezius", "Triceps", "Core", "Wrist Flexors"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Initiate",
    unlock_level: 10,
    unlock_criteria: "Initiate Inversion Mastery",
    target_duration_mins: 6,
    default_sets: 3,
    default_reps_min: 20,
    default_reps_max: 45,
    default_rest_seconds: 90,
    met_category: "high_intensity_bodyweight",
    attribute_yield: { strength: 0.40, agility: 0.35, mentality: 0.20 },
    instructions: [
      "Place hands on floor 6 inches from sturdy wall, shoulder-width apart.",
      "Kick up smoothly into handstand with heels resting gently against wall.",
      "Push aggressively through palms, elevating shoulder girdle toward ceiling.",
      "Engage core and glutes to avoid excessive banana-back arching, hold for prescribed time."
    ],
    form_cues: ["Push the floor away", "Lock elbows bone-to-bone", "Tight hollow body core"],
    common_mistakes: ["Bent elbows", "Excessive arch in lower back", "Holding breath"],
    alternatives: ["Pike Push-Up (Bodyweight Vertical Press)", "Standing Barbell Overhead Military Press"],
    demo_steps: [
      { step: 1, title: "Kickup", description: "Hands planted firmly, kick heels up to touch wall.", coachTip: "Spread fingers wide." },
      { step: 2, title: "Lockout", description: "Push ground away, lock shoulders and elbows fully.", coachTip: "Active shoulder elevation." },
      { step: 3, title: "Breathe & Hold", description: "Hold vertical inverted posture steadily.", coachTip: "Stay tight." }
    ]
  },

  // =========================================================================
  // SATURDAY: ARMS MASTERY (BICEPS & TRICEPS)
  // =========================================================================
  {
    id: "ex-ez-bar-bicep-curl",
    name: "EZ-Bar Standing Bicep Curl (Curly Rod)",
    split_day: "Saturday",
    order_index: 1,
    target_muscle: "Biceps Brachii",
    secondary_muscles: ["Brachialis", "Forearms"],
    bench_angle: "Floor / Standing",
    required_equipment: "ez_bar",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Awakening Arm Mass",
    target_duration_mins: 7,
    default_sets: 4,
    default_reps_min: 8,
    default_reps_max: 12,
    default_rest_seconds: 75,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.35, discipline: 0.25, mentality: 0.15 },
    instructions: [
      "Stand holding EZ-bar with supinated grip on inner cambered ridges.",
      "Keep elbows pinned firmly against side ribs, chest tall.",
      "Curl bar upward in smooth arc toward upper chest, squeezing biceps maximally at apex.",
      "Pause 1 second at top, lower with strict 3-second negative to full extension."
    ],
    form_cues: ["Elbows stay glued to sides", "Cambered bar relieves wrist stress", "Full stretch at bottom"],
    common_mistakes: ["Swinging torso backward", "Elbows drifting forward during curl", "Dropping weight without control"],
    alternatives: ["Standing Dumbbell Bicep Curl", "Cable Standing Bicep Curl"],
    demo_steps: [
      { step: 1, title: "Grip & Pin", description: "Hold inner curves, pin elbows tight against ribs.", coachTip: "No shoulder swing." },
      { step: 2, title: "Curling Arc", description: "Curl bar upward squeezing biceps fiercely.", coachTip: "Stop before elbows flare." },
      { step: 3, title: "Slow Negative", description: "Lower with 3-second cadence to complete stretch.", coachTip: "Eccentric tears build mass." }
    ]
  },
  {
    id: "ex-ez-bar-skull-crusher",
    name: "EZ-Bar Skull Crushers (Lying Triceps Extension)",
    split_day: "Saturday",
    order_index: 2,
    target_muscle: "Triceps Brachii (Long & Medial Heads)",
    secondary_muscles: ["Forearms"],
    bench_angle: "Flat",
    required_equipment: "bench_and_barbell",
    unlock_tier: "Recruit",
    unlock_level: 3,
    unlock_criteria: "Recruit Triceps Horseshoe",
    target_duration_mins: 7,
    default_sets: 4,
    default_reps_min: 8,
    default_reps_max: 12,
    default_rest_seconds: 75,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.35, discipline: 0.25, mentality: 0.15 },
    instructions: [
      "Lie on 20-in-1 flat bench holding EZ-bar over chest with overhand grip on inner curves.",
      "Tilt upper arms slightly backward (~10°-15° past vertical) to maintain constant triceps tension.",
      "Keeping upper arms locked in place, bend elbows to lower bar smoothly toward forehead/crown of head.",
      "Drive weight back up through elbows to full extension, squeezing triceps hard at top."
    ],
    form_cues: ["Upper arms stay fixed at 15° backward lean", "Elbows pointed forward, not flaring out", "Smooth descent to hairline"],
    common_mistakes: ["Flaring elbows out to sides", "Moving upper arms back and forth like a pullover", "Crashing bar toward skull"],
    alternatives: ["Dumbbell Skull Crusher (Lying on Bench)", "Cable Tricep Pushdown"],
    demo_steps: [
      { step: 1, title: "Setup Angle", description: "Lie back, arms extended at slight 15 degree backward angle.", coachTip: "Constant tension." },
      { step: 2, title: "Hinge to Crown", description: "Bend only at elbows, lower bar toward hairline.", coachTip: "Feel triceps long head stretch." },
      { step: 3, title: "Triceps Lockout", description: "Extend forearms back to start position, lock triceps.", coachTip: "Squeeze horseshoe." }
    ]
  },
  {
    id: "ex-cable-tricep-pushdown",
    name: "Cable Tricep Pushdown (Pulley)",
    split_day: "Saturday",
    order_index: 3,
    target_muscle: "Triceps Brachii (Lateral Head)",
    secondary_muscles: ["Forearms"],
    bench_angle: "Floor / Standing",
    required_equipment: "cable_pulley",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Awakening Cable Arm Focus",
    target_duration_mins: 6,
    default_sets: 4,
    default_reps_min: 10,
    default_reps_max: 15,
    default_rest_seconds: 60,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.30, endurance: 0.25, discipline: 0.20 },
    instructions: [
      "Attach bar or rope to high pulley on 20-in-1 bench pull chain.",
      "Grip handle, pin elbows firmly into side ribs, lean forward slightly from hips.",
      "Push handle downward until elbows are fully extended, spreading rope slightly at bottom.",
      "Squeeze triceps intensely for 1 second, then allow forearms to rise back to ~90°."
    ],
    form_cues: ["Elbows pinned to ribs", "Full lockout squeeze", "Do not allow elbows to drift forward"],
    common_mistakes: ["Using momentum and shoulder movement", "Elbows flaring away from ribs", "Partial extension"],
    alternatives: ["Bench / Chair Tricep Dips", "Close-Grip Push-Up (Triceps Builder)"],
    demo_steps: [
      { step: 1, title: "Pin & Lean", description: "Elbows glued to side body, slight forward athletic tilt.", coachTip: "Zero shoulder involvement." },
      { step: 2, title: "Downward Drive", description: "Push straight down until elbows fully lock out.", coachTip: "Squeeze triceps." },
      { step: 3, title: "Control", description: "Return to 90 degrees under strict tension.", coachTip: "Resist the stack." }
    ]
  },
  {
    id: "ex-chin-ups-calisthenics",
    name: "Underhand Grip Chin-Ups",
    split_day: "Saturday",
    order_index: 4,
    target_muscle: "Biceps & Lats",
    secondary_muscles: ["Forearms", "Lower Traps"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 4,
    unlock_criteria: "Recruit Bodyweight Arm Power",
    target_duration_mins: 7,
    default_sets: 4,
    default_reps_min: 6,
    default_reps_max: 10,
    default_rest_seconds: 90,
    met_category: "high_intensity_bodyweight",
    attribute_yield: { strength: 0.45, endurance: 0.25, discipline: 0.20 },
    instructions: [
      "Grip bar with underhand (supinated) grip shoulder-width apart.",
      "Hang in full deadhang, pull chest toward bar by curling arms and driving elbows into ribs.",
      "Pull until chin clears bar completely, squeezing biceps intensely at apex.",
      "Lower under control back to full extension."
    ],
    form_cues: ["Supinated grip loads biceps", "Chin completely over bar", "Smooth deadhang reset"],
    common_mistakes: ["Kipping and swinging", "Dropping down without eccentric control", "Half reps"],
    alternatives: ["EZ-Bar Standing Bicep Curl (Curly Rod)", "Standing Dumbbell Bicep Curl"],
    demo_steps: [
      { step: 1, title: "Supinated Hang", description: "Underhand shoulder-width grip, full extension.", coachTip: "Arms straight." },
      { step: 2, title: "Bicep Surge", description: "Pull up forcefully, curling chin over bar.", coachTip: "Peak bicep tension." },
      { step: 3, title: "Negative", description: "Lower slowly to full arm hang.", coachTip: "Resist gravity." }
    ]
  },
  {
    id: "ex-tricep-dips-bodyweight",
    name: "Bench Tricep Dips (Bodyweight)",
    split_day: "Saturday",
    order_index: 5,
    target_muscle: "Triceps Brachii",
    secondary_muscles: ["Anterior Deltoids", "Chest"],
    bench_angle: "Flat",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Awakening Arm Calisthenics",
    target_duration_mins: 6,
    default_sets: 3,
    default_reps_min: 12,
    default_reps_max: 20,
    default_rest_seconds: 60,
    met_category: "general_bodyweight",
    attribute_yield: { strength: 0.35, endurance: 0.30, discipline: 0.20 },
    instructions: [
      "Sit on edge of 20-in-1 bench or chair with hands gripping edge beside hips.",
      "Slide hips forward off bench, legs extended forward on heels.",
      "Lower body by bending elbows straight backward until arms form 90° angle.",
      "Drive through palms to lockout arms, squeezing triceps at top."
    ],
    form_cues: ["Back stays close to bench", "Elbows point straight back", "Full triceps extension"],
    common_mistakes: ["Hips drifting far away from bench (shoulder strain)", "Shrugging shoulders", "Incomplete lockout"],
    alternatives: ["Cable Tricep Pushdown (Pulley)", "Diamond Push-Up"],
    demo_steps: [
      { step: 1, title: "Edge Grip", description: "Hands on bench edge, hips hovering in front.", coachTip: "Keep torso upright." },
      { step: 2, title: "90 Degree Dip", description: "Lower hips until upper arms are parallel to floor.", coachTip: "Elbows track backward." },
      { step: 3, title: "Lockout", description: "Push palms down into bench, lock triceps fully.", coachTip: "Peak burn." }
    ]
  },

  // =========================================================================
  // CORE & ABDOMINAL PROTOCOLS (UPPER & LOWER BELLY)
  // =========================================================================
  {
    id: "ex-core-crunches",
    name: "Standard Abdominal Crunches",
    split_day: "Monday",
    order_index: 9,
    target_muscle: "Upper Abdominals",
    secondary_muscles: ["Transverse Abdominis"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Daily Belly (Day A)",
    target_duration_mins: 5,
    default_sets: 3,
    default_reps_min: 15,
    default_reps_max: 25,
    default_rest_seconds: 45,
    met_category: "general_bodyweight",
    attribute_yield: { endurance: 0.30, discipline: 0.25, agility: 0.15 },
    instructions: [
      "Lie on back with knees bent at 90° and feet flat on floor.",
      "Fingertips gently supporting head without pulling on neck.",
      "Contract upper abs to peel shoulder blades off floor, curling ribcage toward pelvis.",
      "Exhale forcefully at peak contraction, pause 1 second, then lower back smoothly."
    ],
    form_cues: ["Curl ribs to hips", "Space between chin and chest", "Breathe out hard at top"],
    common_mistakes: ["Yanking on neck", "Using hip flexors instead of abs", "Rushing without pause"],
    alternatives: ["Hollow Body Hold", "Incline Bench Crunch"],
    demo_steps: [
      { step: 1, title: "Setup", description: "Back flat, knees bent, fingers at temples.", coachTip: "Zero neck strain." },
      { step: 2, title: "Curl Up", description: "Roll ribcage toward hips, lifting shoulder blades.", coachTip: "Squeeze upper abs." },
      { step: 3, title: "Smooth Reset", description: "Lower with control to maintain abdominal tension.", coachTip: "Do not relax at bottom." }
    ]
  },
  {
    id: "ex-bicycle-crunches",
    name: "Bicycle Crunches (Rotational Obliques)",
    split_day: "Monday",
    order_index: 10,
    target_muscle: "Obliques & Upper Abdominals",
    secondary_muscles: ["Hip Flexors", "Transverse Abdominis"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 2,
    unlock_criteria: "Daily Belly (Day A)",
    target_duration_mins: 5,
    default_sets: 3,
    default_reps_min: 16,
    default_reps_max: 24,
    default_rest_seconds: 45,
    met_category: "general_bodyweight",
    attribute_yield: { endurance: 0.35, agility: 0.25, discipline: 0.20 },
    instructions: [
      "Lie on back with hands behind head, knees raised at 90°.",
      "Rotate torso to bring right elbow toward incoming left knee while extending right leg straight out.",
      "Switch sides in controlled bicycle pedaling motion, maintaining shoulder blades off floor."
    ],
    form_cues: ["Rotate from ribcage, not elbows", "Slow pedaling cadence", "Shoulders stay off floor"],
    common_mistakes: ["Fast flailing elbows without torso rotation", "Pulling head", "Lower back arching off floor"],
    alternatives: ["Floor Crunches", "Hollow Body Hold"],
    demo_steps: [
      { step: 1, title: "Hover Base", description: "Shoulders off floor, knees up in tabletop.", coachTip: "Low back pinned." },
      { step: 2, title: "Cross Crunch", description: "Rotate right armpit toward left knee.", coachTip: "Feel oblique coil." },
      { step: 3, title: "Pedal Transition", description: "Switch sides smoothly under continuous tension.", coachTip: "Cadence over speed." }
    ]
  },
  {
    id: "ex-lying-leg-raises",
    name: "Lying Straight Leg Raises",
    split_day: "Tuesday",
    order_index: 9,
    target_muscle: "Lower Abdominals",
    secondary_muscles: ["Hip Flexors", "Transverse Abdominis"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Daily Belly (Day B)",
    target_duration_mins: 5,
    default_sets: 3,
    default_reps_min: 12,
    default_reps_max: 20,
    default_rest_seconds: 45,
    met_category: "general_bodyweight",
    attribute_yield: { endurance: 0.35, discipline: 0.25, vitality: 0.15 },
    instructions: [
      "Lie flat on back with legs straight, hands placed flat beneath lower glutes for lumbar support.",
      "Keeping legs straight and toes pointed, elevate legs together until perpendicular to floor.",
      "Lower legs slowly back down, stopping 2 inches before floor to maintain continuous lower abdominal tension."
    ],
    form_cues: ["Press lumbar spine flat to floor", "Hover heels at bottom", "Smooth controlled descent"],
    common_mistakes: ["Lower back arching off floor", "Bending knees excessively", "Dropping legs quickly"],
    alternatives: ["Hanging Leg / Knee Raises", "Flat Bench Reverse Crunch"],
    demo_steps: [
      { step: 1, title: "Floor Anchor", description: "Lumbar glued to floor, heels hovering.", coachTip: "Lock core." },
      { step: 2, title: "Vertical Raise", description: "Lift legs smoothly to 90 degrees.", coachTip: "Exhale on way up." },
      { step: 3, title: "Hover Brake", description: "Lower with 3-second cadence, stop inches above ground.", coachTip: "Maintain lower ab burn." }
    ]
  },
  {
    id: "ex-mountain-climbers",
    name: "Cadence Mountain Climbers",
    split_day: "Tuesday",
    order_index: 10,
    target_muscle: "Lower Abdominals & Core",
    secondary_muscles: ["Cardiovascular", "Shoulders", "Hip Flexors"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Daily Belly (Day B)",
    target_duration_mins: 5,
    default_sets: 3,
    default_reps_min: 20,
    default_reps_max: 30,
    default_rest_seconds: 45,
    met_category: "high_intensity_bodyweight",
    attribute_yield: { endurance: 0.40, agility: 0.30, discipline: 0.15 },
    instructions: [
      "Assume a strict high plank position, hands under shoulders, core braced.",
      "Drive right knee rapidly toward chest without letting hips bounce up.",
      "Quickly step right foot back while simultaneously driving left knee to chest.",
      "Continue in rapid, controlled cadence while maintaining rigid plank."
    ],
    form_cues: ["Hips stay low and level", "Hands push firmly into ground", "Rapid rhythmic knee drive"],
    common_mistakes: ["Hips piking high into air", "Bouncing wildly", "Hands drifting forward"],
    alternatives: ["Scissor & Flutter Kicks", "Lying Straight Leg Raises"],
    demo_steps: [
      { step: 1, title: "Plank Posture", description: "High plank, hands stacked under shoulders.", coachTip: "Flat back." },
      { step: 2, title: "Knee Drive", description: "Drive knee directly to chest cavity.", coachTip: "Stay low." },
      { step: 3, title: "Switch Cadence", description: "Rapid alternating rhythm under control.", coachTip: "Breathe continuously." }
    ]
  },

  // =========================================================================
  // BENCH LEG DEVELOPER ATTACHMENT (QUAD EXTENSIONS & HAMSTRING CURLS)
  // =========================================================================
  {
    id: "ex-bench-leg-extension",
    name: "Seated Bench Leg Extension (Plate-Loaded)",
    split_day: "Monday",
    order_index: 3,
    target_muscle: "Quadriceps (Rectus Femoris & Vasti)",
    secondary_muscles: ["Patellar Tendon", "Hip Flexors"],
    bench_angle: "Flat",
    required_equipment: "leg_developer",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Bench Leg Developer Isolation",
    target_duration_mins: 7,
    default_sets: 4,
    default_reps_min: 10,
    default_reps_max: 15,
    default_rest_seconds: 60,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.35, vitality: 0.25, endurance: 0.15 },
    instructions: [
      "Sit upright on the 20-in-1 bench with back flat against backrest and knees aligned with the pivot point.",
      "Hook lower shins/ankles snugly beneath the foam padded lever loaded with weight plates.",
      "Grip the bench sides for pelvic stabilization; brace core tightly.",
      "Extend knees smoothly to raise legs straight out until fully locked horizontally.",
      "Squeeze quadriceps forcefully at peak contraction for 1 full second, then lower under 3-second eccentric control."
    ],
    form_cues: ["Point toes slightly upward", "Pause at horizontal lockout", "Do not swing or kick hips", "Control the negative"],
    common_mistakes: ["Using momentum/swinging hips off bench", "Incomplete knee extension", "Dropping weight abruptly"],
    alternatives: ["Sissy Squats", "Isometric Wall Sit", "Single-Leg Bench Extension"],
    demo_steps: [
      { step: 1, title: "Ankle Anchor", description: "Lock shins behind foam roller, hips pinned to bench.", coachTip: "Align knee joint with machine pivot." },
      { step: 2, title: "Horizontal Extension", description: "Drive legs straight up to lockout, contract quad teardrops.", coachTip: "Hold 1s at apex." },
      { step: 3, title: "Resisted Lowering", description: "Lower slowly over 3 seconds to maintain continuous tension.", coachTip: "Feel the deep quad stretch." }
    ]
  },
  {
    id: "ex-bench-lying-leg-curl",
    name: "Lying Bench Hamstring Leg Curl (Plate-Loaded)",
    split_day: "Monday",
    order_index: 4,
    target_muscle: "Hamstrings (Biceps Femoris & Semitendinosus)",
    secondary_muscles: ["Calves (Gastrocnemius)", "Glutes"],
    bench_angle: "Flat",
    required_equipment: "leg_developer",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Bench Leg Developer Posterior Chain",
    target_duration_mins: 7,
    default_sets: 4,
    default_reps_min: 10,
    default_reps_max: 12,
    default_rest_seconds: 60,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.35, endurance: 0.25, discipline: 0.15 },
    instructions: [
      "Lie face-down (prone) flat on the bench with kneecaps resting just over the edge.",
      "Position the lower Achilles/back of heels securely beneath the foam roller lever.",
      "Grip front bench handles or frame edges firmly, pressing hips and pelvis flat into the bench pad.",
      "Curl heels upward toward glutes in a smooth arc, flexing hamstrings fully at top peak.",
      "Slowly lower lever back down until legs are almost fully extended, resisting the loaded plates."
    ],
    form_cues: ["Hips glued to bench", "Point toes straight back", "Full contraction at top", "Smooth negative"],
    common_mistakes: ["Hips piking upward off bench pad", "Hyperextending lower lumbar", "Fast uncontrolled descent"],
    alternatives: ["Barbell Romanian Deadlift", "Single-Leg Glute Bridges", "Nordic Hamstring Curls"],
    demo_steps: [
      { step: 1, title: "Prone Setup", description: "Lie prone, anchor heels under foam roller, grip frame.", coachTip: "Press pelvis into pad." },
      { step: 2, title: "Heel-to-Glute Curl", description: "Contract hamstrings aggressively, curling lever to glutes.", coachTip: "Squeeze hamstrings at top." },
      { step: 3, title: "Controlled Stretch", description: "Lower under control, stopping just shy of dead hang.", coachTip: "3-second descent." }
    ]
  },
  {
    id: "ex-bench-single-leg-extension",
    name: "Single-Leg Bench Extension (Unilateral Quad Focus)",
    split_day: "Monday",
    order_index: 5,
    target_muscle: "Quadriceps (Vastus Medialis Oblique - Teardrop)",
    secondary_muscles: ["Patellar Stability", "Core"],
    bench_angle: "Flat",
    required_equipment: "leg_developer",
    unlock_tier: "Initiate",
    unlock_level: 6,
    unlock_criteria: "Initiate Unilateral Leg Balance",
    target_duration_mins: 6,
    default_sets: 3,
    default_reps_min: 12,
    default_reps_max: 15,
    default_rest_seconds: 45,
    met_category: "general_resistance",
    attribute_yield: { agility: 0.30, strength: 0.25, vitality: 0.20 },
    instructions: [
      "Sit upright with one leg centered behind the padded roller lever, resting opposite foot flat on floor.",
      "Isolate active leg, extending knee straight out to horizontal lockout.",
      "Pause for 1 second at peak contraction to stimulate the vastus medialis teardrop head.",
      "Lower smoothly with strict tempo, complete all reps, then alternate sides."
    ],
    form_cues: ["Isolate one quad at a time", "Square hips on bench", "Full lockout at peak", "Fixes muscle imbalances"],
    common_mistakes: ["Using torso sway to initiate lift", "Incomplete range of motion"],
    alternatives: ["Seated Bench Leg Extension (Plate-Loaded)", "Pistol Squats"],
    demo_steps: [
      { step: 1, title: "Single Shin Placement", description: "Center one shin on roller, anchor opposite foot.", coachTip: "Zero torso lean." },
      { step: 2, title: "Unilateral Drive", description: "Extend leg straight out to parallel.", coachTip: "Mind-muscle focus on quad." },
      { step: 3, title: "Eccentric Lower", description: "Lower with controlled cadence.", coachTip: "Eliminate asymmetry." }
    ]
  },

  // =========================================================================
  // COACH-STRUCTURED TUESDAY (CHEST, TRICEPS & CALISTHENICS FINISHERS)
  // =========================================================================
  {
    id: "ex-cable-crossover-low-to-high",
    name: "Low-to-High Cable Chest Fly (Upper Clavicular Focus)",
    split_day: "Tuesday",
    order_index: 4,
    target_muscle: "Upper Chest (Clavicular Head)",
    secondary_muscles: ["Front Deltoids", "Core"],
    bench_angle: "Floor / Standing",
    required_equipment: "cable_pulley",
    unlock_tier: "Initiate",
    unlock_level: 5,
    unlock_criteria: "Initiate Upper Chest Sculpting",
    target_duration_mins: 7,
    default_sets: 4,
    default_reps_min: 12,
    default_reps_max: 15,
    default_rest_seconds: 60,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.30, discipline: 0.25, agility: 0.15 },
    instructions: [
      "Set cable attachments to lowest pulley position with D-handles.",
      "Take a step forward into a staggered stance with chest high and elbows slightly bent.",
      "Drive hands upward and inward in a sweeping arc, meeting at upper chest/chin level.",
      "Squeeze upper pectorals tightly at the top, then lower with controlled resistance."
    ],
    form_cues: ["Chest proud", "Scoop upward", "Keep elbows fixed at soft bend", "Peak squeeze"],
    common_mistakes: ["Using excessive shoulder shrugging", "Bending and straightening elbows like a press"],
    alternatives: ["Standing Cable Chest Fly (Pulley)", "Incline Dumbbell Fly"],
    demo_steps: [
      { step: 1, title: "Low Stagger", description: "Low cables, step forward, chest up.", coachTip: "Solid staggered base." },
      { step: 2, title: "Scoop to Center", description: "Sweep hands up and together toward chin line.", coachTip: "Squeeze upper pecs." },
      { step: 3, title: "Wide Negative", description: "Return wide under tension.", coachTip: "Feel the stretch across chest." }
    ]
  },
  {
    id: "ex-diamond-pushups",
    name: "Diamond Close-Grip Push-Ups (Triceps & Inner Chest)",
    split_day: "Tuesday",
    order_index: 5,
    target_muscle: "Triceps Lateral & Medial Heads",
    secondary_muscles: ["Inner Chest", "Front Deltoids", "Core"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 2,
    unlock_criteria: "Calisthenics Tricep Overload",
    target_duration_mins: 6,
    default_sets: 3,
    default_reps_min: 10,
    default_reps_max: 15,
    default_rest_seconds: 60,
    met_category: "general_bodyweight",
    attribute_yield: { strength: 0.35, discipline: 0.25, endurance: 0.20 },
    instructions: [
      "Assume standard plank position, placing thumbs and index fingers together on floor forming a diamond shape.",
      "Lower chest directly down until touching the back of hands, keeping elbows tucked close to torso.",
      "Press through triceps and palms forcefully to full lockout at the top."
    ],
    form_cues: ["Elbows tucked 30° to body", "Form diamond with fingers", "Full lockout at apex", "Rigid core plank"],
    common_mistakes: ["Flaring elbows 90° outward (strains wrists)", "Sagging lumbar spine"],
    alternatives: ["Bench Tricep Dips (Bodyweight)", "Cable Tricep Pushdown (Pulley)"],
    demo_steps: [
      { step: 1, title: "Diamond Base", description: "Hands touching beneath sternum, legs straight.", coachTip: "Diamond with index & thumbs." },
      { step: 2, title: "Sternum Drop", description: "Lower chest to back of hands, elbows tracking back.", coachTip: "Keep body rigid." },
      { step: 3, title: "Tricep Lockout", description: "Drive palms into ground, fully extending arms.", coachTip: "Flex triceps at top." }
    ]
  },
  {
    id: "ex-decline-pushups",
    name: "Decline Push-Ups (Feet Elevated on Bench)",
    split_day: "Tuesday",
    order_index: 6,
    target_muscle: "Upper Chest & Front Deltoids",
    secondary_muscles: ["Triceps", "Serratus Anterior", "Core"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 3,
    unlock_criteria: "Calisthenics Clavicular Loading",
    target_duration_mins: 6,
    default_sets: 3,
    default_reps_min: 10,
    default_reps_max: 15,
    default_rest_seconds: 60,
    met_category: "general_bodyweight",
    attribute_yield: { strength: 0.35, agility: 0.20, discipline: 0.20 },
    instructions: [
      "Place toes elevated on the 20-in-1 bench with hands flat on floor shoulder-width apart.",
      "Maintain a straight rigid plank from heels to crown of head.",
      "Lower chest smoothly toward floor until nose is 1 inch away, keeping core tight.",
      "Press floor away to full lockout, focusing tension onto upper clavicular chest."
    ],
    form_cues: ["Feet elevated on bench pad", "Head neutral", "Tuck elbows slightly", "Deep upper chest stretch"],
    common_mistakes: ["Excessive lower back sagging", "Pushing hips back instead of pressing vertically"],
    alternatives: ["Archer Push-Ups", "Incline Barbell Bench Press (30°)"],
    demo_steps: [
      { step: 1, title: "Elevated Feet", description: "Toes on bench, hands stacked under shoulders on floor.", coachTip: "Brace abs." },
      { step: 2, title: "Floor Dip", description: "Lower upper body controlled toward floor.", coachTip: "Feel upper chest stretch." },
      { step: 3, title: "Lockout", description: "Drive through hands to full extension.", coachTip: "Protract shoulders at top." }
    ]
  },

  // =========================================================================
  // COACH-STRUCTURED WEDNESDAY (BACK & BICEPS EXTENSIONS)
  // =========================================================================
  {
    id: "ex-seated-cable-row-close-grip",
    name: "Seated Cable Row (Close-Grip V-Bar on Pulley)",
    split_day: "Wednesday",
    order_index: 3,
    target_muscle: "Mid-Back (Rhomboids & Lower Lat Thickness)",
    secondary_muscles: ["Biceps", "Rear Deltoids", "Spinal Erectors"],
    bench_angle: "Floor / Standing",
    required_equipment: "cable_pulley",
    unlock_tier: "Recruit",
    unlock_level: 2,
    unlock_criteria: "Cable Pulley Thickness Foundation",
    target_duration_mins: 8,
    default_sets: 4,
    default_reps_min: 10,
    default_reps_max: 12,
    default_rest_seconds: 75,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.35, discipline: 0.25, endurance: 0.20 },
    instructions: [
      "Sit facing the cable pulley attachment with feet braced against footrests or bench frame, knees softly bent.",
      "Grip V-bar handle with neutral grip, sit tall with chest puffed out and neutral spine.",
      "Drive elbows straight back, pulling handle into lower abdomen while retracting shoulder blades.",
      "Hold squeeze for 1 second, then extend arms forward under control to allow full lat stretch."
    ],
    form_cues: ["Chest out proud", "Drive with elbows", "Squeeze shoulder blades together", "No rocking torso"],
    common_mistakes: ["Swinging torso backward to hoist load", "Shoulders shrugging upward toward ears"],
    alternatives: ["Barbell Bent-Over Row", "Inverted Rows (Bodyweight Rows)"],
    demo_steps: [
      { step: 1, title: "Seated Brace", description: "Feet braced, knees soft, spine tall and neutral.", coachTip: "Chest proud." },
      { step: 2, title: "Elbow Drive", description: "Pull handle to belly button, pin shoulder blades back.", coachTip: "Drive elbows back." },
      { step: 3, title: "Controlled Stretch", description: "Extend arms forward, feeling deep lat stretch.", coachTip: "Do not round lower back." }
    ]
  },
  {
    id: "ex-straight-arm-cable-pulldown",
    name: "Straight-Arm Cable Lat Pulldown",
    split_day: "Wednesday",
    order_index: 4,
    target_muscle: "Lats (Latissimus Dorsi Sweep)",
    secondary_muscles: ["Teres Major", "Triceps Long Head", "Core"],
    bench_angle: "Floor / Standing",
    required_equipment: "cable_pulley",
    unlock_tier: "Initiate",
    unlock_level: 5,
    unlock_criteria: "Initiate Lat Sweep Isolation",
    target_duration_mins: 7,
    default_sets: 3,
    default_reps_min: 12,
    default_reps_max: 15,
    default_rest_seconds: 60,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.30, endurance: 0.25, discipline: 0.20 },
    instructions: [
      "Attach straight or lat bar to high pulley, stand with feet hip-width, hips hinged back 20°.",
      "Grip bar with overhand grip wider than shoulders, arms nearly straight with elbows unlocked.",
      "Without bending elbows, drive bar downward in an arc until touching upper thighs.",
      "Contract lats fiercely at the bottom, then allow bar to rise smoothly back to eye level."
    ],
    form_cues: ["Arms stay locked in slight bend", "Drive bar down to hips", "Squeeze lats", "Torso stays stationary"],
    common_mistakes: ["Bending elbows turning it into a tricep pushdown", "Swinging torso up and down"],
    alternatives: ["Cable Lat Pulldown (Back Pull Chain)", "Dumbbell Pullover"],
    demo_steps: [
      { step: 1, title: "Hinged Posture", description: "Slight hip hinge, arms extended high at eye level.", coachTip: "Soft elbow lock." },
      { step: 2, title: "Arc Pulldown", description: "Pull bar down to upper thighs in a sweeping arc.", coachTip: "Crush armpits closed." },
      { step: 3, title: "High Stretch", description: "Let bar ascend back to eye height under control.", coachTip: "Feel lats lengthen." }
    ]
  },
  {
    id: "ex-doorframe-rows",
    name: "Doorframe Isometric Rows (Zero-Equipment Pull)",
    split_day: "Wednesday",
    order_index: 5,
    target_muscle: "Rhomboids, Lats & Biceps",
    secondary_muscles: ["Grip", "Rear Deltoids", "Core"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 1,
    unlock_criteria: "Pure Calisthenics Home Pull",
    target_duration_mins: 6,
    default_sets: 3,
    default_reps_min: 12,
    default_reps_max: 15,
    default_rest_seconds: 45,
    met_category: "general_bodyweight",
    attribute_yield: { strength: 0.30, endurance: 0.25, discipline: 0.20 },
    instructions: [
      "Stand facing a sturdy doorframe or structural pillar, feet close to base.",
      "Grip edge firmly with hands at chest height, lean torso backward until arms are fully extended.",
      "Pull chest firmly into the frame, squeezing shoulder blades together and contracting biceps.",
      "Lower backward under control, resisting with back muscles."
    ],
    form_cues: ["Feet braced against doorframe", "Squeeze shoulder blades", "Control the negative", "Great home alternative"],
    common_mistakes: ["Pulling only with arms without engaging back", "Jerking torso"],
    alternatives: ["Inverted Rows (Bodyweight Rows)", "Strict Deadhang Pull-Ups"],
    demo_steps: [
      { step: 1, title: "Grip Edge", description: "Grip doorframe securely, lean back with arms straight.", coachTip: "Body in straight plank." },
      { step: 2, title: "Chest to Frame", description: "Pull torso directly into doorframe edge.", coachTip: "Squeeze scapulae." },
      { step: 3, title: "Controlled Fall", description: "Lower body back smoothly.", coachTip: "Feel back stretch." }
    ]
  },

  // =========================================================================
  // COACH-STRUCTURED THURSDAY (DELTS, TRAPS & ROTATOR CUFF)
  // =========================================================================
  {
    id: "ex-cable-lateral-raise",
    name: "Single-Arm Cable Lateral Raise (Continuous Tension)",
    split_day: "Thursday",
    order_index: 3,
    target_muscle: "Lateral Deltoids (Shoulder Width)",
    secondary_muscles: ["Trapezius", "Forearms"],
    bench_angle: "Floor / Standing",
    required_equipment: "cable_pulley",
    unlock_tier: "Recruit",
    unlock_level: 2,
    unlock_criteria: "Cable Lateral Hypertrophy",
    target_duration_mins: 7,
    default_sets: 4,
    default_reps_min: 12,
    default_reps_max: 15,
    default_rest_seconds: 45,
    met_category: "general_resistance",
    attribute_yield: { agility: 0.35, strength: 0.25, discipline: 0.20 },
    instructions: [
      "Set cable pulley to lowest position, stand perpendicular to frame holding D-handle with outside hand.",
      "Cable runs behind body or across front of thighs.",
      "Raise arm out to the side until parallel to floor, leading with elbow and pinky finger slightly higher than thumb.",
      "Hold peak contraction for 1 second, then lower slowly resisting the cable's continuous inward pull."
    ],
    form_cues: ["Lead with elbow", "Pinky slightly tilted up", "No swinging torso", "Constant tension throughout"],
    common_mistakes: ["Using momentum/shrugging neck", "Lifting above shoulder height", "Dropping weight fast"],
    alternatives: ["Standing Lateral Raise", "Pike Push-Ups"],
    demo_steps: [
      { step: 1, title: "Perpendicular Base", description: "Stand side-on to pulley, handle in outside hand.", coachTip: "Arm across thigh." },
      { step: 2, title: "Lateral Arc", description: "Raise arm outward to shoulder height.", coachTip: "Lead with elbow." },
      { step: 3, title: "Slow Descent", description: "Lower with 3-second cadence resisting weight stack.", coachTip: "Constant tension." }
    ]
  },
  {
    id: "ex-barbell-shrugs",
    name: "Barbell Power Shrugs (Heavy Trapezius Loading)",
    split_day: "Thursday",
    order_index: 4,
    target_muscle: "Upper Trapezius",
    secondary_muscles: ["Forearms & Grip", "Spinal Erectors"],
    bench_angle: "Floor / Standing",
    required_equipment: "barbell",
    unlock_tier: "Recruit",
    unlock_level: 3,
    unlock_criteria: "Barbell Trapezius Foundation",
    target_duration_mins: 7,
    default_sets: 4,
    default_reps_min: 10,
    default_reps_max: 12,
    default_rest_seconds: 75,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.40, discipline: 0.25, endurance: 0.15 },
    instructions: [
      "Stand tall holding barbell with shoulder-width overhand grip at mid-thigh level.",
      "Without bending elbows, elevate shoulders directly toward ears as high as humanly possible.",
      "Hold squeeze for 2 seconds at the top contraction, feeling traps bunch tightly.",
      "Lower shoulders slowly under control back to starting position."
    ],
    form_cues: ["Elevate straight up to ears", "Do not roll shoulders backward or forward", "2-second squeeze at apex", "Arms stay straight ropes"],
    common_mistakes: ["Rolling shoulders (grinds rotator cuff)", "Bending elbows to assist lift", "Using knee bounce"],
    alternatives: ["EZ-Bar Upright Row (Curly Rod)", "Dumbbell Shrugs"],
    demo_steps: [
      { step: 1, title: "Erect Stance", description: "Bar resting on thighs, arms straight like chains.", coachTip: "Spine neutral." },
      { step: 2, title: "Shoulders to Ears", description: "Shrug traps violently toward ears.", coachTip: "Hold 2s squeeze." },
      { step: 3, title: "Smooth Reset", description: "Lower straight down.", coachTip: "Control the stretch." }
    ]
  },
  {
    id: "ex-pike-pushups",
    name: "Calisthenics Pike Push-Ups (Vertical Deltoid Power)",
    split_day: "Thursday",
    order_index: 5,
    target_muscle: "Front & Lateral Deltoids",
    secondary_muscles: ["Triceps", "Upper Trapezius", "Core"],
    bench_angle: "Floor / Standing",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 2,
    unlock_criteria: "Calisthenics Shoulder Mastery",
    target_duration_mins: 6,
    default_sets: 3,
    default_reps_min: 8,
    default_reps_max: 12,
    default_rest_seconds: 60,
    met_category: "general_bodyweight",
    attribute_yield: { strength: 0.35, agility: 0.25, discipline: 0.20 },
    instructions: [
      "Assume a downward dog / inverted V-shape position, hips piked high, hands on floor shoulder-width apart.",
      "Look back toward feet; head aligns between arms.",
      "Lower head diagonally forward in a tripod pattern until crown gently touches floor.",
      "Press through palms backward and upward to push back into piked V-shape."
    ],
    form_cues: ["Hips piked as high as possible", "Tripod descent pattern", "Elbows track back 45°", "Press back and up"],
    common_mistakes: ["Flaring elbows out 90°", "Flattening body into a standard pushup"],
    alternatives: ["Wall Handstand Hold", "Standing Barbell Overhead Military Press"],
    demo_steps: [
      { step: 1, title: "Inverted V", description: "Hips high in the air, legs straight, hands planted.", coachTip: "Pike hips high." },
      { step: 2, title: "Crown Dip", description: "Lower head diagonally forward ahead of fingertips.", coachTip: "Tripod shape." },
      { step: 3, title: "Vertical Press", description: "Press through palms returning to inverted V.", coachTip: "Push head through shoulders." }
    ]
  },

  // =========================================================================
  // COACH-STRUCTURED FRIDAY (POSTERIOR CHAIN & UPPER BACK)
  // =========================================================================
  {
    id: "ex-barbell-conventional-deadlift",
    name: "Barbell Conventional Deadlift (Master Kinetic Chain)",
    split_day: "Friday",
    order_index: 1,
    target_muscle: "Entire Posterior Chain (Erectors, Glutes, Hamstrings)",
    secondary_muscles: ["Trapezius", "Lats", "Forearms & Grip", "Core"],
    bench_angle: "Floor / Standing",
    required_equipment: "barbell",
    unlock_tier: "Initiate",
    unlock_level: 5,
    unlock_criteria: "Initiate Supreme Posterior Power",
    target_duration_mins: 10,
    default_sets: 4,
    default_reps_min: 5,
    default_reps_max: 8,
    default_rest_seconds: 120,
    met_category: "squats_deadlifts",
    attribute_yield: { strength: 0.50, vitality: 0.25, discipline: 0.25 },
    instructions: [
      "Stand with mid-foot directly beneath the loaded barbell, shins 1 inch away, feet hip-width.",
      "Hinge at hips, grip bar just outside knees with double-overhand or mixed grip.",
      "Drop hips slightly until shins touch bar; pull slack out of bar and lock lats into back pockets.",
      "Brace core with deep abdominal breath, push floor away through mid-foot to stand erect.",
      "Lock hips and knees firmly at top without hyperextending lumbar; lower under controlled hip hinge."
    ],
    form_cues: ["Pull slack out of bar", "Push floor away", "Bar drags against shins", "Neutral spine throughout"],
    common_mistakes: ["Rounding lumbar spine (cat back)", "Hips shooting up before bar leaves floor", "Over-arching lower back at lockout"],
    alternatives: ["Barbell Romanian Deadlift (RDL)", "Barbell Back Squat"],
    demo_steps: [
      { step: 1, title: "Barbell Wedge", description: "Shins against bar, lats squeezed tight, spine locked.", coachTip: "Pull slack out of bar." },
      { step: 2, title: "Floor Push", description: "Drive floor away aggressively with legs.", coachTip: "Keep bar close to body." },
      { step: 3, title: "Crisp Lockout", description: "Stand tall, squeeze glutes firmly.", coachTip: "Do not lean back." }
    ]
  },
  {
    id: "ex-bodyweight-bulgarian-split-squat",
    name: "Bodyweight Bulgarian Split Squats (Unilateral Leg Power)",
    split_day: "Friday",
    order_index: 3,
    target_muscle: "Glutes & Quadriceps",
    secondary_muscles: ["Hamstrings", "Calves", "Core Stabilizers"],
    bench_angle: "Flat",
    required_equipment: "bodyweight",
    unlock_tier: "Recruit",
    unlock_level: 2,
    unlock_criteria: "Unilateral Calisthenics Mastery",
    target_duration_mins: 7,
    default_sets: 3,
    default_reps_min: 10,
    default_reps_max: 12,
    default_rest_seconds: 60,
    met_category: "general_bodyweight",
    attribute_yield: { strength: 0.35, agility: 0.30, vitality: 0.20 },
    instructions: [
      "Stand facing away from the bench, place top of rear foot laces down on the flat bench.",
      "Front foot takes a long stride forward so front knee tracks over ankle when descended.",
      "Lower torso vertically until rear knee hovers 1 inch above floor.",
      "Drive aggressively through front heel to return to top, keeping torso upright."
    ],
    form_cues: ["90% of weight on front heel", "Torso slightly angled forward", "Drive through front mid-foot", "Full hip extension at top"],
    common_mistakes: ["Stance too short jamming front knee forward", "Pushing off back foot"],
    alternatives: ["Walking Lunges with Dumbbells", "Side Lunges (Cossack Squats)"],
    demo_steps: [
      { step: 1, title: "Elevated Rear Foot", description: "Laces flat on bench, front foot set forward.", coachTip: "Find your balance." },
      { step: 2, title: "Vertical Descent", description: "Drop hips down until back knee hovers over floor.", coachTip: "Weight on front heel." },
      { step: 3, title: "Ascent", description: "Press through front heel to stand tall.", coachTip: "Feel deep glute activation." }
    ]
  },

  // =========================================================================
  // COACH-STRUCTURED SATURDAY (ARM SPECIALIZATION & GRIP)
  // =========================================================================
  {
    id: "ex-close-grip-barbell-bench-press",
    name: "Close-Grip Barbell Bench Press (Heavy Tricep Compound)",
    split_day: "Saturday",
    order_index: 1,
    target_muscle: "Triceps Brachii (All 3 Heads)",
    secondary_muscles: ["Front Deltoids", "Inner Chest"],
    bench_angle: "Flat",
    required_equipment: "bench_and_barbell",
    unlock_tier: "Recruit",
    unlock_level: 3,
    unlock_criteria: "Tricep Power Compound",
    target_duration_mins: 8,
    default_sets: 4,
    default_reps_min: 8,
    default_reps_max: 10,
    default_rest_seconds: 90,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.40, discipline: 0.25, endurance: 0.15 },
    instructions: [
      "Lie flat on the 20-in-1 bench with eyes beneath the racked barbell.",
      "Grip bar with shoulder-width grip (hands ~12-14 inches apart, inside shoulder lines).",
      "Unrack, lower bar with elbows tucked 30°-45° toward torso until touching lower sternum.",
      "Press through triceps and palms forcefully back to vertical lockout."
    ],
    form_cues: ["Shoulder-width grip (not too narrow)", "Elbows tucked close to ribs", "Touch lower chest", "Full tricep lockout"],
    common_mistakes: ["Hands touching each other (wrecks wrists)", "Flaring elbows out wide"],
    alternatives: ["EZ-Bar Skull Crushers (Lying Triceps Extension)", "Chest Dips"],
    demo_steps: [
      { step: 1, title: "Shoulder-Width Grip", description: "Hands 12-14 inches apart, shoulder-width.", coachTip: "Protect wrists." },
      { step: 2, title: "Tucked Descent", description: "Lower bar to bottom of ribcage, elbows tight to body.", coachTip: "Elbows in." },
      { step: 3, title: "Lockout", description: "Drive bar straight up, flexing triceps at top.", coachTip: "Lock out arms firmly." }
    ]
  },
  {
    id: "ex-ez-bar-reverse-curls",
    name: "EZ-Bar Reverse Curls (Brachialis & Forearm Armor)",
    split_day: "Saturday",
    order_index: 4,
    target_muscle: "Brachialis & Brachioradialis (Forearms)",
    secondary_muscles: ["Biceps", "Wrist Extensors & Grip"],
    bench_angle: "Floor / Standing",
    required_equipment: "ez_bar",
    unlock_tier: "Recruit",
    unlock_level: 2,
    unlock_criteria: "Forearm & Grip Armor",
    target_duration_mins: 6,
    default_sets: 3,
    default_reps_min: 10,
    default_reps_max: 12,
    default_rest_seconds: 60,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.30, discipline: 0.25, endurance: 0.20 },
    instructions: [
      "Stand tall holding EZ curl bar with overhand (pronated) grip on outer angled grips.",
      "Pin upper arms to ribs, keep wrists straight without cocking backward.",
      "Curl bar upward in a smooth arc to shoulder height using forearms and brachialis.",
      "Lower bar slowly with strict negative, maintaining overhand wrist integrity."
    ],
    form_cues: ["Overhand pronated grip", "Elbows pinned to sides", "Do not flick wrists", "Squeeze forearms at apex"],
    common_mistakes: ["Swinging elbows forward", "Bending wrists backward under weight"],
    alternatives: ["EZ-Bar Standing Bicep Curl (Curly Rod)", "Inverted Rows"],
    demo_steps: [
      { step: 1, title: "Overhand Grip", description: "Hands over outer bends of EZ bar, arms extended.", coachTip: "Wrists firm." },
      { step: 2, title: "Brachialis Curl", description: "Curl bar upward keeping knuckles facing ceiling.", coachTip: "Feel deep forearm burn." },
      { step: 3, title: "Negative Control", description: "Lower with 3-second tempo.", coachTip: "Build dense forearms." }
    ]
  },
  {
    id: "ex-cable-overhead-tricep-extension",
    name: "Cable Overhead Rope Tricep Extension (Long Head Stretch)",
    split_day: "Saturday",
    order_index: 3,
    target_muscle: "Triceps Brachii (Long Head)",
    secondary_muscles: ["Core", "Shoulder Stabilizers"],
    bench_angle: "Floor / Standing",
    required_equipment: "cable_pulley",
    unlock_tier: "Recruit",
    unlock_level: 3,
    unlock_criteria: "Tricep Long Head Deep Stretch",
    target_duration_mins: 7,
    default_sets: 3,
    default_reps_min: 12,
    default_reps_max: 15,
    default_rest_seconds: 60,
    met_category: "general_resistance",
    attribute_yield: { strength: 0.30, agility: 0.25, discipline: 0.20 },
    instructions: [
      "Attach rope handle to high or mid cable pulley, turn facing away from the stack into a staggered stance.",
      "Hold rope ends behind head with elbows pointed upward toward ceiling.",
      "Extend forearms forward and overhead, flaring rope apart at the peak lockout.",
      "Return slowly, allowing forearms to travel deep behind head for a massive long head stretch."
    ],
    form_cues: ["Elbows stay pointed high", "Flare rope apart at top", "Deep stretch behind neck", "Solid staggered stance"],
    common_mistakes: ["Dropping elbows down to shoulders", "Arching lower back"],
    alternatives: ["EZ-Bar Skull Crushers (Lying Triceps Extension)", "Cable Tricep Pushdown (Pulley)"],
    demo_steps: [
      { step: 1, title: "Forward Stagger", description: "Rope behind neck, elbows high and forward.", coachTip: "Stable core." },
      { step: 2, title: "Overhead Lockout", description: "Extend arms forward-overhead, pull rope apart.", coachTip: "Flex long head." },
      { step: 3, title: "Deep Stretch", description: "Lower rope behind head feeling deep tricep stretch.", coachTip: "Keep elbows fixed." }
    ]
  }
];
