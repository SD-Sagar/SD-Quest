const fs = require('fs');

const allExercises = [];

function makeEx(id, name, splitDay, order, muscle, secondary, angle, equip, tier, lvl, criteria, sets, rMin, rMax, rest, dur, inst, cues, mistakes, alts, demos) {
  return {
    id,
    name,
    split_day: splitDay,
    order_index: order,
    target_muscle: muscle,
    secondary_muscles: secondary,
    bench_angle: angle,
    required_equipment: equip,
    unlock_tier: tier,
    unlock_level: lvl,
    unlock_criteria: criteria,
    target_duration_mins: dur,
    default_sets: sets,
    default_reps_min: rMin,
    default_reps_max: rMax,
    default_rest_seconds: rest,
    instructions: inst,
    form_cues: cues,
    common_mistakes: mistakes,
    alternatives: alts,
    demo_steps: demos
  };
}

// 1. Load Monday Legs
const monLegs = [
  ["ex-goblet-squat", "Goblet Dumbbell Squat", "Monday", 1, "Quadriceps & Glutes", ["Core", "Calves"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 4, 8, 12, 90, 8,
   ["Stand shoulder-width apart, flare toes 20° outward.", "Hold dumbbell vertically against upper chest with palms under the top plate.", "Inhale deep into belly, push hips backward and bend knees until thighs hit parallel.", "Drive through midfoot, exhale forcefully at top lockout."],
   ["Chest tall and proud", "Spread the floor with feet", "Knees track over second toe"],
   ["Knees collapsing inward (valgus)", "Rounding lower back at bottom", "Heels lifting off ground"],
   ["Dumbbell Front Squat", "Dumbbell Sumo Squat"],
   [
     { step: 1, title: "Torso & Horn Grip", description: "Cup dumbbell against sternum like a goblet, elbows tucked tight to ribs.", coachTip: "Maintain proud ribcage." },
     { step: 2, title: "The Descent", description: "Hinge hips slightly back then drop straight down between heels.", coachTip: "Inhale and brace core." },
     { step: 3, title: "Concentric Drive", description: "Push the ground away to return to full upright lockout.", coachTip: "Squeeze glutes at top." }
   ]
  ],
  ["ex-db-front-squat", "Dumbbell Front Squat", "Monday", 2, "Quadriceps & Core", ["Upper Back", "Glutes"], "Floor / Standing", "dumbbells", "Recruit", 2, "Recruit Stage II", 4, 8, 10, 90, 8,
   ["Rest two dumbbells on front shoulders with elbows pointing forward.", "Keep torso completely upright as you descend into a deep squat.", "Drive up through heels while keeping elbows lifted."],
   ["Elbows high throughout", "Sit between your heels"],
   ["Dropping elbows forward", "Excessive forward torso pitch"],
   ["Goblet Dumbbell Squat", "Dumbbell Sumo Squat"],
   [
     { step: 1, title: "Front Rack Anchor", description: "Rest heads of dumbbells on deltoids.", coachTip: "Elbows up parallel to floor." },
     { step: 2, title: "Deep Knee Flexion", description: "Squat down with vertical torso angle.", coachTip: "Deep breath in on descent." },
     { step: 3, title: "Quad Drive", description: "Drive vertically to lockout.", coachTip: "Exhale through teeth at top." }
   ]
  ],
  ["ex-db-sumo-squat", "Dumbbell Sumo Squat", "Monday", 3, "Adductors & Glutes", ["Quadriceps", "Hamstrings"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 3, 10, 15, 75, 7,
   ["Take a wide stance (1.5x shoulder width) with toes angled 45° outward.", "Hold single dumbbell hanging straight down between legs.", "Squat straight down, pushing knees wide along toe angle.", "Squeeze inner thighs and glutes to return to stand."],
   ["Knees wide and flared", "Vertical pelvis descent"],
   ["Leaning forward excessively", "Knees caving inwards"],
   ["Goblet Dumbbell Squat", "Dumbbell Lateral Lunge"],
   [
     { step: 1, title: "Wide Stance", description: "Set feet wide, toes flared 45 degrees.", coachTip: "Dumbbell hangs perpendicular." },
     { step: 2, title: "Adductor Descent", description: "Drop hips straight down, knees opening wide.", coachTip: "Feel inner thigh stretch." },
     { step: 3, title: "Glute Lockout", description: "Drive up and contract glutes forcefully.", coachTip: "Do not hyperextend spine." }
   ]
  ],
  ["ex-db-rdl", "Dumbbell Romanian Deadlift (RDL)", "Monday", 4, "Hamstrings & Glutes", ["Erectors", "Grip", "Forearms"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 4, 8, 12, 90, 8,
   ["Hold two dumbbells against front of thighs with soft, unlocked knees.", "Push hips backward as if trying to touch the wall behind you.", "Lower dumbbells grazing along shins until hamstrings reach peak stretch.", "Drive hips forward by contracting glutes and hamstrings to return to standing."],
   ["Push butt backward", "Shins remain vertical", "Keep dumbbells tight to legs"],
   ["Rounding the lumbar spine", "Squatting down instead of hip hinging", "Letting dumbbells drift away"],
   ["Single-Leg Romanian Deadlift", "Dumbbell Good Morning"],
   [
     { step: 1, title: "The Hinge Setup", description: "Stand tall, soft knees, shoulder blades packed.", coachTip: "Look 6 feet ahead on floor." },
     { step: 2, title: "Posterior Glide", description: "Slide hips back as dumbbells shave shins.", coachTip: "Stop when hips stop moving back." },
     { step: 3, title: "Hip Extension", description: "Drive hips forward into the dumbbells.", coachTip: "Exhale and lock glutes." }
   ]
  ],
  ["ex-db-stiff-leg-dl", "Dumbbell Stiff-Leg Deadlift", "Monday", 5, "Hamstrings (Lower/Tendon)", ["Glutes", "Lower Back"], "Floor / Standing", "dumbbells", "Warrior", 10, "Warrior Rank Hinge Mastery", 3, 10, 12, 90, 7,
   ["Keep knees nearly straight with minimal micro-bend.", "Hinge at the hips, keeping back flat as weights descend lower toward ankles.", "Feel intense loaded stretch in hamstrings before reversing."],
   ["Knees almost locked but not hyperextended", "Focus on hamstring stretch"],
   ["Rounding thoracic or lumbar spine", "Jerking the weights at the bottom"],
   ["Dumbbell Romanian Deadlift (RDL)", "Single-Leg Romanian Deadlift"],
   [
     { step: 1, title: "Fixed Knee Angle", description: "Set minimal micro-bend in knees and lock the joint angle.", coachTip: "Neutral neck." },
     { step: 2, title: "Deep Stretch Descent", description: "Hinge pure at hips down to mid-shin.", coachTip: "Inhale controlled." },
     { step: 3, title: "Hamstring Pull", description: "Pull torso upright purely with hamstrings.", coachTip: "Smooth steady tempo." }
   ]
  ],
  ["ex-db-reverse-lunge", "Dumbbell Reverse Lunge", "Monday", 6, "Quadriceps & Glutes", ["Calves", "Core"], "Floor / Standing", "dumbbells", "Recruit", 2, "Recruit Stage II", 3, 10, 12, 75, 7,
   ["Hold dumbbells at sides.", "Take a controlled step backward and lower back knee until it hovers 1 inch above floor.", "Front shin stays vertical.", "Push through front heel to step back forward."],
   ["Soft landing with rear foot", "Front heel firmly planted", "Torso upright"],
   ["Slamming rear knee into floor", "Forward knee pushing past toes uncontrollably"],
   ["Dumbbell Forward Lunge", "Bulgarian Split Squat"],
   [
     { step: 1, title: "Backward Step", description: "Step back smoothly onto ball of rear foot.", coachTip: "Keep hips square." },
     { step: 2, title: "Double 90° Bend", description: "Lower until front and rear knees form 90 degrees.", coachTip: "Back knee hovers." },
     { step: 3, title: "Front Leg Drive", description: "Power forward through front midfoot.", coachTip: "Exhale to stand." }
   ]
  ],
  ["ex-db-forward-lunge", "Dumbbell Forward Lunge", "Monday", 7, "Quadriceps & Deceleration", ["Glutes", "Calves"], "Floor / Standing", "dumbbells", "Initiate", 5, "Initiate Rank Unlocked", 3, 10, 12, 75, 7,
   ["Step forward with dumbbells at sides.", "Decelerate smoothly and bend both knees.", "Push explosively off the front heel to return to start."],
   ["Control the landing", "Abs braced tight"],
   ["Stomping forward foot", "Torso collapsing forward"],
   ["Dumbbell Reverse Lunge", "Dumbbell Walking Lunge"],
   [
     { step: 1, title: "Lunge Entry", description: "Step forward cleanly.", coachTip: "Brace core." },
     { step: 2, title: "Braking Phase", description: "Absorb impact through quadriceps.", coachTip: "Stay centered." },
     { step: 3, title: "Push Back", description: "Explode off lead heel back to starting stance.", coachTip: "Drive cleanly." }
   ]
  ],
  ["ex-db-walking-lunge", "Dumbbell Walking Lunge", "Monday", 8, "Total Leg Hypertrophy", ["Glutes", "Hamstrings", "Calves"], "Floor / Standing", "dumbbells", "Initiate", 7, "Initiate Dynamic Legs", 3, 12, 16, 90, 8,
   ["Step forward continuously, alternating legs with each stride.", "Maintain steady fluid pace without rushing.", "Keep dumbbells steady at sides without swinging."],
   ["Continuous forward motion", "Knees track over toes"],
   ["Swinging dumbbells for momentum", "Short shallow strides"],
   ["Dumbbell Reverse Lunge", "Dumbbell Step-Up"],
   [
     { step: 1, title: "Lead Step", description: "Step forward into lunge.", coachTip: "Torso tall." },
     { step: 2, title: "Transition", description: "Drive directly through front heel into the next stride.", coachTip: "Seamless movement." },
     { step: 3, title: "Stride Rhythm", description: "Continue smoothly alternating legs.", coachTip: "Keep dumbbells silent." }
   ]
  ],
  ["ex-bulgarian-split-squat", "Bulgarian Split Squat", "Monday", 9, "Quadriceps & Glute Isolation", ["Adductors", "Core Balance"], "Flat", "bench_and_dumbbells", "Initiate", 5, "Initiate Rank Bench Unlocked", 3, 8, 12, 90, 8,
   ["Place rear foot laces-down on flat bench behind you.", "Lower hips down and slightly back until front thigh is parallel to floor.", "Push aggressively through front heel to return to top."],
   ["Front shin vertical", "Lean slightly forward to bias glutes", "Deep hip flexion"],
   ["Pushing off rear foot instead of front leg", "Front heel lifting off floor"],
   ["Static Split Squat", "Dumbbell Reverse Lunge"],
   [
     { step: 1, title: "Bench Placement", description: "Rest rear shoelaces on flat bench.", coachTip: "Find comfortable stride length." },
     { step: 2, title: "Descent", description: "Lower straight down until front thigh is parallel.", coachTip: "Front knee tracks toe." },
     { step: 3, title: "Drive", description: "Push directly through front midfoot to stand.", coachTip: "Exhale through teeth." }
   ]
  ],
  ["ex-static-split-squat", "Static Split Squat", "Monday", 10, "Quadriceps & Hip Flexors", ["Glutes", "Balance"], "Floor / Standing", "dumbbells", "Recruit", 3, "Recruit Stage III", 3, 10, 12, 75, 7,
   ["Set feet in stationary staggered split stance.", "Perform all reps on one leg before switching, without moving feet between reps."],
   ["Both feet stay anchored", "Even weight distribution"],
   ["Shifting feet between reps", "Front knee caving inward"],
   ["Bulgarian Split Squat", "Dumbbell Reverse Lunge"],
   [
     { step: 1, title: "Split Anchor", description: "Set wide split stance on floor.", coachTip: "Feet stay glued." },
     { step: 2, title: "Vertical Reps", description: "Pump reps up and down smoothly.", coachTip: "Smooth rhythm." },
     { step: 3, title: "Side Switch", description: "Complete sets on both legs.", coachTip: "Equal intensity." }
   ]
  ],
  ["ex-db-step-up", "Dumbbell Step-Up", "Monday", 11, "Glute & Quad Power", ["Calves", "Core"], "Flat", "bench_and_dumbbells", "Recruit", 3, "Recruit Bench Agility", 3, 10, 12, 75, 7,
   ["Place entire foot on flat bench.", "Drive through top foot to stand atop bench.", "Lower back down with controlled 2-second negative."],
   ["Lead leg does 90% of the work", "Do not jump off bottom foot"],
   ["Bouncing off bottom toe", "Incomplete hip extension at top"],
   ["Bulgarian Split Squat", "Dumbbell Forward Lunge"],
   [
     { step: 1, title: "Bench Footing", description: "Plant entire foot on bench surface.", coachTip: "No heel hanging." },
     { step: 2, title: "Top Leg Lift", description: "Stand up without jumping off back foot.", coachTip: "Feel top quad/glute." },
     { step: 3, title: "Slow Descent", description: "Step down softly.", coachTip: "Control the negative." }
   ]
  ],
  ["ex-lateral-lunge", "Dumbbell Lateral Lunge", "Monday", 12, "Adductors & Glute Medius", ["Quadriceps", "Mobility"], "Floor / Standing", "dumbbells", "Initiate", 6, "Initiate Frontal Plane", 3, 10, 12, 75, 7,
   ["Step wide to the side, pushing hips backward as you bend the stepping knee.", "Keep non-stepping leg completely straight.", "Push off side heel to return to center."],
   ["Trail leg straight", "Hips push back like a squat on one side"],
   ["Bent knee collapsing inward", "Torso twisting sideways"],
   ["Dumbbell Sumo Squat", "Goblet Dumbbell Squat"],
   [
     { step: 1, title: "Side Step", description: "Step wide to lateral side.", coachTip: "Keep toes pointing forward." },
     { step: 2, title: "Lateral Hinge", description: "Sink hips back on stepping leg.", coachTip: "Trail leg locked straight." },
     { step: 3, title: "Center Push", description: "Push off outside foot back to start.", coachTip: "Brisk return." }
   ]
  ],
  ["ex-db-glute-bridge", "Dumbbell Glute Bridge", "Monday", 13, "Gluteus Maximus", ["Hamstrings", "Core"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 3, 12, 15, 60, 6,
   ["Lie on back with knees bent, feet flat.", "Rest dumbbell securely across hips.", "Drive through heels to lift hips until thighs and torso align.", "Squeeze glutes hard for 2 seconds at top."],
   ["Ribs pinned down", "Squeeze glutes, do not arch lower back"],
   ["Overarching lumbar spine", "Driving through toes"],
   ["Dumbbell Hip Thrust", "Single-Leg Glute Bridge"],
   [
     { step: 1, title: "Floor Setup", description: "Lie supine, knees at 90°, dumbbell on hip crease.", coachTip: "Brace abs." },
     { step: 2, title: "Hip Lift", description: "Bridge hips upward into lockout.", coachTip: "Drive heels into floor." },
     { step: 3, title: "Glute Peak", description: "Hold contraction 2 seconds.", coachTip: "Exhale fully." }
   ]
  ],
  ["ex-db-hip-thrust", "Dumbbell Hip Thrust", "Monday", 14, "Glute Peak Hypertrophy", ["Hamstrings", "Core"], "Flat", "bench_and_dumbbells", "Initiate", 5, "Initiate Bench Glute Power", 4, 10, 12, 90, 8,
   ["Anchor upper shoulder blades against flat bench edge.", "Place heavy dumbbell across pelvis.", "Lower hips toward floor then thrust upward until torso and thighs form a flat bridge."],
   ["Chin tucked to chest", "Drive through heels", "Full hip extension"],
   ["Looking at ceiling (lumbar hyperextension)", "Incomplete lockout"],
   ["Dumbbell Glute Bridge", "Single-Leg Glute Bridge"],
   [
     { step: 1, title: "Bench Anchor", description: "Rest mid-scapula on edge of bench.", coachTip: "Chin tucked down." },
     { step: 2, title: "Thrust", description: "Drive hips skyward through heels.", coachTip: "Squeeze glutes violently." },
     { step: 3, title: "Horizontal Tabletop", description: "Hold flat bridge position.", coachTip: "Exhale at peak." }
   ]
  ],
  ["ex-single-leg-glute-bridge", "Single-Leg Glute Bridge", "Monday", 15, "Glute Unilateral Balance", ["Hamstrings", "Lower Back"], "Floor / Standing", "bodyweight", "Recruit", 2, "Recruit Balance", 3, 12, 15, 60, 6,
   ["Lie on floor with one knee bent and other leg extended straight.", "Drive through working heel to lift pelvis.", "Keep hips level and square throughout."],
   ["Hips stay parallel to ceiling", "Intense unilateral glute contraction"],
   ["Hips tilting to one side", "Pushing through neck or shoulders"],
   ["Dumbbell Glute Bridge", "Dumbbell Hip Thrust"],
   [
     { step: 1, title: "Single Leg Anchor", description: "One foot flat on floor, opposite leg floating.", coachTip: "Keep pelvis level." },
     { step: 2, title: "One-Leg Bridge", description: "Press working heel down to elevate hips.", coachTip: "Pure glute focus." },
     { step: 3, title: "Level Top", description: "Hold level at top for 1 count.", coachTip: "Lower under control." }
   ]
  ],
  ["ex-standing-db-calf-raise", "Standing Dumbbell Calf Raise", "Monday", 16, "Gastrocnemius (Calves)", ["Tibialis", "Ankles"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 4, 15, 20, 60, 6,
   ["Hold dumbbells at sides with balls of feet on a raised plate rim.", "Lower heels down into deep stretch.", "Press onto big toes to raise as high as possible, holding peak for 1 second."],
   ["Full stretch at bottom", "Pause 1 second at top contraction"],
   ["Bouncing through Achilles tendon", "Rolling onto pinky toes"],
   ["Single-Leg Calf Raise", "Seated Dumbbell Calf Raise"],
   [
     { step: 1, title: "Plate Edge Setup", description: "Balls of feet on plate edge, heels hanging.", coachTip: "Hold dumbbells steady." },
     { step: 2, title: "Deep Stretch", description: "Drop heels below plate rim.", coachTip: "Feel deep calf stretch." },
     { step: 3, title: "High Peak", description: "Rise onto balls of feet, contracting calves.", coachTip: "Squeeze 1s." }
   ]
  ],
  ["ex-single-leg-calf-raise", "Single-Leg Calf Raise", "Monday", 17, "Calf Unilateral Strength", ["Ankles", "Balance"], "Floor / Standing", "dumbbells", "Initiate", 5, "Initiate Ankle Stability", 3, 15, 20, 60, 6,
   ["Hold one dumbbell in hand on working side.", "Perform high-range calf raises on a single foot.", "Control the tempo strictly (3s down, 1s hold, 1s up)."],
   ["Strict slow tempo", "No momentum bouncing"],
   ["Rushing the reps", "Bent knee"],
   ["Standing Dumbbell Calf Raise", "Seated Dumbbell Calf Raise"],
   [
     { step: 1, title: "Single Foot Anchor", description: "Balance on ball of one foot.", coachTip: "Light hand touch for balance." },
     { step: 2, title: "Controlled Reps", description: "Lower into stretch, rise to ceiling.", coachTip: "Strict control." },
     { step: 3, title: "Peak Squeeze", description: "Contract calf muscle hard.", coachTip: "No bouncing." }
   ]
  ],
  ["ex-seated-db-calf-raise", "Seated Dumbbell Calf Raise", "Monday", 18, "Soleus (Deep Calf Muscle)", ["Ankle Stabilizers"], "Seated 90°", "bench_and_dumbbells", "Recruit", 2, "Recruit Soleus Focus", 4, 15, 20, 60, 6,
   ["Sit tall on bench set to 90° with knees at 90° angle.", "Place dumbbells across knees with balls of feet on floor/plate.", "Raise heels high to work the deep soleus muscle."],
   ["Soleus activates with bent knee", "Keep dumbbells balanced over knees"],
   ["Slouching torso", "Cutting the range of motion short"],
   ["Standing Dumbbell Calf Raise", "Single-Leg Calf Raise"],
   [
     { step: 1, title: "Seated Setup", description: "Sit on 90° bench, dumbbells resting on knees.", coachTip: "Feet on edge." },
     { step: 2, title: "Heel Drop", description: "Drop heels into deep stretch.", coachTip: "Bent knee isolates soleus." },
     { step: 3, title: "Soleus Push", description: "Push onto toes to maximum height.", coachTip: "Hard squeeze." }
   ]
  ],
  ["ex-db-good-morning", "Dumbbell Good Morning", "Monday", 19, "Hamstrings & Spinal Erectors", ["Glutes", "Core"], "Floor / Standing", "dumbbells", "Warrior", 12, "Warrior Posterior Chain", 3, 10, 12, 75, 7,
   ["Hold single dumbbell horizontally across upper chest.", "Hinge backward at hips with flat spine and soft knees.", "Lower torso to near-parallel to floor, then contract hamstrings to return to stand."],
   ["Keep spine completely rigid", "Push hips far behind you"],
   ["Rounding the lower back", "Bending knees excessively into a squat"],
   ["Dumbbell Romanian Deadlift (RDL)", "Single-Leg Romanian Deadlift"],
   [
     { step: 1, title: "Chest Hug", description: "Hold dumbbell firm against upper chest.", coachTip: "Shoulders packed." },
     { step: 2, title: "Pure Hinge", description: "Hinge hips straight back with flat back.", coachTip: "Feel hamstrings load." },
     { step: 3, title: "Hamstring Snap", description: "Contract glutes and hamstrings to return upright.", coachTip: "Lock hips." }
   ]
  ],
  ["ex-single-leg-rdl", "Single-Leg Romanian Deadlift", "Monday", 20, "Hamstring & Hip Balance", ["Glute Medius", "Foot Arch", "Core"], "Floor / Standing", "dumbbells", "Warrior", 15, "Warrior Balance Mastery", 3, 8, 10, 75, 7,
   ["Hold single dumbbell in hand opposite working leg.", "Hinge forward while extending non-working leg straight behind you in line with torso.", "Touch dumbbell toward mid-shin, then drive working hip forward."],
   ["Torso and back leg form straight line", "Square hips to floor, do not rotate open"],
   ["Letting non-working hip flare open", "Rounding upper spine"],
   ["Dumbbell Romanian Deadlift (RDL)", "Dumbbell Good Morning"],
   [
     { step: 1, title: "Single Leg Setup", description: "Stand on one foot, soft knee, dumbbell opposite side.", coachTip: "Lock core." },
     { step: 2, title: "Airplane Hinge", description: "Hinge forward as rear leg elevates like a see-saw.", coachTip: "Keep hips square." },
     { step: 3, title: "Hip Power", description: "Drive through standing foot to stand tall.", coachTip: "Exhale clean." }
   ]
  ]
];

monLegs.forEach(item => allExercises.push(makeEx(...item)));
console.log("Loaded Monday Legs: 20 movements.");

// 2. Load Tuesday Chest
const tueChest = [
  ["ex-flat-db-press", "Flat Dumbbell Bench Press", "Tuesday", 1, "Pectoralis Major (Mid)", ["Triceps", "Front Delts"], "Flat", "bench_and_dumbbells", "Recruit", 1, "Awakening Foundation", 4, 8, 12, 90, 8,
   ["Lie back on flat bench, dumbbells held at chest level with neutral wrists.", "Drive feet into floor, retract scapulae firmly into the pad.", "Press dumbbells up in a slight inward arc without clanking at top.", "Lower with 3-second controlled eccentric to nipple line."],
   ["Shoulder blades pinched tight", "Elbows tucked 45-60 degrees", "Wrists stacked above elbows"],
   ["Elbows flaring 90 degrees out", "Shoulders rolling forward off bench at top", "Bouncing weights off chest"],
   ["Dumbbell Floor Press", "Incline Dumbbell Bench Press"],
   [
     { step: 1, title: "Bench Lock Setup", description: "Retract and depress shoulder blades into bench.", coachTip: "Firm leg drive." },
     { step: 2, title: "Inward Arc Press", description: "Press dumbbells up and slightly inward over sternum.", coachTip: "Squeeze pecs at lockout." },
     { step: 3, title: "Controlled Stretch", description: "Lower down slowly until dumbbell handles reach chest level.", coachTip: "Deep inhale." }
   ]
  ],
  ["ex-incline-db-press", "Incline Dumbbell Bench Press (30°)", "Tuesday", 2, "Upper Pectoralis (Clavicular)", ["Front Delts", "Triceps"], "Incline 30°", "bench_and_dumbbells", "Recruit", 2, "Recruit Stage II", 4, 8, 12, 90, 8,
   ["Set 20-in-1 bench to 30° incline.", "Press dumbbells upward over upper chest with tucked elbows.", "Lower until dumbbells touch upper clavicle line."],
   ["Bench at 30° not 60°", "Keep chest puffed out"],
   ["Bench too steep (turns into shoulder press)", "Arching lower back off bench"],
   ["High Incline Dumbbell Bench Press", "Flat Dumbbell Bench Press"],
   [
     { step: 1, title: "Incline Position", description: "Lie against 30° backrest, feet planted.", coachTip: "Shoulder blades pinned." },
     { step: 2, title: "Upper Pec Drive", description: "Press upward over collarbones.", coachTip: "Exhale through teeth." },
     { step: 3, title: "Deep Stretch", description: "Lower smoothly with elbows at 45°.", coachTip: "Feel upper chest stretch." }
   ]
  ],
  ["ex-decline-db-press", "Decline Dumbbell Bench Press", "Tuesday", 3, "Lower Pectoralis", ["Triceps"], "Decline", "bench_and_dumbbells", "Warrior", 10, "Warrior Bench Mastery", 3, 10, 12, 75, 7,
   ["Set 20-in-1 bench to decline angle with leg anchors.", "Press dumbbells vertically over lower sternum.", "Lower to lower chest border."],
   ["Tuck chin slightly", "Drive through lower pecs"],
   ["Letting dumbbells drift toward face", "Rushing the lowering phase"],
   ["Dumbbell Floor Press", "Flat Dumbbell Bench Press"],
   [
     { step: 1, title: "Decline Anchor", description: "Secure legs on decline bench.", coachTip: "Grip handles firm." },
     { step: 2, title: "Lower Pec Line", description: "Press over bottom border of chest.", coachTip: "Control path." },
     { step: 3, title: "Pec Squeeze", description: "Squeeze lower chest hard.", coachTip: "Smooth cadence." }
   ]
  ],
  ["ex-flat-db-fly", "Flat Dumbbell Fly", "Tuesday", 4, "Pectoralis Stretch & Adduction", ["Anterior Deltoids"], "Flat", "bench_and_dumbbells", "Recruit", 3, "Recruit Stage III", 3, 10, 15, 75, 7,
   ["Lie flat holding dumbbells over chest with slight elbow bend (15°).", "Lower arms wide to sides in hugging arc until deep chest stretch is felt.", "Squeeze pecs to bring dumbbells back together over chest."],
   ["Lock elbow angle fixed", "Imagine hugging a massive tree"],
   ["Straightening elbows (straining bicep tendon)", "Dropping elbows below bench plane"],
   ["Incline Dumbbell Fly", "Dumbbell Squeeze Press"],
   [
     { step: 1, title: "Elbow Arch Lock", description: "Micro-bend elbows and lock the angle.", coachTip: "Wrists neutral." },
     { step: 2, title: "Wide Arc", description: "Open arms wide like wings.", coachTip: "Deep inhale." },
     { step: 3, title: "Pec Hug", description: "Squeeze dumbbells together using inner pecs.", coachTip: "Exhale at top." }
   ]
  ],
  ["ex-incline-db-fly", "Incline Dumbbell Fly (30°)", "Tuesday", 5, "Upper Pectoralis Adduction", ["Anterior Deltoids"], "Incline 30°", "bench_and_dumbbells", "Initiate", 5, "Initiate Chest Fly", 3, 10, 12, 75, 7,
   ["Set bench to 30°.", "Open arms wide maintaining slight elbow bend.", "Bring dumbbells together over eye line, squeezing upper chest."],
   ["Feel loaded stretch in collarbone region", "Smooth cadence"],
   ["Dropping weights too fast", "Collapsing elbows"],
   ["Flat Dumbbell Fly", "Incline Dumbbell Bench Press"],
   [
     { step: 1, title: "Incline Arc", description: "Set bench at 30°, arms extended.", coachTip: "Pack scapula." },
     { step: 2, title: "Eccentric Opening", description: "Open wide horizontally.", coachTip: "Inhale controlled." },
     { step: 3, title: "Peak Adduction", description: "Squeeze pecs to bring weights together.", coachTip: "Contract upper pecs." }
   ]
  ],
  ["ex-db-floor-press", "Dumbbell Floor Press", "Tuesday", 6, "Pectoralis & Triceps Lockout", ["Anterior Deltoid"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 3, 8, 12, 75, 7,
   ["Lie on floor with knees bent and feet flat.", "Press dumbbells up to arms length.", "Lower until triceps lightly touch the floor, pause 1 second to eliminate stretch reflex, then press up."],
   ["Dead stop on floor eliminates shoulder impingement", "Drive elbows through floor"],
   ["Bouncing triceps off floor violently", "Lifting hips into bridge"],
   ["Flat Dumbbell Bench Press", "Neutral-Grip Dumbbell Press"],
   [
     { step: 1, title: "Floor Anchor", description: "Lie supine on mat, feet flat, dumbbells over chest.", coachTip: "Back flat." },
     { step: 2, title: "Dead Stop", description: "Lower until upper arms rest on floor.", coachTip: "Hold 1 second pause." },
     { step: 3, title: "Explosive Push", description: "Press up explosively off floor.", coachTip: "Lock pecs." }
   ]
  ],
  ["ex-neutral-grip-db-press", "Neutral-Grip Dumbbell Press", "Tuesday", 7, "Pectoralis Major & Shoulder Joint Health", ["Triceps"], "Flat", "bench_and_dumbbells", "Recruit", 2, "Recruit Joint Health", 3, 8, 12, 75, 7,
   ["Lie on bench with palms facing each other (neutral grip).", "Lower dumbbells alongside ribs with elbows tucked tight to torso.", "Press upward, focusing on chest squeeze without shoulder strain."],
   ["Palms face each other throughout", "Shoulder-friendly pressing path"],
   ["Flaring elbows outward", "Loose grip on handles"],
   ["Flat Dumbbell Bench Press", "Dumbbell Squeeze Press"],
   [
     { step: 1, title: "Parallel Grip", description: "Palms facing inwards toward ribs.", coachTip: "Shoulders retracted." },
     { step: 2, title: "Tucked Descent", description: "Lower handles grazing close to ribcage.", coachTip: "Zero shoulder pain." },
     { step: 3, title: "Vertical Drive", description: "Press straight up to lockout.", coachTip: "Exhale smoothly." }
   ]
  ],
  ["ex-db-squeeze-press", "Dumbbell Squeeze Press (Hex Press)", "Tuesday", 8, "Inner Pectoralis Contraction", ["Triceps", "Front Delts"], "Flat", "bench_and_dumbbells", "Initiate", 6, "Initiate Pec Density", 3, 10, 12, 60, 6,
   ["Press two dumbbells together at their flat inner faces directly over your chest.", "Keep squeezing them together forcefully as you lower to sternum and press back to top."],
   ["Crush dumbbells together with maximum force", "Constant inward tension"],
   ["Allowing dumbbells to separate apart", "Rushing through the movement"],
   ["Neutral-Grip Dumbbell Press", "Flat Dumbbell Fly"],
   [
     { step: 1, title: "The Clamp", description: "Press plates together tightly over sternum.", coachTip: "Constant inward pressure." },
     { step: 2, title: "Tension Descent", description: "Lower to chest while maintaining crushing force.", coachTip: "Inhale steady." },
     { step: 3, title: "Peak Clamp", description: "Press to arms length while crushing handles.", coachTip: "Maximum pec squeeze." }
   ]
  ],
  ["ex-single-arm-floor-press", "Single-Arm Dumbbell Floor Press", "Tuesday", 9, "Unilateral Chest & Anti-Rotational Core", ["Core Obliques", "Triceps"], "Floor / Standing", "dumbbells", "Warrior", 10, "Warrior Core Press", 3, 10, 12, 60, 6,
   ["Lie on floor with dumbbell in one hand, non-working hand resting on belly.", "Press dumbbell while bracing core to prevent torso from rolling toward the weight."],
   ["Keep both shoulder blades pinned flat", "Strict core engagement"],
   ["Torso tilting toward loaded side", "Shifting feet"],
   ["Dumbbell Floor Press", "Alternating Dumbbell Bench Press"],
   [
     { step: 1, title: "Anti-Rotation Setup", description: "Hold single dumbbell on one side.", coachTip: "Pin both hips flat." },
     { step: 2, title: "Single Side Press", description: "Press up while fighting rotational force.", coachTip: "Core locked." },
     { step: 3, title: "Controlled Floor Touch", description: "Lower elbow to floor lightly.", coachTip: "Repeat on both sides." }
   ]
  ],
  ["ex-db-pullover", "Dumbbell Pullover", "Tuesday", 10, "Serratus Anterior & Upper Ribcage", ["Lats", "Triceps Long Head"], "Flat", "bench_and_dumbbells", "Initiate", 7, "Initiate Ribcage Expansion", 3, 10, 12, 75, 7,
   ["Lie perpendicular across flat bench with only upper shoulders supported.", "Hold single dumbbell with diamond grip overhead.", "Lower dumbbell backward behind head in gentle arc until deep ribcage stretch is felt.", "Pull back over face using pecs and lats."],
   ["Keep hips slightly dropped", "Soft elbow bend throughout"],
   ["Bending elbows excessively (turns into triceps extension)", "Overstretching beyond shoulder comfort"],
   ["Flat Dumbbell Fly", "Incline Dumbbell Fly"],
   [
     { step: 1, title: "Diamond Grip Setup", description: "Palms cup under top plate of dumbbell over eyes.", coachTip: "Hips level." },
     { step: 2, title: "Overhead Arc", description: "Lower dumbbell behind head in controlled arc.", coachTip: "Deep inhale into ribs." },
     { step: 3, title: "Pec Pull", description: "Pull dumbbell back to vertical position.", coachTip: "Exhale through teeth." }
   ]
  ],
  ["ex-standard-pushup", "Standard Strict Push-Up", "Tuesday", 11, "Pectoralis & Kinetic Chain", ["Triceps", "Anterior Delts", "Core"], "Floor / Standing", "bodyweight", "Recruit", 1, "Awakening Foundation", 3, 12, 20, 60, 6,
   ["Hands slightly wider than shoulders, body in rigid plank from head to heels.", "Lower until chest is 1 inch off floor with elbows at 45°.", "Push the ground away to return to top."],
   ["Body as straight as a steel rod", "Full range of motion"],
   ["Sagging lower back (banana back)", "Flaring elbows to 90 degrees", "Head bobbing instead of chest reaching floor"],
   ["Incline Push-Up", "Knee Push-Up"],
   [
     { step: 1, title: "Plank Alignment", description: "Hands under shoulders, glutes and abs squeezed tight.", coachTip: "Neutral neck." },
     { step: 2, title: "Chest to Floor", description: "Lower entire body in unison until chest hovers above floor.", coachTip: "Inhale down." },
     { step: 3, title: "Floor Push", description: "Drive palms into ground to full arm lockout.", coachTip: "Exhale sharp." }
   ]
  ],
  ["ex-incline-pushup", "Incline Push-Up (Hands on Bench)", "Tuesday", 12, "Lower Pectoralis (Beginner/Burnout)", ["Triceps", "Core"], "Flat", "bench_and_dumbbells", "Recruit", 1, "Awakening Foundation", 3, 12, 15, 60, 5,
   ["Place hands on flat bench edge, feet back on floor in plank.", "Lower chest to touch bench edge, then press back up."],
   ["Ideal for volume burnouts and beginners", "Keep body rigid"],
   ["Piking hips upward", "Sagging belly"],
   ["Standard Strict Push-Up", "Knee Push-Up"],
   [
     { step: 1, title: "Bench Hands Setup", description: "Hands shoulder-width on bench pad.", coachTip: "Plank posture." },
     { step: 2, title: "Pad Touch", description: "Lower sternum to graze bench.", coachTip: "Controlled speed." },
     { step: 3, title: "Press Away", description: "Lock arms cleanly.", coachTip: "Consistent cadence." }
   ]
  ],
  ["ex-decline-pushup", "Decline Push-Up (Feet on Bench)", "Tuesday", 13, "Upper Pectoralis & Clavicular Head", ["Anterior Delts", "Triceps"], "Flat", "bench_and_dumbbells", "Initiate", 5, "Initiate Bodyweight Upper Pec", 3, 10, 15, 75, 7,
   ["Place toes on flat bench with hands on floor below shoulders.", "Lower until nose and chest hover above floor, then press up."],
   ["Shifts bodyweight directly onto upper pecs", "Brace core hard"],
   ["Arching lower spine", "Flaring elbows wide"],
   ["Incline Dumbbell Bench Press", "Standard Strict Push-Up"],
   [
     { step: 1, title: "Feet Elevated", description: "Place toes on bench surface, hands on mat.", coachTip: "Tight abs." },
     { step: 2, title: "Deep Upper Angle", description: "Lower chest between hands.", coachTip: "Feel upper chest load." },
     { step: 3, title: "Drive", description: "Press floor away forcefully.", coachTip: "Exhale at peak." }
   ]
  ],
  ["ex-knee-pushup", "Knee Push-Up", "Tuesday", 14, "Pectoralis Foundation", ["Triceps"], "Floor / Standing", "bodyweight", "Recruit", 1, "Awakening Foundation", 3, 10, 15, 60, 5,
   ["Set knees on mat, hands under shoulders, torso straight from knees to head.", "Perform controlled push-ups to build pressing strength."],
   ["Straight line from knees to crown", "Full depth"],
   ["Piking butt backward", "Cutting depth short"],
   ["Incline Push-Up", "Standard Strict Push-Up"],
   [
     { step: 1, title: "Knee Base", description: "Knees on mat, torso straight.", coachTip: "Pivoting from knees." },
     { step: 2, title: "Full Depth", description: "Lower chest to floor.", coachTip: "Smooth negative." },
     { step: 3, title: "Lockout", description: "Press to arm extension.", coachTip: "Good tempo." }
   ]
  ],
  ["ex-wide-grip-pushup", "Wide-Grip Push-Up", "Tuesday", 15, "Outer Pectoralis Stretch", ["Anterior Delts"], "Floor / Standing", "bodyweight", "Recruit", 3, "Recruit Pec Stretch", 3, 10, 15, 60, 6,
   ["Place hands 1.5x shoulder width apart.", "Lower chest deeply into stretch, then press up."],
   ["Focus on outer pec stretch", "Maintain elbow control"],
   ["Over-flaring elbows beyond comfort", "Sagging neck"],
   ["Standard Strict Push-Up", "Flat Dumbbell Fly"],
   [
     { step: 1, title: "Wide Base", description: "Hands wide on floor.", coachTip: "Fingers slightly angled out." },
     { step: 2, title: "Stretch Drop", description: "Lower chest smoothly.", coachTip: "Feel outer pecs stretch." },
     { step: 3, title: "Pec Squeeze", description: "Drive up through palm heels.", coachTip: "Exhale." }
   ]
  ],
  ["ex-close-grip-pushup", "Close-Grip Push-Up", "Tuesday", 16, "Inner Pectoralis & Triceps", ["Triceps Medial Head"], "Floor / Standing", "bodyweight", "Initiate", 5, "Initiate Inner Pec", 3, 8, 12, 60, 6,
   ["Place hands shoulder-width or slightly narrower.", "Lower with elbows grazing ribs, pressing through palm heels."],
   ["Keep elbows pinned tight to ribcage", "Inner chest and triceps focus"],
   ["Elbows flaring out", "Spine sagging"],
   ["Standard Strict Push-Up", "Diamond Push-Up"],
   [
     { step: 1, title: "Narrow Stance", description: "Hands 8-10 inches apart under sternum.", coachTip: "Tight core." },
     { step: 2, title: "Rib Brush", description: "Lower with elbows hugging torso.", coachTip: "Brush ribs." },
     { step: 3, title: "Triceps Lock", description: "Drive to straight arm lockout.", coachTip: "Hard contraction." }
   ]
  ],
  ["ex-db-crush-press", "Dumbbell Crush Press", "Tuesday", 17, "Sternal Head of Pectoralis", ["Front Delts"], "Flat", "bench_and_dumbbells", "Initiate", 6, "Initiate Clamp Force", 3, 10, 12, 60, 6,
   ["Press dumbbells together with maximum force on flat bench, pulsing through mid-range."],
   ["Constant inward crushing force", "Intense pec burning"],
   ["Relaxing inward pressure", "Fast uncontrolled reps"],
   ["Dumbbell Squeeze Press", "Flat Dumbbell Bench Press"],
   [
     { step: 1, title: "Crush Setup", description: "Push dumbbell faces together with maximum strength.", coachTip: "Hold crush." },
     { step: 2, title: "Mid-Range Travel", description: "Lower 4 inches above chest.", coachTip: "Pecs screaming." },
     { step: 3, title: "Crush Lockout", description: "Press to top while squeezing.", coachTip: "Exhale." }
   ]
  ],
  ["ex-alternating-db-press", "Alternating Dumbbell Bench Press", "Tuesday", 18, "Pectoralis & Unilateral Stability", ["Core", "Triceps"], "Flat", "bench_and_dumbbells", "Warrior", 12, "Warrior Unilateral Chest", 3, 8, 10, 75, 7,
   ["Hold both dumbbells at top lockout.", "Lower and press right dumbbell while left dumbbell stays locked overhead. Alternate sides."],
   ["Working arm does full stroke", "Non-working arm provides isometric stabilization"],
   ["Dropping the static arm", "Twisting hips on bench"],
   ["Flat Dumbbell Bench Press", "Single-Arm Dumbbell Floor Press"],
   [
     { step: 1, title: "Top Hold", description: "Both dumbbells locked overhead.", coachTip: "Steady core." },
     { step: 2, title: "One Arm Lower", description: "Lower one dumbbell smoothly while other stays fixed.", coachTip: "Inhale." },
     { step: 3, title: "Press & Switch", description: "Press back to top, then lower opposite side.", coachTip: "Alternate cleanly." }
   ]
  ],
  ["ex-db-around-the-world", "Dumbbell Around-the-World", "Tuesday", 19, "Total Chest Perimeter & Rotator Mobility", ["Deltoids", "Lats"], "Flat", "bench_and_dumbbells", "Vanguard", 20, "Vanguard Shoulder Health", 3, 10, 12, 60, 6,
   ["Lie flat holding light dumbbells with palms facing ceiling.", "Sweep dumbbells in wide circle along the floor plane from thighs to overhead, then reverse."],
   ["Use very light weight (1.25kg - 2.5kg plates)", "Smooth continuous sweeping arc"],
   ["Using heavy weight (damages rotator cuff)", "Lifting weights off floor plane"],
   ["Flat Dumbbell Fly", "Dumbbell Pullover"],
   [
     { step: 1, title: "Floor Plane Setup", description: "Lie flat, light dumbbells at thighs, palms up.", coachTip: "Light weights only." },
     { step: 2, title: "Circular Sweep", description: "Trace wide circle around body to overhead.", coachTip: "Feel chest perimeter open." },
     { step: 3, title: "Reverse Sweep", description: "Trace circle back to hips smoothly.", coachTip: "Slow rhythm." }
   ]
  ],
  ["ex-tempo-pushup", "Tempo Push-Up (4-2-1-0)", "Tuesday", 20, "Pectoralis Tension & Hypertrophy", ["Triceps", "Core"], "Floor / Standing", "bodyweight", "Warrior", 15, "Warrior Tempo Mastery", 3, 6, 10, 90, 7,
   ["Lower for 4 seconds, pause 2 seconds 1 inch off floor, explode up in 1 second, zero rest at top."],
   ["Strict adherence to 4-second count", "No momentum bounce"],
   ["Rushing the 4-second descent", "Resting at top"],
   ["Standard Strict Push-Up", "Flat Dumbbell Bench Press"],
   [
     { step: 1, title: "The 4-Second Drop", description: "Count: 1... 2... 3... 4... lowering slowly.", coachTip: "Strict cadence." },
     { step: 2, title: "The 2-Second Freeze", description: "Hold chest 1 inch off floor without touching.", coachTip: "Breathe through brace." },
     { step: 3, title: "Explosive Burst", description: "Power to lockout in 1 second.", coachTip: "Violent exhale." }
   ]
  ]
];

tueChest.forEach(item => allExercises.push(makeEx(...item)));
console.log("Loaded Tuesday Chest: 20 movements.");

// 3. Load Wednesday Back
const wedBack = [
  ["ex-one-arm-db-row", "One-Arm Dumbbell Row", "Wednesday", 1, "Latissimus Dorsi", ["Rhomboids", "Biceps", "Forearms"], "Flat", "bench_and_dumbbells", "Recruit", 1, "Awakening Foundation", 4, 8, 12, 75, 8,
   ["Place one knee and same-side hand on flat bench, spine parallel to floor.", "Grip dumbbell in free hand, letting it hang down.", "Pull dumbbell backward toward hip pocket, driving elbow skyward.", "Lower with 3-second stretch at bottom."],
   ["Pull toward hip pocket not armpit", "Lead with elbow", "Shoulders square to bench"],
   ["Twisting torso violently at top", "Yanking with bicep instead of back"],
   ["Bent-Over Dual Dumbbell Row", "Incline Chest-Supported Row"],
   [
     { step: 1, title: "Bench Tripod Setup", description: "Knee, hand on bench. Back flat as a tabletop.", coachTip: "Neutral neck." },
     { step: 2, title: "Elbow to Pocket Pull", description: "Drive elbow up and back toward hip bone.", coachTip: "Squeeze lat hard." },
     { step: 3, title: "Protraction Stretch", description: "Lower until lat reaches full loaded stretch.", coachTip: "Inhale at bottom." }
   ]
  ],
  ["ex-bent-over-db-row", "Bent-Over Dual Dumbbell Row", "Wednesday", 2, "Upper Back & Lats", ["Spinal Erectors", "Rear Delts"], "Floor / Standing", "dumbbells", "Recruit", 2, "Recruit Stage II", 4, 8, 12, 75, 8,
   ["Stand hinged at 45° with flat back, holding dumbbells.", "Row both dumbbells toward hips while squeezing shoulder blades together."],
   ["Torso remains locked at 45°", "Pinch shoulder blades"],
   ["Standing upright into a shrug", "Rounding lumbar spine"],
   ["Incline Chest-Supported Row", "One-Arm Dumbbell Row"],
   [
     { step: 1, title: "Hinge Lock", description: "Hinge hips back, soft knees, back flat.", coachTip: "Brace abs." },
     { step: 2, title: "Dual Pull", description: "Row both elbows back along ribs.", coachTip: "Squeeze scapulae." },
     { step: 3, title: "Controlled Lower", description: "Lower to full arm hang.", coachTip: "Maintain flat back." }
   ]
  ],
  ["ex-incline-chest-supported-row", "Incline Chest-Supported Row (45°)", "Wednesday", 3, "Mid Back & Rhomboids (Zero Lumbar Fatigue)", ["Lats", "Biceps"], "Incline 45°", "bench_and_dumbbells", "Recruit", 1, "Awakening Foundation", 4, 10, 12, 75, 7,
   ["Lie chest-down against 45° incline bench.", "Let dumbbells hang with neutral grip.", "Row up pulling elbows high past bench backrest, squeezing rhomboids tightly."],
   ["Chest glued to pad", "Zero lower back fatigue", "Peak contraction squeeze"],
   ["Lifting chest off pad (using spinal extension)", "Cutting range of motion"],
   ["Bent-Over Dual Dumbbell Row", "Chest-Supported Rear Delt Row"],
   [
     { step: 1, title: "Pad Anchor", description: "Rest chest firmly on 45° bench.", coachTip: "Feet dug into floor." },
     { step: 2, title: "Rhomboid Pinch", description: "Drive elbows back and pinch shoulder blades.", coachTip: "Hold 1s at top." },
     { step: 3, title: "Dead Hang Stretch", description: "Lower to full extension.", coachTip: "Inhale deep." }
   ]
  ],
  ["ex-reverse-grip-db-row", "Reverse-Grip Dumbbell Row", "Wednesday", 4, "Lower Latissimus Dorsi", ["Biceps", "Forearms"], "Floor / Standing", "dumbbells", "Initiate", 5, "Initiate Lower Lat", 3, 10, 12, 75, 7,
   ["Hinge at 45° with palms facing forward (underhand supinated grip).", "Row dumbbells dragging close to thighs toward belly button."],
   ["Supinated grip heavily recruits lower lat fibers", "Keep elbows close to sides"],
   ["Over-flexing wrists", "Jerking the torso upward"],
   ["Bent-Over Dual Dumbbell Row", "One-Arm Dumbbell Row"],
   [
     { step: 1, title: "Underhand Grip", description: "Palms facing forward, hinged at hips.", coachTip: "Shoulders pinned back." },
     { step: 2, title: "Lower Lat Pull", description: "Pull elbows along waistline toward navel.", coachTip: "Exhale." },
     { step: 3, title: "Smooth Hang", description: "Lower with control.", coachTip: "Maintain grip." }
   ]
  ],
  ["ex-neutral-grip-db-row", "Neutral-Grip Dumbbell Row", "Wednesday", 5, "Lats & Brachialis", ["Rhomboids"], "Floor / Standing", "dumbbells", "Recruit", 2, "Recruit Pull", 3, 10, 12, 75, 7,
   ["Hinge at 45° with palms facing inward toward each other.", "Row directly upward, elbows skimming ribs."],
   ["Natural wrist orientation", "Elbows skim ribcage"],
   ["Flaring elbows out", "Rounding shoulders"],
   ["Bent-Over Dual Dumbbell Row", "Incline Chest-Supported Row"],
   [
     { step: 1, title: "Neutral Stance", description: "Palms facing each other, hinged posture.", coachTip: "Knees soft." },
     { step: 2, title: "Rib Skim", description: "Row up brushing outer ribs.", coachTip: "Tight squeeze." },
     { step: 3, title: "Lower", description: "Return to starting extension.", coachTip: "Steady breath." }
   ]
  ],
  ["ex-gorilla-row", "Gorilla Row", "Wednesday", 6, "Upper Back & Anti-Rotational Hip Stability", ["Lats", "Hamstrings"], "Floor / Standing", "dumbbells", "Initiate", 6, "Initiate Gorilla Power", 3, 10, 12, 75, 7,
   ["Place two dumbbells on floor between feet in deep hinge.", "Rest one hand on one dumbbell while rowing the opposite dumbbell forcefully to hip. Alternate."],
   ["Wide hinge base", "Keep one dumbbell planted while rowing the other"],
   ["Rising out of hinge", "Rounding spine"],
   ["Renegade Row", "One-Arm Dumbbell Row"],
   [
     { step: 1, title: "Gorilla Stance", description: "Wide feet, deep hinge, dumbbells on floor.", coachTip: "Flat spine." },
     { step: 2, title: "Piston Pull", description: "Row right dumbbell while left presses down into floor.", coachTip: "Drive elbow up." },
     { step: 3, title: "Floor Switch", description: "Return to floor and immediately row left dumbbell.", coachTip: "Keep rhythm." }
   ]
  ],
  ["ex-renegade-row", "Renegade Row", "Wednesday", 7, "Lats & Core Anti-Rotation", ["Triceps", "Obliques"], "Floor / Standing", "dumbbells", "Warrior", 12, "Warrior Core Pull", 3, 8, 10, 90, 7,
   ["In push-up plank with hands on dumbbell handles and feet set wide for balance.", "Row one dumbbell to hip without letting hips rotate or twist. Alternate sides."],
   ["Keep hips completely square to floor", "Feet wide (shoulder width) for stability"],
   ["Hips twisting or swaying to the side", "Sagging hips in plank"],
   ["Gorilla Row", "Single-Arm Dumbbell Floor Press"],
   [
     { step: 1, title: "Plank Grip", description: "Set strong plank gripping dumbbell handles on floor.", coachTip: "Feet wide." },
     { step: 2, title: "Lock & Row", description: "Brace abs and row one dumbbell to hip pocket.", coachTip: "Zero hip tilt." },
     { step: 3, title: "Alternate", description: "Set down softly and row opposite arm.", coachTip: "Control is king." }
   ]
  ],
  ["ex-db-lat-pullover", "Dumbbell Lat Pullover (Across Bench)", "Wednesday", 8, "Latissimus Dorsi Stretch & Terres Major", ["Serratus", "Triceps Long Head"], "Flat", "bench_and_dumbbells", "Initiate", 7, "Initiate Lat Arc", 3, 10, 12, 75, 7,
   ["Lie across flat bench with hips low.", "Hold dumbbell overhead and lower behind head focusing on lat elongation.", "Pull forward stopping directly over forehead to keep constant tension on lats."],
   ["Stop over eyes/forehead (stops tension release)", "Hips dropped lower than shoulders"],
   ["Bringing dumbbell all the way over stomach (takes tension off lats)", "Bending elbows too much"],
   ["Dumbbell Pullover", "Incline Chest-Supported Row"],
   [
     { step: 1, title: "Lat Pullover Setup", description: "Hips dropped below bench height.", coachTip: "Long lever." },
     { step: 2, title: "Lat Stretch", description: "Lower behind crown of head.", coachTip: "Feel armpit stretch." },
     { step: 3, title: "Lat Pull", description: "Pull up to forehead plane only.", coachTip: "Keep lats engaged." }
   ]
  ],
  ["ex-standing-db-shrug", "Standing Dumbbell Shrug", "Wednesday", 9, "Upper Trapezius", ["Forearms", "Grip"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 4, 12, 15, 60, 6,
   ["Stand tall holding heavy dumbbells at sides.", "Elevate shoulders straight up toward ears.", "Hold peak squeeze for 2 seconds, then lower under control."],
   ["Pure vertical elevator path", "Hold 2 seconds at top contraction"],
   ["Rolling shoulders backward (rotator damage)", "Bending elbows to assist"],
   ["Incline Dumbbell Shrug", "Farmer's Carry"],
   [
     { step: 1, title: "Tall Posture", description: "Arms straight, chest tall, heavy dumbbells.", coachTip: "No forward head poke." },
     { step: 2, title: "Vertical Elevation", description: "Shrug straight up to touch ears.", coachTip: "Hold 2s." },
     { step: 3, title: "Controlled Drop", description: "Lower to full stretch.", coachTip: "Inhale at bottom." }
   ]
  ],
  ["ex-incline-db-shrug", "Incline Dumbbell Shrug (60°)", "Wednesday", 10, "Mid & Upper Trapezius", ["Rhomboids"], "Incline 60°", "bench_and_dumbbells", "Initiate", 5, "Initiate Mid Trap", 3, 12, 15, 60, 6,
   ["Lie chest-down on 60° bench.", "Shrug dumbbells up and back at an angle, squeezing mid traps."],
   ["Target mid trap fibers", "Smooth controlled squeeze"],
   ["Using momentum", "Jerking shoulders"],
   ["Standing Dumbbell Shrug", "Incline Chest-Supported Row"],
   [
     { step: 1, title: "Incline Pad Setup", description: "Chest against 60° bench.", coachTip: "Arms hanging." },
     { step: 2, title: "Angular Shrug", description: "Shrug up and back along the incline.", coachTip: "Mid traps engage." },
     { step: 3, title: "Squeeze & Return", description: "Squeeze 1s and return.", coachTip: "Breathe steady." }
   ]
  ],
  ["ex-chest-supported-rear-delt-row", "Chest-Supported Rear Delt Row", "Wednesday", 11, "Rear Deltoid & Upper Rhomboids", ["Traps"], "Incline 45°", "bench_and_dumbbells", "Initiate", 5, "Initiate Posterior Width", 3, 12, 15, 60, 6,
   ["Lie chest-down on 45° bench with wide elbows at 90°.", "Row dumbbells outward with elbows flaring wide in the scapular plane."],
   ["Elbows flared wide (perpendicular to torso)", "Focus on rear shoulders"],
   ["Tucking elbows to sides (turns into lat row)", "Lifting chest off bench"],
   ["Incline Reverse Fly", "Prone T Raise"],
   [
     { step: 1, title: "Wide Flare Setup", description: "Chest on pad, palms facing backward.", coachTip: "Elbows wide." },
     { step: 2, title: "High Wide Pull", description: "Drive elbows high and wide to ceiling.", coachTip: "Feel back of shoulders." },
     { step: 3, title: "Controlled Descent", description: "Lower to arm hang.", coachTip: "Keep flare." }
   ]
  ],
  ["ex-prone-db-row", "Prone Dumbbell Row on Flat Bench", "Wednesday", 12, "Mid Back & Latissimus", ["Biceps"], "Flat", "bench_and_dumbbells", "Initiate", 6, "Initiate Prone Pull", 3, 10, 12, 75, 7,
   ["Lie face down on flat bench (elevate bench on plates if needed).", "Row both dumbbells from floor without using body momentum."],
   ["Zero body English", "Pure muscular pull"],
   ["Lifting head violently", "Incomplete range of motion"],
   ["Incline Chest-Supported Row", "Bent-Over Dual Dumbbell Row"],
   [
     { step: 1, title: "Flat Prone Setup", description: "Lie face down flat.", coachTip: "Dumbbells under shoulders." },
     { step: 2, title: "Dead Pull", description: "Row dumbbells up toward bench frame.", coachTip: "Pure back muscle." },
     { step: 3, title: "Lower", description: "Lower smoothly.", coachTip: "No swing." }
   ]
  ],
  ["ex-db-reverse-fly", "Dumbbell Reverse Fly (Bent-Over)", "Wednesday", 13, "Rear Deltoids & Mid Trapezius", ["Rhomboids"], "Floor / Standing", "dumbbells", "Recruit", 3, "Recruit Stage III", 3, 12, 15, 60, 6,
   ["Hinge at 45° with light dumbbells.", "Raise arms out to sides in wide hugging arc with slight elbow bend.", "Squeeze rear delts and mid back at top."],
   ["Lead with pinkies slightly", "Light weight only"],
   ["Using heavy weight and swinging hips", "Bending elbows into a row"],
   ["Incline Reverse Fly", "Prone T Raise"],
   [
     { step: 1, title: "Hinge Arc", description: "Hinged at 45°, arms hanging, micro-bend in elbows.", coachTip: "Light plates." },
     { step: 2, title: "Fly Sweep", description: "Sweep arms out wide to parallel.", coachTip: "Rear delts fire." },
     { step: 3, title: "Controlled Down", description: "Lower smoothly without bouncing.", coachTip: "Exhale up." }
   ]
  ],
  ["ex-incline-reverse-fly", "Incline Reverse Fly (30°)", "Wednesday", 14, "Rear Deltoid Isolation", ["Rhomboids"], "Incline 30°", "bench_and_dumbbells", "Initiate", 5, "Initiate Incline Fly", 3, 12, 15, 60, 6,
   ["Lie chest-down on 30° incline bench.", "Raise dumbbells out to sides, feeling pure posterior deltoid recruitment without lower back stress."],
   ["Chest locked against pad", "Constant rear delt tension"],
   ["Swinging arms", "Arching neck"],
   ["Dumbbell Reverse Fly", "Prone Y Raise"],
   [
     { step: 1, title: "Incline Chest Lock", description: "Chest on 30° bench pad.", coachTip: "Arms dangling." },
     { step: 2, title: "Posterior Arc", description: "Raise dumbbells to horizontal level.", coachTip: "Squeeze rear delts." },
     { step: 3, title: "Slow Lower", description: "Lower with 3-second negative.", coachTip: "Inhale." }
   ]
  ],
  ["ex-prone-y-raise", "Prone Bench Y-Raise", "Wednesday", 15, "Lower Trapezius & Postural Health", ["Rear Delts", "Rotator Cuff"], "Incline 30°", "bench_and_dumbbells", "Initiate", 5, "Initiate Scapular Armor", 3, 12, 15, 60, 5,
   ["Lie chest-down on 30° bench.", "Raise light dumbbells or thumbs up at 45° angle forming a 'Y' shape with torso."],
   ["Thumbs pointed to ceiling", "Forms letter Y"],
   ["Using heavy weights", "Shrugging neck to ears"],
   ["Prone T Raise", "Prone W Raise"],
   [
     { step: 1, title: "Y-Shape Setup", description: "Lie on 30° bench, thumbs up.", coachTip: "Very light weight." },
     { step: 2, title: "Lower Trap Lift", description: "Raise arms at 45° angle.", coachTip: "Feel lower traps squeeze." },
     { step: 3, title: "Hold & Lower", description: "Pause 1s at top, lower slowly.", coachTip: "Scapular stability." }
   ]
  ],
  ["ex-prone-t-raise", "Prone Bench T-Raise", "Wednesday", 16, "Rhomboids & Scapular Retractors", ["Mid Traps", "Rear Delts"], "Incline 30°", "bench_and_dumbbells", "Initiate", 5, "Initiate Scapular Armor", 3, 12, 15, 60, 5,
   ["Lie chest-down on 30° bench.", "Raise arms perpendicular to torso forming a 'T' shape with thumbs up."],
   ["Forms letter T", "Squeeze shoulder blades together"],
   ["Over-shrugging", "Swinging weights"],
   ["Prone Y Raise", "Prone W Raise"],
   [
     { step: 1, title: "T-Shape Setup", description: "Chest on 30° bench, arms wide.", coachTip: "Thumbs to ceiling." },
     { step: 2, title: "Retract Scapulae", description: "Lift arms straight out to sides.", coachTip: "Pinch rhomboids." },
     { step: 3, title: "Return", description: "Lower under control.", coachTip: "Smooth breathing." }
   ]
  ],
  ["ex-prone-w-raise", "Prone Bench W-Raise", "Wednesday", 17, "External Rotators & Infraspinatus", ["Mid Traps"], "Incline 30°", "bench_and_dumbbells", "Initiate", 5, "Initiate Scapular Armor", 3, 12, 15, 60, 5,
   ["Lie chest-down on 30° bench.", "Bend elbows and externally rotate forearms up to form a 'W' shape."],
   ["Forms letter W", "Rotator cuff strengthening"],
   ["Internally rotating shoulders", "Fast reps"],
   ["Prone Y Raise", "Prone T Raise"],
   [
     { step: 1, title: "W-Shape Setup", description: "Elbows bent at 90°, thumbs up.", coachTip: "Infraspinatus focus." },
     { step: 2, title: "External Rotation", description: "Rotate forearms upward into W.", coachTip: "Peak rotator squeeze." },
     { step: 3, title: "Return", description: "Lower smoothly.", coachTip: "Keep elbows bent." }
   ]
  ],
  ["ex-db-deadlift", "Dumbbell Suitcase Deadlift", "Wednesday", 18, "Full Posterior Chain & Grip", ["Quads", "Glutes", "Erectors", "Traps"], "Floor / Standing", "dumbbells", "Recruit", 2, "Recruit Heavy Carry", 3, 8, 10, 90, 8,
   ["Hold heavy dumbbells at sides.", "Hinge and squat down until dumbbells touch near mid-shin, then drive through floor to full upright stance."],
   ["Back locked flat", "Chest proud throughout"],
   ["Rounding lower back off floor", "Hyperextending spine at top"],
   ["Dumbbell Romanian Deadlift (RDL)", "Farmer's Carry"],
   [
     { step: 1, title: "Suitcase Setup", description: "Stand tall, heavy dumbbells at sides.", coachTip: "Core braced." },
     { step: 2, title: "Descent", description: "Squat-hinge down until weights graze mid-shin.", coachTip: "Knees track toes." },
     { step: 3, title: "Lockout", description: "Drive through feet to stand tall.", coachTip: "Exhale." }
   ]
  ],
  ["ex-farmers-carry", "Dumbbell Farmer's Carry", "Wednesday", 19, "Grip Strength, Traps & Core Stability", ["Forearms", "Core Obliques"], "Floor / Standing", "dumbbells", "Initiate", 5, "Initiate Heavy Carry", 3, 45, 60, 90, 7,
   ["Pick up heavy dumbbells and walk with upright military posture for 45-60 seconds."],
   ["Shoulders pinned back and down", "Do not let weights sway"],
   ["Hunching forward", "Taking hurried, unsteady steps"],
   ["Standing Dumbbell Shrug", "Dumbbell Suitcase Deadlift"],
   [
     { step: 1, title: "Grip Lock", description: "White-knuckle grip on heavy dumbbells.", coachTip: "Pack shoulders." },
     { step: 2, title: "Slow March", description: "Walk smoothly with upright posture.", coachTip: "Total body tension." },
     { step: 3, title: "Safe Unload", description: "Squat down to set weights on floor.", coachTip: "Never drop weights." }
   ]
  ],
  ["ex-single-arm-bench-high-row", "Single-Arm Bench-Supported High Row", "Wednesday", 20, "Upper Lat & Rear Deltoid Tie-in", ["Rhomboids"], "Flat", "bench_and_dumbbells", "Warrior", 10, "Warrior Precision Back", 3, 10, 12, 60, 6,
   ["Supported on bench, row dumbbell up with elbow angled at 60° to hit upper lat flare."],
   ["Upper lat sweep", "Elbow drives out and back"],
   ["Torso rotation", "Shrugging into neck"],
   ["One-Arm Dumbbell Row", "Incline Chest-Supported Row"],
   [
     { step: 1, title: "High Row Base", description: "One arm on bench, wide elbow angle.", coachTip: "Spine neutral." },
     { step: 2, title: "60° Drive", description: "Row elbow high toward shoulder line.", coachTip: "Upper lat contraction." },
     { step: 3, title: "Stretch", description: "Lower to full extension.", coachTip: "Exhale." }
   ]
  ]
];

wedBack.forEach(item => allExercises.push(makeEx(...item)));
console.log("Loaded Wednesday Back: 20 movements.");

// 4. Load Thursday Shoulders
const thuShoulders = [
  ["ex-seated-db-shoulder-press", "Seated Dumbbell Shoulder Press (75°)", "Thursday", 1, "Anterior & Lateral Deltoids", ["Triceps", "Upper Chest"], "Incline 75°", "bench_and_dumbbells", "Recruit", 1, "Awakening Foundation", 4, 8, 12, 90, 8,
   ["Set 20-in-1 bench to 75° (prevents lumbar arching and rotator impingement).", "Press dumbbells up and inward directly over ears.", "Lower until dumbbells touch ear level with elbows in scapular plane (30° forward)."],
   ["Elbows in scapular plane (not flared flat)", "Drive feet into floor"],
   ["Bench set to 90° (causes lower back over-arch)", "Elbows flaring 90° out", "Banging dumbbells at top"],
   ["Standing Dumbbell Shoulder Press", "Arnold Dumbbell Press"],
   [
     { step: 1, title: "75° Incline Base", description: "Set bench at 75° angle, feet planted firmly.", coachTip: "Scapula retracted." },
     { step: 2, title: "Scapular Plane Press", description: "Press up and inward over crown of head.", coachTip: "Exhale through teeth." },
     { step: 3, title: "Ear Level Descent", description: "Lower under control to top of ears.", coachTip: "Inhale deeply." }
   ]
  ],
  ["ex-standing-db-shoulder-press", "Standing Overhead Dumbbell Press", "Thursday", 2, "Anterior Deltoids & Core Stabilization", ["Triceps", "Core"], "Floor / Standing", "dumbbells", "Initiate", 5, "Initiate Standing Power", 4, 8, 10, 90, 8,
   ["Stand with feet shoulder-width, glutes and abs squeezed tight.", "Press dumbbells overhead to full lockout without leaning backward."],
   ["Squeeze glutes to protect spine", "Lock core rigid as granite"],
   ["Leaning back excessively", "Bending knees to push-press"],
   ["Seated Dumbbell Shoulder Press", "Neutral-Grip Shoulder Press"],
   [
     { step: 1, title: "Standing Pillar", description: "Feet under hips, glutes clamped tight.", coachTip: "Abs braced." },
     { step: 2, title: "Vertical Drive", description: "Press straight overhead to arm lockout.", coachTip: "Lock elbows softly." },
     { step: 3, title: "Control", description: "Lower to collarbone line.", coachTip: "Smooth cadence." }
   ]
  ],
  ["ex-arnold-press", "Arnold Dumbbell Press", "Thursday", 3, "All Three Deltoid Heads", ["Triceps", "Rotator Cuff"], "Seated 90°", "bench_and_dumbbells", "Initiate", 7, "Initiate Deltoid Rotation", 3, 10, 12, 75, 7,
   ["Start seated holding dumbbells at chest with palms facing you (supinated).", "As you press upward, rotate wrists 180° outward until palms face forward at top lockout.", "Reverse the rotation smoothly on the way down."],
   ["Smooth continuous rotational corkscrew", "Open elbows wide during rotation"],
   ["Jerking the weights through the rotation", "Starting rotation too early"],
   ["Seated Dumbbell Shoulder Press", "Neutral-Grip Shoulder Press"],
   [
     { step: 1, title: "Supinated Start", description: "Dumbbells in front of chin, palms facing chest.", coachTip: "Compact setup." },
     { step: 2, title: "Rotational Drive", description: "Press up while rotating wrists outward.", coachTip: "Continuous spiral." },
     { step: 3, title: "Pronated Lockout", description: "Lockout overhead with palms facing forward.", coachTip: "Reverse smoothly down." }
   ]
  ],
  ["ex-neutral-grip-shoulder-press", "Neutral-Grip Shoulder Press", "Thursday", 4, "Anterior Deltoids & Shoulder Health", ["Triceps"], "Incline 75°", "bench_and_dumbbells", "Recruit", 2, "Recruit Joint Health", 3, 8, 12, 75, 7,
   ["Hold dumbbells with palms facing each other throughout.", "Press straight up, elbows pointing forward."],
   ["Shoulder joint friendly", "Zero impingement risk"],
   ["Letting elbows flare out", "Rushing tempo"],
   ["Seated Dumbbell Shoulder Press", "Standing Overhead Dumbbell Press"],
   [
     { step: 1, title: "Parallel Grip", description: "Palms facing inwards at shoulders.", coachTip: "Tuck elbows." },
     { step: 2, title: "Clean Line Press", description: "Press up along sagittal plane.", coachTip: "Zero shoulder pinch." },
     { step: 3, title: "Descent", description: "Lower handles to chin height.", coachTip: "Inhale." }
   ]
  ],
  ["ex-alternating-shoulder-press", "Alternating Shoulder Press", "Thursday", 5, "Deltoids & Isometric Core", ["Triceps", "Core"], "Incline 75°", "bench_and_dumbbells", "Initiate", 6, "Initiate Unilateral Press", 3, 8, 10, 75, 7,
   ["Press right arm while left arm holds at shoulder level. Alternate sides with strict control."],
   ["Hold non-working dumbbell steady", "Even cadence"],
   ["Dropping the resting dumbbell", "Tilting torso"],
   ["Seated Dumbbell Shoulder Press", "Single-Arm Shoulder Press"],
   [
     { step: 1, title: "Dual Ready", description: "Both dumbbells at shoulder height.", coachTip: "Torso tall." },
     { step: 2, title: "One Arm Press", description: "Press right arm while left arm stays loaded.", coachTip: "Exhale up." },
     { step: 3, title: "Switch", description: "Lower right and press left.", coachTip: "Seamless rhythm." }
   ]
  ],
  ["ex-single-arm-shoulder-press", "Single-Arm Shoulder Press", "Thursday", 6, "Unilateral Shoulder & Oblique Balance", ["Core Obliques"], "Floor / Standing", "dumbbells", "Warrior", 10, "Warrior Core Press", 3, 8, 10, 75, 7,
   ["Stand holding single dumbbell at shoulder, other hand on hip.", "Press dumbbell directly overhead while keeping spine vertical."],
   ["Total core anti-lateral flexion", "Vertical spine"],
   ["Leaning sideways toward weight", "Knee dip"],
   ["Standing Overhead Dumbbell Press", "Alternating Shoulder Press"],
   [
     { step: 1, title: "Unilateral Stance", description: "One dumbbell at shoulder, free hand on hip.", coachTip: "Brace obliques." },
     { step: 2, title: "Straight Line", description: "Press straight up beside ear.", coachTip: "Fight side tilt." },
     { step: 3, title: "Lower", description: "Return to shoulder height.", coachTip: "Repeat on both sides." }
   ]
  ],
  ["ex-standing-lateral-raise", "Standing Dumbbell Lateral Raise", "Thursday", 7, "Lateral Deltoid (Shoulder Width)", ["Upper Traps", "Forearms"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 4, 12, 15, 60, 6,
   ["Stand with slight forward torso lean (10°), dumbbells at sides.", "Raise arms out to sides in wide arc, keeping pinkies slightly higher than thumbs (pouring water).", "Stop at shoulder height, lower with 3-second negative."],
   ["Lead with elbows", "Slight forward torso pitch", "Pinkies tilted slightly upward"],
   ["Swinging body or using hip thrust", "Lifting weights higher than shoulders (traps take over)", "Shrugging shoulders into neck"],
   ["Seated Lateral Raise", "Leaning Lateral Raise"],
   [
     { step: 1, title: "Athletic Lean Setup", description: "Slight 10° forward lean, dumbbells in front of thighs.", coachTip: "Elbows soft." },
     { step: 2, title: "Lateral Plane Sweep", description: "Pour dumbbells out and up to shoulder level.", coachTip: "Elbows lead the way." },
     { step: 3, title: "Tension Negative", description: "Lower slowly over 3 seconds.", coachTip: "Never drop weights." }
   ]
  ],
  ["ex-seated-lateral-raise", "Seated Dumbbell Lateral Raise", "Thursday", 8, "Lateral Deltoid Pure Isolation", ["Forearms"], "Seated 90°", "bench_and_dumbbells", "Recruit", 2, "Recruit Stage II", 3, 12, 15, 60, 6,
   ["Sit tall on edge of bench, dumbbells hanging at sides.", "Raise dumbbells out to sides without any leg momentum."],
   ["Completely eliminates leg drive", "Pure side delt tension"],
   ["Rocking back and forth on bench", "Lifting arms too high"],
   ["Standing Dumbbell Lateral Raise", "Leaning Lateral Raise"],
   [
     { step: 1, title: "Seated Base", description: "Perched on bench edge, dumbbells at sides.", coachTip: "Feet glued to floor." },
     { step: 2, title: "Pure Arc", description: "Sweep out to sides to parallel.", coachTip: "No body rock." },
     { step: 3, title: "Controlled Down", description: "Lower with slow tempo.", coachTip: "Exhale up." }
   ]
  ],
  ["ex-leaning-lateral-raise", "Leaning Single-Arm Lateral Raise", "Thursday", 9, "Lateral Deltoid Stretch & Constant Tension", ["Forearms"], "Floor / Standing", "dumbbells", "Initiate", 5, "Initiate Constant Tension", 3, 12, 15, 60, 6,
   ["Hold onto bench or post with one hand and lean body away at a 20° angle.", "Perform lateral raise with outside arm."],
   ["Extended range of motion at bottom", "Constant tension throughout whole stroke"],
   ["Swinging torso back upright", "Bending elbow too much"],
   ["Standing Dumbbell Lateral Raise", "Seated Lateral Raise"],
   [
     { step: 1, title: "Leaning Anchor", description: "Hold sturdy post/bench, lean out 20°.", coachTip: "Dumbbell hangs perpendicular." },
     { step: 2, title: "Long Arc", description: "Raise dumbbell to horizontal line.", coachTip: "Maximum tension." },
     { step: 3, title: "Deep Stretch", description: "Lower past hip into full stretch.", coachTip: "Hold 1s." }
   ]
  ],
  ["ex-bent-arm-lateral-raise", "Bent-Arm Dumbbell Lateral Raise", "Thursday", 10, "Lateral Deltoid (Heavier Overload)", ["Upper Traps"], "Floor / Standing", "dumbbells", "Initiate", 6, "Initiate Deltoid Overload", 3, 10, 12, 60, 6,
   ["Bend elbows to 90° and lock them.", "Raise upper arms out to sides until elbows are parallel to floor."],
   ["Shortened lever arm allows slightly heavier loading", "Keep 90° elbow bend locked"],
   ["Straightening arms mid-rep", "Shrugging traps"],
   ["Standing Dumbbell Lateral Raise", "Partial Lateral Raise"],
   [
     { step: 1, title: "90° Elbow Lock", description: "Lock elbows at 90° angle at ribs.", coachTip: "Forearms forward." },
     { step: 2, title: "Elbow Lift", description: "Raise elbows directly out to sides.", coachTip: "Feel side delt cap." },
     { step: 3, title: "Return", description: "Lower elbows back to rib line.", coachTip: "Exhale." }
   ]
  ],
  ["ex-partial-lateral-raise", "Partial Range Heavy Lateral Raise", "Thursday", 11, "Lateral Deltoid Bottom Overload", ["Forearms"], "Floor / Standing", "dumbbells", "Warrior", 12, "Warrior Deltoid Overload", 3, 15, 20, 60, 6,
   ["Use heavier dumbbells.", "Perform pulses through the bottom 60% of the lateral raise range."],
   ["Overloads side delts where they are strongest", "Constant tension pulses"],
   ["Swinging violently", "Lifting weights toward chin"],
   ["Standing Dumbbell Lateral Raise", "Bent-Arm Lateral Raise"],
   [
     { step: 1, title: "Heavy Load", description: "Hold moderately heavier dumbbells at sides.", coachTip: "Brace abs." },
     { step: 2, title: "Bottom Pulse", description: "Raise to 45° angle only.", coachTip: "Rapid controlled burn." },
     { step: 3, title: "Pulse Cadence", description: "Pump 15-20 partial reps.", coachTip: "High fatigue." }
   ]
  ],
  ["ex-front-db-raise", "Front Dumbbell Raise", "Thursday", 12, "Anterior Deltoids", ["Upper Chest"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 3, 10, 12, 60, 6,
   ["Hold dumbbells against front of thighs.", "Raise dumbbells straight forward to eye level with neutral or pronated grip."],
   ["Stop at eye level", "Torso completely stationary"],
   ["Leaning back as weights rise", "Swinging weights"],
   ["Alternating Front Raise", "Seated Front Raise"],
   [
     { step: 1, title: "Front Stance", description: "Dumbbells resting in front of thighs.", coachTip: "Shoulders packed." },
     { step: 2, title: "Forward Rise", description: "Raise to eye level in straight line.", coachTip: "Front delts fire." },
     { step: 3, title: "Controlled Down", description: "Lower with 3-second negative.", coachTip: "Inhale." }
   ]
  ],
  ["ex-alternating-front-raise", "Alternating Front Raise", "Thursday", 13, "Anterior Deltoid Unilateral", ["Upper Chest"], "Floor / Standing", "dumbbells", "Recruit", 2, "Recruit Stage II", 3, 10, 12, 60, 6,
   ["Raise one dumbbell to eye level, lower under control, then raise opposite dumbbell."],
   ["Smooth alternate cadence", "Controlled descent"],
   ["Rushing the reps", "Rocking hips"],
   ["Front Dumbbell Raise", "Incline Front Raise"],
   [
     { step: 1, title: "Alternate Base", description: "Stand tall, dumbbells ready.", coachTip: "Quiet body." },
     { step: 2, title: "Single Raise", description: "Raise right dumbbell to eye height.", coachTip: "Exhale." },
     { step: 3, title: "Switch", description: "Lower and raise left dumbbell.", coachTip: "Continuous tempo." }
   ]
  ],
  ["ex-seated-front-raise", "Seated Front Raise", "Thursday", 14, "Anterior Deltoid Strict Isolation", ["Upper Chest"], "Seated 90°", "bench_and_dumbbells", "Recruit", 3, "Recruit Strict Shoulders", 3, 10, 12, 60, 6,
   ["Sit tall on 90° bench, raise dumbbells straight ahead to eye level."],
   ["Zero body momentum", "Strict anterior deltoid loading"],
   ["Arching off backrest", "Lifting overhead"],
   ["Front Dumbbell Raise", "Incline Front Raise"],
   [
     { step: 1, title: "Seated Setup", description: "Sit firm against 90° bench pad.", coachTip: "Head neutral." },
     { step: 2, title: "Strict Raise", description: "Lift straight forward to eye line.", coachTip: "Pure shoulder power." },
     { step: 3, title: "Lower", description: "Lower with control.", coachTip: "Inhale." }
   ]
  ],
  ["ex-db-scaption-raise", "Dumbbell Scaption Raise (30° Angle)", "Thursday", 15, "Serratus Anterior & Supraspinatus Health", ["Lateral Deltoid"], "Floor / Standing", "dumbbells", "Recruit", 2, "Recruit Rotator Armor", 3, 12, 15, 60, 6,
   ["Raise dumbbells with thumbs up at a 30° forward angle (in the true scapular plane)."],
   ["Natural scapular plane", "Thumbs pointing up"],
   ["Flaring directly out to sides", "Over-shrugging"],
   ["Standing Dumbbell Lateral Raise", "Front Dumbbell Raise"],
   [
     { step: 1, title: "Scapular Alignment", description: "Arms at 30° angle forward from torso, thumbs up.", coachTip: "Optimal joint biomechanics." },
     { step: 2, title: "Smooth Rise", description: "Raise to shoulder height.", coachTip: "Rotator cuff protective." },
     { step: 3, title: "Descent", description: "Lower gently.", coachTip: "Exhale." }
   ]
  ],
  ["ex-incline-front-raise", "Incline Front Raise (45°)", "Thursday", 16, "Anterior Deltoid Peak Stretch", ["Upper Pecs"], "Incline 45°", "bench_and_dumbbells", "Initiate", 6, "Initiate Shoulder Angle", 3, 10, 12, 60, 6,
   ["Lie back on 45° incline bench, raise dumbbells forward and up."],
   ["Extended range of motion", "Loaded stretch at bottom"],
   ["Swinging arms", "Bending elbows"],
   ["Front Dumbbell Raise", "Seated Front Raise"],
   [
     { step: 1, title: "Incline Base", description: "Lie against 45° bench, arms hanging.", coachTip: "Feet flat." },
     { step: 2, title: "High Arc", description: "Raise forward past eye line.", coachTip: "Feel anterior delt stretch." },
     { step: 3, title: "Return", description: "Lower smoothly.", coachTip: "Inhale down." }
   ]
  ],
  ["ex-db-upright-row", "Controlled Wide-Grip Dumbbell Upright Row", "Thursday", 17, "Lateral Deltoids & Upper Traps", ["Biceps"], "Floor / Standing", "dumbbells", "Initiate", 7, "Initiate Wide Upright Row", 3, 10, 12, 60, 6,
   ["Hold dumbbells in front of thighs with wide spacing.", "Pull elbows high and wide, stopping when elbows reach chest level (never above shoulders)."],
   ["Wide dumbbell spacing protects subacromial space", "Never pull higher than lower chest"],
   ["Pulling with hands touching (damages rotator cuff)", "Jerking weights with lower back"],
   ["Standing Dumbbell Lateral Raise", "Bent-Arm Lateral Raise"],
   [
     { step: 1, title: "Wide Grip Setup", description: "Dumbbells 12 inches apart in front of thighs.", coachTip: "Hands wide." },
     { step: 2, title: "Wide High Pull", description: "Pull elbows wide and up to chest line.", coachTip: "Stop at mid-chest." },
     { step: 3, title: "Smooth Descent", description: "Lower to thighs.", coachTip: "Zero shoulder pain." }
   ]
  ],
  ["ex-pike-pushup", "Pike Push-Up (Bodyweight Vertical Press)", "Thursday", 18, "Anterior Deltoids & Triceps Lockout", ["Upper Traps", "Core"], "Floor / Standing", "bodyweight", "Initiate", 5, "Initiate Bodyweight Press", 3, 8, 12, 75, 7,
   ["Get into downward dog position with hips high in air.", "Lower head diagonally forward between hands, then press back up and through."],
   ["Hips stay high in the air", "Head moves forward of hands in tripod"],
   ["Flaring elbows wide", "Turning into a normal flat push-up"],
   ["Seated Dumbbell Shoulder Press", "Standing Overhead Dumbbell Press"],
   [
     { step: 1, title: "V-Shape Pike", description: "Hands and feet on floor, hips high in air like inverted V.", coachTip: "Look at feet." },
     { step: 2, title: "Diagonal Dip", description: "Lower crown of head diagonally between hands.", coachTip: "Elbows tucked 45°." },
     { step: 3, title: "Press Through", description: "Push ground away, driving head back between shoulders.", coachTip: "Full lockout." }
   ]
  ],
  ["ex-lateral-raise-hold", "Isometric Lateral Raise Hold", "Thursday", 19, "Lateral Deltoid Time Under Tension", ["Traps"], "Floor / Standing", "dumbbells", "Warrior", 10, "Warrior Isometric Burn", 3, 20, 30, 60, 5,
   ["Raise light dumbbells to shoulder level and hold statically for 20-30 seconds."],
   ["Maintain strict horizontal arm angle", "Breathe steadily"],
   ["Dropping arms below parallel", "Leaning torso backward"],
   ["Standing Dumbbell Lateral Raise", "Partial Lateral Raise"],
   [
     { step: 1, title: "Horizontal Freeze", description: "Raise light dumbbells to parallel and freeze.", coachTip: "Shoulders down." },
     { step: 2, title: "Breathe Through Burn", description: "Hold for 20 to 30 continuous seconds.", coachTip: "Delts on fire." },
     { step: 3, title: "Controlled Release", description: "Lower slowly to sides.", coachTip: "Never drop." }
   ]
  ],
  ["ex-lateral-drop-set", "Controlled Lateral Raise Mechanical Drop Set", "Thursday", 20, "Total Lateral Deltoid Exhaustion", ["Traps", "Forearms"], "Floor / Standing", "dumbbells", "Warrior", 15, "Warrior Mechanical Drop Set", 3, 10, 15, 90, 8,
   ["Perform 8 reps strict standing lateral raises, then immediately switch to bent-arm raises for 8 more reps with same weight."],
   ["Seamless transition from long lever to short lever", "Maximum metabolic burn"],
   ["Resting between movements", "Swinging with hips"],
   ["Standing Dumbbell Lateral Raise", "Bent-Arm Lateral Raise"],
   [
     { step: 1, title: "Strict Phase", description: "8 strict straight-arm lateral raises.", coachTip: "Full range." },
     { step: 2, title: "Lever Transition", description: "Immediately bend elbows to 90°.", coachTip: "Zero rest." },
     { step: 3, title: "Mechanical Burnout", description: "8 bent-arm raises to complete failure.", coachTip: "Maximum growth stimulus." }
   ]
  ]
];

thuShoulders.forEach(item => allExercises.push(makeEx(...item)));
console.log("Loaded Thursday Shoulders: 20 movements.");

// 5. Load Friday Delts
const friDelts = [
  ["ex-incline-rear-delt-fly", "Incline Rear Delt Fly (30°)", "Friday", 1, "Posterior Deltoid", ["Rhomboids", "Mid Traps"], "Incline 30°", "bench_and_dumbbells", "Recruit", 1, "Awakening Foundation", 4, 12, 15, 60, 6,
   ["Lie chest-down on 30° bench, arms dangling with light dumbbells.", "Sweep arms out to sides leading with pinkies until parallel with floor.", "Lower over 3 seconds to full stretch."],
   ["Lead with pinkies", "Chest stays glued to pad", "Feel back of shoulders"],
   ["Using heavy weight and rowing with lats", "Shrugging into neck"],
   ["Chest-Supported Rear Delt Fly", "Bent-Over Rear Delt Fly"],
   [
     { step: 1, title: "Chest Pad Anchor", description: "Lie chest down on 30° bench, palms facing each other.", coachTip: "Relax neck." },
     { step: 2, title: "Posterior Arc", description: "Sweep dumbbells wide to sides like wings.", coachTip: "Feel rear delt cap." },
     { step: 3, title: "Slow Stretch", description: "Lower with controlled 3-second negative.", coachTip: "Deep inhale." }
   ]
  ],
  ["ex-chest-supported-rear-delt-fly", "Chest-Supported Rear Delt Fly (45°)", "Friday", 2, "Posterior Deltoid", ["Rhomboids"], "Incline 45°", "bench_and_dumbbells", "Recruit", 2, "Recruit Stage II", 3, 12, 15, 60, 6,
   ["Lie chest down on 45° bench.", "Raise arms wide to horizontal plane, focusing on rear delt contraction."],
   ["Target rear delt fibers from 45° angle", "Clean squeeze"],
   ["Squeezing traps instead of rear delts", "Jerking dumbbells"],
   ["Incline Rear Delt Fly", "Seated Rear Delt Fly"],
   [
     { step: 1, title: "45° Setup", description: "Chest against 45° bench.", coachTip: "Arms hanging." },
     { step: 2, title: "Wide Sweep", description: "Open arms wide.", coachTip: "Rear delts fire." },
     { step: 3, title: "Return", description: "Lower under control.", coachTip: "Exhale." }
   ]
  ],
  ["ex-bent-over-rear-delt-fly", "Bent-Over Rear Delt Fly", "Friday", 3, "Posterior Deltoids & Upper Rhomboids", ["Mid Traps"], "Floor / Standing", "dumbbells", "Recruit", 3, "Recruit Stage III", 3, 12, 15, 60, 6,
   ["Hinge at hips to 45°, arms hanging.", "Raise arms wide to sides in wide arc, squeezing back of shoulders."],
   ["Torso stays still", "Wide arc sweep"],
   ["Bouncing torso", "Bending elbows into row"],
   ["Incline Rear Delt Fly", "Seated Rear Delt Fly"],
   [
     { step: 1, title: "Hinge Stance", description: "Hinged at 45°, flat spine.", coachTip: "Light weights." },
     { step: 2, title: "Horizontal Fly", description: "Raise arms out wide.", coachTip: "Focus on rear delts." },
     { step: 3, title: "Lower", description: "Lower smoothly.", coachTip: "Inhale." }
   ]
  ],
  ["ex-seated-rear-delt-fly", "Seated Rear Delt Fly (Torso on Thighs)", "Friday", 4, "Posterior Deltoid Strict Isolation", ["Rhomboids"], "Seated 90°", "bench_and_dumbbells", "Recruit", 2, "Recruit Strict Isolation", 3, 12, 15, 60, 6,
   ["Sit on bench edge, lean torso forward resting chest against thighs.", "Dumbbells hang behind heels.", "Raise dumbbells wide to sides without moving torso."],
   ["Chest locked against thighs eliminates cheating", "Pinkies lead"],
   ["Lifting chest off thighs", "Using momentum"],
   ["Incline Rear Delt Fly", "Bent-Over Rear Delt Fly"],
   [
     { step: 1, title: "Thigh Rest Setup", description: "Sit on bench edge, fold torso over thighs.", coachTip: "Weights behind heels." },
     { step: 2, title: "Pure Fly", description: "Fly arms wide to sides.", coachTip: "Zero body English." },
     { step: 3, title: "Return", description: "Lower softly.", coachTip: "Exhale up." }
   ]
  ],
  ["ex-single-arm-rear-delt-fly", "Single-Arm Incline Rear Delt Fly", "Friday", 5, "Unilateral Posterior Deltoid", ["Rhomboids"], "Incline 30°", "bench_and_dumbbells", "Initiate", 5, "Initiate Unilateral Delt", 3, 12, 15, 60, 6,
   ["Lie sideways or chest-down on 30° bench, performing fly with one arm at a time."],
   ["Intense mind-muscle connection", "Eliminates side imbalances"],
   ["Torso twisting", "Dropping arm fast"],
   ["Incline Rear Delt Fly", "Prone Rear Delt Raise"],
   [
     { step: 1, title: "One Arm Setup", description: "Chest on bench, working arm hanging.", coachTip: "Free hand anchored." },
     { step: 2, title: "Focused Sweep", description: "Sweep out to side smoothly.", coachTip: "Feel rear head contract." },
     { step: 3, title: "Descent", description: "Slow negative.", coachTip: "Repeat on both sides." }
   ]
  ],
  ["ex-prone-rear-delt-raise", "Prone Rear Delt Raise on Flat Bench", "Friday", 6, "Posterior Deltoid", ["Mid Traps"], "Flat", "bench_and_dumbbells", "Initiate", 6, "Initiate Prone Delt", 3, 12, 15, 60, 6,
   ["Lie face down on flat bench, raise light dumbbells out to sides."],
   ["Zero lumbar involvement", "Direct rear delt loading"],
   ["Swinging arms", "Arching neck"],
   ["Incline Rear Delt Fly", "Prone T Raise"],
   [
     { step: 1, title: "Flat Prone Setup", description: "Lie face down on flat bench.", coachTip: "Palms facing down." },
     { step: 2, title: "Fly Lift", description: "Raise arms out to sides to bench height.", coachTip: "Squeeze rear delts." },
     { step: 3, title: "Lower", description: "Lower smoothly.", coachTip: "Inhale." }
   ]
  ],
  ["ex-rear-delt-row", "Wide-Flared Rear Delt Row", "Friday", 7, "Posterior Deltoids (Overload)", ["Upper Lats", "Rhomboids"], "Floor / Standing", "dumbbells", "Initiate", 5, "Initiate Rear Delt Power", 3, 10, 12, 60, 6,
   ["Hinge at 45°, row dumbbells with elbows flared wide at 90° from torso."],
   ["Elbows stay flared 90°", "Allows heavier loading on posterior shoulder"],
   ["Tucking elbows to ribs", "Rounding back"],
   ["Incline High Row", "Incline Rear Delt Fly"],
   [
     { step: 1, title: "Flared Hinge", description: "Hinged at 45°, knuckles facing forward.", coachTip: "Wide grip." },
     { step: 2, title: "Elbow Flare Pull", description: "Drive elbows high and wide.", coachTip: "Feel rear delt knot." },
     { step: 3, title: "Lower", description: "Lower to full hang.", coachTip: "Exhale." }
   ]
  ],
  ["ex-incline-high-row", "Incline High Row (Chest Supported 45°)", "Friday", 8, "Posterior Deltoid & Upper Back", ["Rhomboids"], "Incline 45°", "bench_and_dumbbells", "Initiate", 6, "Initiate High Row", 3, 10, 12, 60, 6,
   ["Lie chest-down on 45° bench, row elbows high toward ceiling."],
   ["Zero lower back fatigue", "High elbow path"],
   ["Lifting torso off pad", "Short reps"],
   ["Wide-Flared Rear Delt Row", "Incline Rear Delt Fly"],
   [
     { step: 1, title: "Chest Anchor", description: "Chest glued to 45° bench.", coachTip: "Arms hanging." },
     { step: 2, title: "High Elbow Row", description: "Drive elbows high toward ears.", coachTip: "Upper back and rear delts." },
     { step: 3, title: "Return", description: "Lower to starting hang.", coachTip: "Inhale." }
   ]
  ],
  ["ex-prone-y-raise-fri", "Prone Bench Y-Raise (Scapular Health)", "Friday", 9, "Lower Trapezius & Rear Shoulder", ["Rotator Cuff"], "Incline 30°", "bench_and_dumbbells", "Initiate", 5, "Initiate Scapular Armor", 3, 12, 15, 60, 5,
   ["Lie chest down on 30° bench, raise thumbs up at 45° forming Y."],
   ["Thumbs to ceiling", "Lower trap activation"],
   ["Heavy weights", "Shrugging neck"],
   ["Prone T Raise", "Prone W Raise"],
   [
     { step: 1, title: "Y-Angle", description: "Arms at 45° angle forward.", coachTip: "Light weights." },
     { step: 2, title: "Lift", description: "Raise to shoulder height.", coachTip: "Pinch lower traps." },
     { step: 3, title: "Lower", description: "Lower under control.", coachTip: "Breathe steady." }
   ]
  ],
  ["ex-prone-t-raise-fri", "Prone Bench T-Raise (Rhomboid & Rear Delt)", "Friday", 10, "Rear Deltoid & Rhomboids", ["Mid Traps"], "Incline 30°", "bench_and_dumbbells", "Initiate", 5, "Initiate Scapular Armor", 3, 12, 15, 60, 5,
   ["Lie chest down on 30° bench, raise arms straight out forming T."],
   ["Straight out to sides", "Squeeze shoulder blades"],
   ["Bent elbows", "Swinging"],
   ["Prone Y Raise", "Prone W Raise"],
   [
     { step: 1, title: "T-Angle", description: "Arms straight out from shoulders.", coachTip: "Thumbs up." },
     { step: 2, title: "Lift", description: "Raise parallel to floor.", coachTip: "Rear shoulder focus." },
     { step: 3, title: "Lower", description: "Lower smoothly.", coachTip: "Exhale." }
   ]
  ],
  ["ex-prone-w-raise-fri", "Prone Bench W-Raise (Rotator Cuff Armor)", "Friday", 11, "Infraspinatus & External Rotators", ["Rear Delts"], "Incline 30°", "bench_and_dumbbells", "Initiate", 5, "Initiate Scapular Armor", 3, 12, 15, 60, 5,
   ["Lie chest down on 30° bench, elbows bent at 90°, externally rotate up to W."],
   ["Rotate forearms up", "External rotation focus"],
   ["Internal rotation", "Jerking"],
   ["Prone Y Raise", "Prone T Raise"],
   [
     { step: 1, title: "W-Angle", description: "Elbows at 90°.", coachTip: "Light weight." },
     { step: 2, title: "Rotate", description: "Rotate forearms up toward ceiling.", coachTip: "Rotator cuff burns." },
     { step: 3, title: "Lower", description: "Lower under control.", coachTip: "Inhale." }
   ]
  ],
  ["ex-standing-lateral-fri", "Standing Lateral Raise (Strict Cadence)", "Friday", 12, "Lateral Deltoid", ["Forearms"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 3, 12, 15, 60, 6,
   ["Stand tall, raise dumbbells out to sides with 3-second lowering."],
   ["Lead with elbows", "Slight forward torso pitch"],
   ["Swinging hips", "Shrugging neck"],
   ["Seated Lateral Raise", "Leaning Lateral Raise"],
   [
     { step: 1, title: "Setup", description: "Athletic stance, dumbbells at sides.", coachTip: "Tight abs." },
     { step: 2, title: "Raise", description: "Raise to shoulder height.", coachTip: "Elbows high." },
     { step: 3, title: "Slow Negative", description: "Lower over 3 seconds.", coachTip: "Exhale." }
   ]
  ],
  ["ex-seated-lateral-fri", "Seated Lateral Raise (Isolation)", "Friday", 13, "Lateral Deltoid", ["Forearms"], "Seated 90°", "bench_and_dumbbells", "Recruit", 2, "Recruit Stage II", 3, 12, 15, 60, 6,
   ["Sit on bench edge, raise dumbbells without leg drive."],
   ["Zero leg momentum", "Pure side delt tension"],
   ["Rocking body", "Lifting weights too high"],
   ["Standing Lateral Raise", "Leaning Lateral Raise"],
   [
     { step: 1, title: "Seated Setup", description: "Perched on bench edge.", coachTip: "Feet flat." },
     { step: 2, title: "Pure Arc", description: "Sweep out to sides.", coachTip: "Side delt cap." },
     { step: 3, title: "Down", description: "Lower smoothly.", coachTip: "Inhale." }
   ]
  ],
  ["ex-leaning-lateral-fri", "Leaning Single-Arm Lateral Raise (Peak Stretch)", "Friday", 14, "Lateral Deltoid", ["Forearms"], "Floor / Standing", "dumbbells", "Initiate", 5, "Initiate Deltoid Stretch", 3, 12, 15, 60, 6,
   ["Lean 20° from post/bench, perform lateral raise with outside arm."],
   ["Extended range of motion", "Loaded stretch at bottom"],
   ["Swinging torso", "Bent elbow"],
   ["Standing Lateral Raise", "Seated Lateral Raise"],
   [
     { step: 1, title: "Lean Setup", description: "Hold bench, lean out 20°.", coachTip: "Arm hanging." },
     { step: 2, title: "Sweep", description: "Raise to parallel.", coachTip: "Constant tension." },
     { step: 3, title: "Return", description: "Lower past hip into stretch.", coachTip: "Exhale." }
   ]
  ],
  ["ex-single-arm-lateral-raise", "Single-Arm Standing Lateral Raise", "Friday", 15, "Lateral Deltoid Unilateral", ["Core"], "Floor / Standing", "dumbbells", "Recruit", 2, "Recruit Stage II", 3, 12, 15, 60, 6,
   ["Perform lateral raise with one arm at a time, other hand bracing hip."],
   ["Focus on single delt contraction", "Anti-lateral core bracing"],
   ["Tilting torso to side", "Using momentum"],
   ["Standing Lateral Raise", "Leaning Lateral Raise"],
   [
     { step: 1, title: "Single Base", description: "Stand tall, one dumbbell in hand.", coachTip: "Free hand on hip." },
     { step: 2, title: "Unilateral Arc", description: "Raise to shoulder level.", coachTip: "Pure side delt." },
     { step: 3, title: "Descent", description: "Lower slowly.", coachTip: "Repeat on both sides." }
   ]
  ],
  ["ex-lateral-raise-hold-fri", "Lateral Raise Isometric Burnout", "Friday", 16, "Lateral Deltoid Time Under Tension", ["Traps"], "Floor / Standing", "dumbbells", "Warrior", 10, "Warrior Isometric Burn", 3, 20, 30, 60, 5,
   ["Hold dumbbells at shoulder height for 20-30 seconds statically."],
   ["Hold parallel line", "Breathe through teeth"],
   ["Dropping arms", "Leaning back"],
   ["Standing Lateral Raise", "Partial Lateral Raise"],
   [
     { step: 1, title: "Hold Setup", description: "Raise dumbbells to horizontal plane.", coachTip: "Lock elbows softly." },
     { step: 2, title: "Isometric Freeze", description: "Hold for full 25 seconds.", coachTip: "Shoulders burning." },
     { step: 3, title: "Safe Release", description: "Lower under control.", coachTip: "Never drop." }
   ]
  ],
  ["ex-partial-lateral-fri", "Partial Lateral Heavy Pulses", "Friday", 17, "Lateral Deltoid Overload", ["Forearms"], "Floor / Standing", "dumbbells", "Warrior", 12, "Warrior Deltoid Overload", 3, 15, 20, 60, 6,
   ["Pulse through bottom 50% of lateral raise with heavier dumbbells."],
   ["Heavy bottom overload", "Constant pulse cadence"],
   ["Swinging with hips", "Lifting to chin"],
   ["Standing Lateral Raise", "Bent-Arm Lateral Raise"],
   [
     { step: 1, title: "Heavy Grip", description: "Hold heavier dumbbells at sides.", coachTip: "Tight abs." },
     { step: 2, title: "Bottom Pulse", description: "Pulse up to 45° only.", coachTip: "Fast rhythm." },
     { step: 3, title: "Complete Set", description: "15 to 20 partial reps.", coachTip: "Intense fatigue." }
   ]
  ],
  ["ex-db-scaption-fri", "Dumbbell Scaption (Scapular Plane)", "Friday", 18, "Supraspinatus & Lateral Deltoid", ["Serratus"], "Floor / Standing", "dumbbells", "Recruit", 2, "Recruit Rotator Armor", 3, 12, 15, 60, 6,
   ["Raise dumbbells at 30° forward angle with thumbs pointing up."],
   ["Optimal scapular biomechanics", "Joint protective"],
   ["Flaring 90° out", "Internal rotation"],
   ["Standing Lateral Raise", "Front Dumbbell Raise"],
   [
     { step: 1, title: "Scaption Base", description: "Dumbbells at 30° forward angle.", coachTip: "Thumbs up." },
     { step: 2, title: "Sweep Up", description: "Raise to shoulder level.", coachTip: "Zero impingement." },
     { step: 3, title: "Down", description: "Lower smoothly.", coachTip: "Exhale." }
   ]
  ],
  ["ex-rear-delt-iso-hold", "Rear Delt Isometric Bench Hold", "Friday", 19, "Posterior Deltoid Isometric Density", ["Rhomboids"], "Incline 30°", "bench_and_dumbbells", "Warrior", 10, "Warrior Isometric Burn", 3, 20, 30, 60, 5,
   ["Hold light dumbbells at top of incline rear delt fly for 20-30 seconds."],
   ["Pinch rear delts tight", "Breathe steadily"],
   ["Dropping arms", "Lifting chest off pad"],
   ["Incline Rear Delt Fly", "Prone Rear Delt Raise"],
   [
     { step: 1, title: "Top Fly Hold", description: "Hold dumbbells wide at horizontal line.", coachTip: "Chest on bench." },
     { step: 2, title: "Static Hold", description: "Hold for 20 to 30 seconds.", coachTip: "Posterior caps screaming." },
     { step: 3, title: "Release", description: "Lower to floor.", coachTip: "Breathe." }
   ]
  ],
  ["ex-three-way-shoulder-complex", "Controlled Three-Way Shoulder Complex", "Friday", 20, "Total 3D Deltoid Exhaustion", ["Traps", "Rotator Cuff"], "Floor / Standing", "dumbbells", "Vanguard", 20, "Vanguard Shoulder Complex", 3, 6, 8, 90, 8,
   ["Perform 6 Front Raises, immediately 6 Lateral Raises, immediately 6 Bent-Over Rear Delt Raises with light dumbbells."],
   ["Non-stop flow through all 3 heads of the shoulder", "Light weight only (1.25kg - 2.5kg plates)"],
   ["Using heavy weight (form collapses)", "Resting between phases"],
   ["Standing Lateral Raise", "Incline Rear Delt Fly"],
   [
     { step: 1, title: "Phase 1: Front Delts", description: "6 strict front raises to eye level.", coachTip: "Zero rest." },
     { step: 2, title: "Phase 2: Side Delts", description: "6 strict lateral raises to shoulder height.", coachTip: "Direct transition." },
     { step: 3, title: "Phase 3: Rear Delts", description: "Hinge at hips, 6 rear delt flyes to completion.", coachTip: "Complete 3D burn." }
   ]
  ]
];

friDelts.forEach(item => allExercises.push(makeEx(...item)));
console.log("Loaded Friday Delts: 20 movements.");

// 6. Load Saturday Arms
const satArms = [
  ["ex-standing-db-curl", "Standing Dumbbell Bicep Curl", "Saturday", 1, "Biceps Brachii (Short & Long Heads)", ["Brachialis", "Forearms"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 4, 8, 12, 75, 7,
   ["Stand tall holding dumbbells with elbows pinned tight to sides.", "Curl dumbbells upward, supinating wrists (turning palms up) as weights pass thighs.", "Squeeze biceps hard at top without swinging elbows forward.", "Lower with 3-second negative to full extension."],
   ["Elbows pinned to ribcage like hinges", "Turn pinkies outward at top contraction", "Full elbow extension at bottom"],
   ["Swinging elbows forward (shifts work to front delts)", "Leaning backward with lumbar spine", "Cutting bottom stretch short"],
   ["Incline Dumbbell Curl", "Hammer Curl"],
   [
     { step: 1, title: "Elbow Pin Setup", description: "Elbows glued to side seams of shirt.", coachTip: "Chest proud." },
     { step: 2, title: "Supination Curl", description: "Curl upward, rotating palms toward ceiling as you rise.", coachTip: "Turn pinky out." },
     { step: 3, title: "Eccentric Extension", description: "Lower over 3 seconds to complete straight-arm stretch.", coachTip: "Flex triceps at bottom." }
   ]
  ],
  ["ex-alternating-db-curl", "Alternating Dumbbell Curl", "Saturday", 2, "Biceps Brachii Unilateral", ["Forearms"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 3, 10, 12, 60, 6,
   ["Curl one dumbbell at a time, supinating wrist at top. Alternate sides smoothly."],
   ["Pure focus on single bicep", "Zero body rock"],
   ["Using hip swing", "Dropping weight"],
   ["Standing Dumbbell Bicep Curl", "Incline Dumbbell Curl"],
   [
     { step: 1, title: "Alternate Ready", description: "Stand tall, dumbbells at sides.", coachTip: "Lock core." },
     { step: 2, title: "Right Curl", description: "Curl right arm, supinating hard.", coachTip: "Peak squeeze." },
     { step: 3, title: "Switch to Left", description: "Lower right, curl left.", coachTip: "Continuous cadence." }
   ]
  ],
  ["ex-incline-db-curl", "Incline Dumbbell Curl (45°)", "Saturday", 3, "Biceps Long Head (Peak & Deep Stretch)", ["Brachialis"], "Incline 45°", "bench_and_dumbbells", "Recruit", 2, "Recruit Stage II", 3, 10, 12, 75, 7,
   ["Lie back on 45° bench with arms hanging vertically behind torso.", "Curl dumbbells upward keeping upper arms perpendicular to floor.", "Feel intense loaded stretch in bicep long head."],
   ["Upper arms perpendicular to floor throughout", "Feel intense stretch in front of shoulder/bicep"],
   ["Pulling elbows forward off vertical plane", "Lifting shoulders off bench"],
   ["Standing Dumbbell Bicep Curl", "Seated Concentration Curl"],
   [
     { step: 1, title: "Incline Hang Setup", description: "Lie against 45° pad, arms hanging behind torso.", coachTip: "Bicep tendon stretched." },
     { step: 2, title: "Perpendicular Curl", description: "Curl up without moving upper arm position.", coachTip: "Pure bicep isolation." },
     { step: 3, title: "Deep Stretch Return", description: "Lower slowly to full vertical hang.", coachTip: "Inhale at bottom." }
   ]
  ],
  ["ex-hammer-curl", "Standing Dumbbell Hammer Curl", "Saturday", 4, "Brachialis & Brachioradialis", ["Forearms", "Biceps"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 3, 8, 12, 60, 6,
   ["Hold dumbbells with neutral grip (palms facing each other) throughout.", "Curl dumbbells straight up without rotating wrists, squeezing brachialis."],
   ["Palms face each other entire rep", "Builds arm thickness and forearm size"],
   ["Swinging weights", "Flaring elbows wide"],
   ["Cross-Body Hammer Curl", "Reverse Dumbbell Curl"],
   [
     { step: 1, title: "Neutral Grip Setup", description: "Palms facing thighs like holding hammers.", coachTip: "Lock wrists." },
     { step: 2, title: "Hammer Drive", description: "Curl straight up toward shoulders.", coachTip: "Feel outer arm and forearm." },
     { step: 3, title: "Controlled Down", description: "Lower along same path.", coachTip: "Exhale up." }
   ]
  ],
  ["ex-cross-body-hammer-curl", "Cross-Body Hammer Curl (Pinwheel Curl)", "Saturday", 5, "Brachialis & Outer Bicep Peak", ["Forearms"], "Floor / Standing", "dumbbells", "Initiate", 5, "Initiate Arm Width", 3, 10, 12, 60, 6,
   ["Curl dumbbell diagonally across chest toward opposite shoulder with neutral grip."],
   ["Curl diagonally across chest", "Directly targets brachialis muscle beneath bicep"],
   ["Swinging torso", "Hitting chest with weight"],
   ["Standing Dumbbell Hammer Curl", "Zottman Curl"],
   [
     { step: 1, title: "Cross Angle Setup", description: "Dumbbell in neutral grip at hip.", coachTip: "Chest upright." },
     { step: 2, title: "Diagonal Curl", description: "Curl across torso toward opposite collarbone.", coachTip: "Squeeze outer arm." },
     { step: 3, title: "Lower", description: "Lower back to hip cleanly.", coachTip: "Repeat on both sides." }
   ]
  ],
  ["ex-concentration-curl", "Seated Concentration Curl", "Saturday", 6, "Bicep Peak Contraction & Short Head", ["Forearms"], "Seated 90°", "bench_and_dumbbells", "Recruit", 3, "Recruit Stage III", 3, 10, 12, 60, 6,
   ["Sit on bench edge, brace tricep/elbow against inside of inner thigh.", "Curl dumbbell up to chin without moving upper arm. Squeeze peak for 2 seconds."],
   ["Elbow glued to inner thigh", "Hold 2-second peak squeeze"],
   ["Using torso momentum to rock weight up", "Lifting elbow off leg"],
   ["Standing Dumbbell Bicep Curl", "Preacher-Style Incline Curl"],
   [
     { step: 1, title: "Inner Thigh Anchor", description: "Sit on bench edge, tricep braced against inner thigh.", coachTip: "Arm hanging." },
     { step: 2, title: "Peak Curl", description: "Curl upward toward face.", coachTip: "Hold 2s contraction." },
     { step: 3, title: "Full Stretch", description: "Lower to arm lockout.", coachTip: "Zero swinging." }
   ]
  ],
  ["ex-seated-db-curl", "Seated Dual Dumbbell Curl", "Saturday", 7, "Biceps Brachii Strict", ["Forearms"], "Seated 90°", "bench_and_dumbbells", "Recruit", 2, "Recruit Stage II", 3, 10, 12, 60, 6,
   ["Sit tall against 90° bench, curl both dumbbells simultaneously."],
   ["Strict back support eliminates cheating", "Supinate wrists at top"],
   ["Leaning forward off pad", "Rushing negative"],
   ["Standing Dumbbell Bicep Curl", "Incline Dumbbell Curl"],
   [
     { step: 1, title: "90° Seated Setup", description: "Sit upright against bench backrest.", coachTip: "Palms facing forward." },
     { step: 2, title: "Simultaneous Curl", description: "Curl both arms smoothly.", coachTip: "Squeeze at top." },
     { step: 3, title: "Lower", description: "Lower over 3 seconds.", coachTip: "Inhale down." }
   ]
  ],
  ["ex-zottman-curl", "Zottman Curl", "Saturday", 8, "Biceps on Way Up, Forearms on Way Down", ["Brachioradialis", "Biceps"], "Floor / Standing", "dumbbells", "Initiate", 6, "Initiate Grip Mastery", 3, 10, 12, 60, 6,
   ["Curl up with palms facing up (supinated).", "At the top, rotate wrists 180° so palms face down (pronated).", "Lower down over 3 seconds with palms facing down to annihilate forearms."],
   ["Curl supinated, lower pronated", "Slow 3-second negative on forearm phase"],
   ["Rotating while moving (rotate only at top)", "Using too heavy weight"],
   ["Reverse Dumbbell Curl", "Standing Dumbbell Hammer Curl"],
   [
     { step: 1, title: "Supinated Curl", description: "Curl up with palms facing ceiling.", coachTip: "Biceps do lifting." },
     { step: 2, title: "Top Rotation", description: "At top peak, rotate wrists 180° palms down.", coachTip: "Overhand grip." },
     { step: 3, title: "Pronated Negative", description: "Lower with overhand grip over 3 seconds.", coachTip: "Forearms burn." }
   ]
  ],
  ["ex-reverse-db-curl", "Reverse-Grip Dumbbell Curl", "Saturday", 9, "Brachioradialis & Forearm Extensors", ["Brachialis"], "Floor / Standing", "dumbbells", "Initiate", 5, "Initiate Forearm Armor", 3, 10, 12, 60, 6,
   ["Hold dumbbells with overhand grip (palms facing down).", "Curl upward keeping wrists straight and firm."],
   ["Keep wrists completely neutral (do not let wrists bend)", "Builds massive upper forearm ridge"],
   ["Curling wrists upward (cocking wrists)", "Using momentum"],
   ["Zottman Curl", "Standing Dumbbell Hammer Curl"],
   [
     { step: 1, title: "Overhand Grip", description: "Palms facing down, knuckles forward.", coachTip: "Lock wrists." },
     { step: 2, title: "Forearm Curl", description: "Curl up to chest height.", coachTip: "Feel top of forearms." },
     { step: 3, title: "Down", description: "Lower with control.", coachTip: "Exhale." }
   ]
  ],
  ["ex-drag-curl", "Dumbbell Drag Curl", "Saturday", 10, "Bicep Peak & Short Head", ["Forearms"], "Floor / Standing", "dumbbells", "Initiate", 7, "Initiate Bicep Peak", 3, 10, 12, 60, 6,
   ["Pull elbows straight back behind torso as dumbbells drag up along your torso/ribs."],
   ["Elbows travel backward", "Dumbbells drag up shirt in straight vertical line"],
   ["Curling elbows forward", "Swinging weights"],
   ["Standing Dumbbell Bicep Curl", "Seated Concentration Curl"],
   [
     { step: 1, title: "Drag Setup", description: "Dumbbells against thighs.", coachTip: "Chest proud." },
     { step: 2, title: "Elbow Pull Back", description: "Pull elbows backward as weights drag up torso.", coachTip: "Zero shoulder involvement." },
     { step: 3, title: "Peak Squeeze", description: "Squeeze biceps at nipple line.", coachTip: "Drag down." }
   ]
  ],
  ["ex-preacher-curl", "Preacher-Style Incline Dumbbell Curl (60°)", "Saturday", 11, "Bicep Short Head Strict Isolation", ["Forearms"], "Incline 60°", "bench_and_dumbbells", "Initiate", 6, "Initiate Preacher Isolation", 3, 10, 12, 60, 6,
   ["Stand behind 60° bench, drape arm over backrest like a preacher bench pad.", "Curl dumbbell up to chin with zero body momentum."],
   ["Upper arm locked against bench pad", "Eliminates all shoulder assistance"],
   ["Hyperextending elbow at bottom", "Lifting arm off pad"],
   ["Seated Concentration Curl", "Incline Dumbbell Curl"],
   [
     { step: 1, title: "Bench Arm Rest", description: "Rest tricep and armpit on top edge of 60° bench.", coachTip: "Arm extended." },
     { step: 2, title: "Preacher Curl", description: "Curl dumbbell up toward face.", coachTip: "Pure bicep tension." },
     { step: 3, title: "Careful Lower", description: "Lower under control stopping just shy of hyperextension.", coachTip: "Repeat on both sides." }
   ]
  ],
  ["ex-overhead-db-tricep-ext", "Overhead Two-Handed Dumbbell Triceps Extension", "Saturday", 12, "Triceps Long Head (Arm Size & Stretch)", ["Anconeus"], "Seated 90°", "bench_and_dumbbells", "Recruit", 1, "Awakening Foundation", 4, 10, 12, 75, 7,
   ["Sit upright on 90° bench, cup one heavy dumbbell overhead with diamond grip under top plate.", "Lower dumbbell behind head keeping elbows tucked pointing forward.", "Drive back up to arms length, flexing triceps at top."],
   ["Elbows stay tucked pointing forward (do not flare wide)", "Deep loaded stretch in armpits/triceps"],
   ["Flaring elbows 90 degrees out", "Arching lower back off bench pad"],
   ["Single-Arm Overhead Extension", "Dumbbell Skull Crusher"],
   [
     { step: 1, title: "Diamond Cup Setup", description: "Sit upright, cup top dumbbell plate overhead.", coachTip: "Elbows in." },
     { step: 2, title: "Behind Head Descent", description: "Lower dumbbell behind neck until forearms touch biceps.", coachTip: "Inhale deep." },
     { step: 3, title: "Triceps Extension", description: "Press straight up to ceiling, squeezing triceps.", coachTip: "Exhale through teeth." }
   ]
  ],
  ["ex-single-arm-overhead-ext", "Single-Arm Overhead Dumbbell Extension", "Saturday", 13, "Triceps Long Head Unilateral", ["Core"], "Seated 90°", "bench_and_dumbbells", "Recruit", 2, "Recruit Stage II", 3, 10, 12, 60, 6,
   ["Sit on bench, hold single dumbbell overhead with one arm.", "Lower behind head, press to top lockout."],
   ["Unilateral triceps isolation", "Support working elbow with free hand if needed"],
   ["Elbow drifting forward", "Dropping weight"],
   ["Overhead Two-Handed Dumbbell Triceps Extension", "Dumbbell Skull Crusher"],
   [
     { step: 1, title: "Single Overhead", description: "One dumbbell locked overhead, elbow tucked.", coachTip: "Spine straight." },
     { step: 2, title: "Deep Bend", description: "Lower behind opposite ear/neck.", coachTip: "Feel triceps stretch." },
     { step: 3, title: "Drive", description: "Extend arm straight up.", coachTip: "Repeat on both sides." }
   ]
  ],
  ["ex-db-skull-crusher", "Dumbbell Skull Crusher (Lying on Bench)", "Saturday", 14, "Triceps Medial & Lateral Heads", ["Anconeus"], "Flat", "bench_and_dumbbells", "Recruit", 2, "Recruit Stage II", 3, 10, 12, 75, 7,
   ["Lie flat on bench, hold two dumbbells over chest with neutral grip.", "Hinge only at the elbows, lowering dumbbells to sides of ears/temples.", "Press back up to arms length without moving upper arms."],
   ["Upper arms angled slightly backward (10°) to keep constant tension", "Only forearms move"],
   ["Dropping dumbbells on forehead", "Moving upper arms forward and back like a pullover"],
   ["Lying Triceps Extension", "Dumbbell Floor Triceps Extension"],
   [
     { step: 1, title: "Bench Lock Setup", description: "Lie flat, dumbbells extended over forehead with slight backward angle.", coachTip: "Wrists neutral." },
     { step: 2, title: "Elbow Hinge", description: "Bend elbows, lowering dumbbells beside temples.", coachTip: "Upper arms stationary." },
     { step: 3, title: "Triceps Lock", description: "Snap forearms back to straight lockout.", coachTip: "Exhale at peak." }
   ]
  ],
  ["ex-lying-db-tricep-ext", "Lying Dumbbell Triceps Extension (Behind Head)", "Saturday", 15, "Triceps Long & Medial Heads", ["Anconeus"], "Flat", "bench_and_dumbbells", "Initiate", 5, "Initiate Triceps Length", 3, 10, 12, 75, 7,
   ["Lie flat, lower dumbbells past crown of head toward floor for maximum long head stretch."],
   ["Deep stretch behind head", "Keep elbows pointing at ceiling"],
   ["Flaring elbows wide", "Flaring lower back"],
   ["Dumbbell Skull Crusher", "Overhead Two-Handed Dumbbell Triceps Extension"],
   [
     { step: 1, title: "Lying Setup", description: "Lie flat, arms extended back 15°.", coachTip: "Tight abs." },
     { step: 2, title: "Behind Crown Drop", description: "Lower weights past top of head.", coachTip: "Deep triceps stretch." },
     { step: 3, title: "Extend", description: "Extend arms back to starting angle.", coachTip: "Exhale." }
   ]
  ],
  ["ex-floor-db-tricep-ext", "Dumbbell Floor Triceps Extension", "Saturday", 16, "Triceps Lockout (Elbow Safe)", ["Anconeus"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 3, 10, 12, 60, 6,
   ["Lie on floor, perform skull crushers with floor preventing excessive elbow drop."],
   ["Safe for sensitive elbow tendons", "Controlled cadence"],
   ["Bouncing weights on floor", "Moving upper arms"],
   ["Dumbbell Skull Crusher", "Close-Grip Push-Up"],
   [
     { step: 1, title: "Floor Setup", description: "Lie supine on floor, arms vertical.", coachTip: "Feet flat." },
     { step: 2, title: "Hinge", description: "Lower dumbbells beside ears until plates brush floor.", coachTip: "Safe depth." },
     { step: 3, title: "Press", description: "Extend arms to vertical.", coachTip: "Hard triceps squeeze." }
   ]
  ],
  ["ex-close-grip-pushup-sat", "Close-Grip Push-Up (Triceps Builder)", "Saturday", 17, "Triceps Lateral & Medial Heads", ["Chest", "Core"], "Floor / Standing", "bodyweight", "Recruit", 1, "Awakening Foundation", 3, 10, 15, 60, 6,
   ["Perform push-ups with hands shoulder-width and elbows skimming ribs."],
   ["Elbows brush ribs", "Lock triceps at top"],
   ["Flaring elbows wide", "Sagging spine"],
   ["Diamond Push-Up", "Dumbbell Skull Crusher"],
   [
     { step: 1, title: "Narrow Base", description: "Hands under shoulders, body in steel plank.", coachTip: "Tight glutes." },
     { step: 2, title: "Brush Ribs", description: "Lower with elbows hugging sides.", coachTip: "Inhale." },
     { step: 3, title: "Triceps Lock", description: "Press to full lockout.", coachTip: "Exhale." }
   ]
  ],
  ["ex-diamond-pushup", "Diamond Push-Up", "Saturday", 18, "Triceps Peak Lockout & Lateral Head", ["Inner Pecs"], "Floor / Standing", "bodyweight", "Warrior", 10, "Warrior Bodyweight Arms", 3, 8, 12, 75, 7,
   ["Place index fingers and thumbs together forming diamond directly under center of chest.", "Lower chest to touch diamond, press up to forceful triceps lockout."],
   ["Diamond shape under sternum", "Peak triceps contraction"],
   ["Shoulder pain (widen hands slightly if needed)", "Cutting depth short"],
   ["Close-Grip Push-Up", "Dumbbell Skull Crusher"],
   [
     { step: 1, title: "Diamond Window", description: "Thumbs and index fingers touching under sternum.", coachTip: "Plank posture." },
     { step: 2, title: "Sternum Touch", description: "Lower chest to graze diamond hands.", coachTip: "Elbows tucked." },
     { step: 3, title: "Explosive Lock", description: "Drive palms into mat to full arm lockout.", coachTip: "Squeeze triceps." }
   ]
  ],
  ["ex-db-tricep-kickback", "Dumbbell Triceps Kickback (Chest Supported 45°)", "Saturday", 19, "Triceps Lateral Head Peak Contraction", ["Rear Delts"], "Incline 45°", "bench_and_dumbbells", "Initiate", 5, "Initiate Triceps Peak", 3, 12, 15, 60, 6,
   ["Lie chest-down on 45° bench, pin upper arms parallel to torso.", "Extend forearms backward until arms are completely straight, squeezing triceps for 2 seconds."],
   ["Chest supported eliminates cheating", "Hold 2-second squeeze with arms straight as rods"],
   ["Dropping elbows below torso level", "Swinging weights with momentum"],
   ["Overhead Two-Handed Dumbbell Triceps Extension", "Dumbbell Tate Press"],
   [
     { step: 1, title: "Pin Upper Arms", description: "Chest on 45° bench, upper arms pinned high parallel to torso.", coachTip: "Elbows up." },
     { step: 2, title: "Kick Back", description: "Snap forearms straight back to ceiling.", coachTip: "Hold 2s peak." },
     { step: 3, title: "Control", description: "Return to 90° bend only.", coachTip: "Never drop elbows." }
   ]
  ],
  ["ex-db-tate-press", "Dumbbell Tate Press (Flat Bench)", "Saturday", 20, "Triceps Lateral Head (Horseshoe Width)", ["Anconeus"], "Flat", "bench_and_dumbbells", "Warrior", 12, "Warrior Triceps Horseshoe", 3, 10, 12, 60, 6,
   ["Lie flat, hold dumbbells over chest with palms facing feet and bells touching.", "Bend elbows out wide, lowering inner heads of dumbbells to touch chest, then press back up."],
   ["Palms face feet", "Elbows flare wide as bells touch chest"],
   ["Moving upper arms", "Bouncing off sternum"],
   ["Dumbbell Skull Crusher", "Dumbbell Triceps Kickback"],
   [
     { step: 1, title: "Tate Setup", description: "Lie flat, dumbbells over chest, palms facing feet.", coachTip: "Bells touching." },
     { step: 2, title: "Chest Touch", description: "Bend elbows wide, lowering bells to graze chest.", coachTip: "Feel triceps stretch." },
     { step: 3, title: "Snap Lockout", description: "Press back to top, locking triceps hard.", coachTip: "Exhale." }
   ]
  ]
];

satArms.forEach(item => allExercises.push(makeEx(...item)));
console.log("Loaded Saturday Arms: 20 movements.");

// 7. Load Upper Belly Protocol (Day A: Mon, Wed, Fri)
const upperBelly = [
  ["ex-incline-bench-crunch", "Incline Bench Crunch", "Monday", 21, "Upper Rectus Abdominis", ["Deep Core"], "Incline 30°", "bench_and_dumbbells", "Recruit", 1, "Daily Belly Protocol Day A", 3, 15, 20, 45, 5,
   ["Lie on 30° bench with knees bent and feet hooked.", "Curl ribcage down toward pelvis, crunching upper abs hard for 1 second at top."],
   ["Roll ribcage down toward hips", "Exhale all air at peak"],
   ["Yanking on neck with hands", "Arching lower back"],
   ["Dumbbell Crunch Pulse", "Hollow Body Hold"],
   [
     { step: 1, title: "Bench Curl Setup", description: "Lie against incline bench, feet anchored.", coachTip: "Fingertips on temples." },
     { step: 2, title: "Rib-to-Pelvis Curl", description: "Curl ribcage down, flexing upper abs violently.", coachTip: "Exhale fully." },
     { step: 3, title: "Controlled Unroll", description: "Lower with control.", coachTip: "Inhale." }
   ]
  ],
  ["ex-hollow-body-hold", "Hollow Body Hold", "Wednesday", 21, "Transverse Abdominis & Deep Core", ["Rectus Abdominis"], "Floor / Standing", "bodyweight", "Recruit", 2, "Daily Belly Protocol Day A", 3, 30, 45, 45, 5,
   ["Lie on back, press lumbar spine flat into floor with zero gap.", "Extend arms overhead and legs forward hovering 6 inches off floor, holding rigid banana shape."],
   ["Lower back must stay glued to floor", "Glutes and abs clenched"],
   ["Lower back arching off floor (stop immediately)", "Holding breath"],
   ["Incline Bench Crunch", "Dumbbell Crunch Pulse"],
   [
     { step: 1, title: "Floor Flatten", description: "Lie flat, smash lower back into floor.", coachTip: "Zero gap." },
     { step: 2, title: "Hollow Banana", description: "Elevate shoulders and heels 6 inches off floor.", coachTip: "Arms overhead." },
     { step: 3, title: "Steady Breathing", description: "Hold for 30-45 seconds taking shallow breaths.", coachTip: "Rock solid." }
   ]
  ],
  ["ex-db-crunch-pulse", "Dumbbell Crunch Pulse (Plate Held High)", "Friday", 21, "Upper Rectus Abdominis (Loaded)", ["Intercostals"], "Floor / Standing", "dumbbells", "Initiate", 5, "Daily Belly Protocol Day A", 3, 15, 20, 45, 5,
   ["Lie on back with knees bent, holding 2.5kg or 5kg plate straight up toward ceiling.", "Pulse upper shoulders off floor pushing weight directly toward ceiling."],
   ["Push weight vertically to ceiling", "Short forceful pulses"],
   ["Swinging arms forward", "Jerking head"],
   ["Incline Bench Crunch", "Hollow Body Hold"],
   [
     { step: 1, title: "Vertical Plate", description: "Hold plate straight up over chest.", coachTip: "Eyes on plate." },
     { step: 2, title: "Ceiling Pulse", description: "Crunch up pushing plate toward ceiling.", coachTip: "Short sharp pulse." },
     { step: 3, title: "Lower", description: "Lower shoulders lightly and repeat.", coachTip: "Constant burn." }
   ]
  ],
  ["ex-bench-accordion-crunch", "Bench Accordion Crunch", "Monday", 22, "Total Rectus Abdominis", ["Hip Flexors"], "Flat", "bench_and_dumbbells", "Initiate", 5, "Daily Belly Protocol Day A", 3, 15, 20, 45, 5,
   ["Sit on edge of flat bench gripping sides.", "Simultaneously pull knees to chest and crunch torso forward like an accordion, then extend out."],
   ["Synchronized knee pull and torso crunch", "Full extension"],
   ["Slouching backward", "Touching feet to floor"],
   ["Incline Bench Crunch", "Hollow Body Hold"],
   [
     { step: 1, title: "Bench Edge Balance", description: "Perched on bench edge, hands gripping sides.", coachTip: "Legs extended." },
     { step: 2, title: "Accordion Squeeze", description: "Pull knees to chest as torso crunches forward.", coachTip: "Meet in middle." },
     { step: 3, title: "Extend", description: "Extend legs and torso out together.", coachTip: "Controlled rhythm." }
   ]
  ]
];

upperBelly.forEach(item => allExercises.push(makeEx(...item)));
console.log("Loaded Upper Belly: 4 movements.");

// 8. Load Lower Belly Protocol (Day B: Tue, Thu, Sat)
const lowerBelly = [
  ["ex-flat-bench-reverse-crunch", "Flat Bench Reverse Crunch", "Tuesday", 21, "Lower Rectus Abdominis", ["Deep Core"], "Flat", "bench_and_dumbbells", "Recruit", 1, "Daily Belly Protocol Day B", 3, 12, 15, 45, 5,
   ["Lie on flat bench, grip top of bench behind head.", "Curl knees toward chest and lift pelvis/tailbone off the bench toward ceiling.", "Lower pelvis under control with zero swinging."],
   ["Lift pelvis off bench with lower abs", "Do not swing legs for momentum"],
   ["Kicking legs instead of curling pelvis", "Dropping hips fast"],
   ["Lying Dumbbell Leg Raise", "Seated Bench Knee Tucks"],
   [
     { step: 1, title: "Bench Grip Setup", description: "Lie flat on bench, hands gripping edge behind head.", coachTip: "Knees bent 90°." },
     { step: 2, title: "Pelvis Curl", description: "Roll pelvis upward toward ribs, lifting tailbone 3 inches.", coachTip: "Pure lower ab squeeze." },
     { step: 3, title: "Controlled Roll Down", description: "Roll spine down one vertebra at a time.", coachTip: "Inhale at bottom." }
   ]
  ],
  ["ex-lying-db-leg-raise", "Lying Straight Leg Raise (with Dumbbell clamped)", "Thursday", 21, "Lower Rectus Abdominis & Psoas", ["Hip Flexors"], "Floor / Standing", "dumbbells", "Initiate", 5, "Daily Belly Protocol Day B", 3, 10, 12, 45, 5,
   ["Lie flat, clamp a light 1kg or 2kg dumbbell between feet (or bodyweight).", "Raise legs to vertical, then lower slowly stopping 2 inches off floor with lower back pinned."],
   ["Keep lower back pressed into mat", "Slow 3-second lowering"],
   ["Lower back arching off floor", "Bending knees excessively"],
   ["Flat Bench Reverse Crunch", "Seated Bench Knee Tucks"],
   [
     { step: 1, title: "Floor Clamp", description: "Lie flat, legs extended, optional light dumbbell clamped between feet.", coachTip: "Back pinned flat." },
     { step: 2, title: "Vertical Leg Lift", description: "Raise legs smoothly to 90° vertical.", coachTip: "Exhale through teeth." },
     { step: 3, title: "Hover Negative", description: "Lower slowly until heels hover 2 inches above mat.", coachTip: "Never touch floor." }
   ]
  ],
  ["ex-seated-bench-knee-tucks", "Seated Bench Knee Tucks", "Saturday", 21, "Lower Abdominals & Core Compression", ["Hip Flexors"], "Flat", "bench_and_dumbbells", "Recruit", 2, "Daily Belly Protocol Day B", 3, 15, 20, 45, 5,
   ["Sit on edge of flat bench, lean back 30° gripping bench behind hips.", "Extend legs forward, then pull knees forcefully into chest."],
   ["Continuous fluid pumping motion", "Feel lower ab contraction"],
   ["Rushing without full knee extension", "Leaning too far back"],
   ["Flat Bench Reverse Crunch", "Flutter Kicks"],
   [
     { step: 1, title: "Bench Edge Perch", description: "Sit on bench end, hands gripping behind hips.", coachTip: "Lean back 30°." },
     { step: 2, title: "Tuck Squeeze", description: "Pull knees to sternum tightly.", coachTip: "Exhale." },
     { step: 3, title: "Extend", description: "Extend legs straight forward hovering.", coachTip: "Inhale." }
   ]
  ],
  ["ex-flutter-kicks", "Scissor & Flutter Kicks", "Tuesday", 22, "Lower Ab Endurance & Transverse Core", ["Hip Flexors"], "Floor / Standing", "bodyweight", "Recruit", 1, "Daily Belly Protocol Day B", 3, 30, 45, 45, 5,
   ["Lie flat, hands under glutes to support pelvis.", "Kick legs in alternating small rapid fluttering motions 6 inches off floor for 30-45 seconds."],
   ["Small rapid kicks", "Lower back pressed flat"],
   ["Kicking too high in air", "Arching lower back"],
   ["Seated Bench Knee Tucks", "Flat Bench Reverse Crunch"],
   [
     { step: 1, title: "Pelvis Cushion", description: "Hands under glutes, head slightly lifted.", coachTip: "Spine flat." },
     { step: 2, title: "Flutter Cadence", description: "Alternate rapid flutter kicks 6 inches off mat.", coachTip: "Point toes." },
     { step: 3, title: "Endure", description: "Maintain steady shallow breathing for 45s.", coachTip: "Burn." }
   ]
  ]
];

lowerBelly.forEach(item => allExercises.push(makeEx(...item)));
console.log("Loaded Lower Belly: 4 movements.");

// 9. Load Sunday Rest & Mobility Sanctuary (6 movements)
const sundayMobility = [
  ["ex-cat-cow", "Spinal Cat-Cow Flow", "Sunday", 1, "Spinal Mobility & Lumbar Decompression", ["Thoracic Spine", "Core"], "Floor / Standing", "bodyweight", "Recruit", 1, "Sunday Recovery Sanctuary", 3, 10, 12, 30, 5,
   ["On all fours, inhale as you drop belly and look up (Cow).", "Exhale as you arch spine to ceiling and tuck chin (Cat).", "Move with gentle fluid breath."],
   ["Synchronize movement with breath", "Articulate every vertebra"],
   ["Forcing painful range of motion", "Rushing"],
   ["Thoracic Rotation", "Child's Pose"],
   [
     { step: 1, title: "Tabletop Setup", description: "Hands under shoulders, knees under hips.", coachTip: "Neutral spine." },
     { step: 2, title: "Cow Inhale", description: "Drop belly toward floor, look up softly.", coachTip: "Inhale deep." },
     { step: 3, title: "Cat Exhale", description: "Round spine up like a frightened cat, tucking chin.", coachTip: "Exhale fully." }
   ]
  ],
  ["ex-childs-pose", "Restorative Child's Pose", "Sunday", 2, "Lat Stretch & Parasympathetic Recovery", ["Lower Back", "Hips"], "Floor / Standing", "bodyweight", "Recruit", 1, "Sunday Recovery Sanctuary", 2, 45, 60, 30, 5,
   ["Sit back on heels, reach arms far forward on mat, rest forehead on floor.", "Breathe deeply into ribcage for 60 seconds."],
   ["Sink hips back to heels", "Slow parasympathetic breathing"],
   ["Tensing shoulders", "Shallow chest breathing"],
   ["Spinal Cat-Cow Flow", "Hip Flexor Stretch"],
   [
     { step: 1, title: "Kneel & Reach", description: "Knees wide, big toes touching, reach arms forward.", coachTip: "Forehead on mat." },
     { step: 2, title: "Deep Belly Breath", description: "Expand belly and lower back on every inhale.", coachTip: "4 seconds in, 6 seconds out." },
     { step: 3, title: "Sink & Surrender", description: "Allow hips to melt into heels.", coachTip: "Full relaxation." }
   ]
  ],
  ["ex-thoracic-rotation", "Thoracic Spine Rotations (Bench Supported)", "Sunday", 3, "Thoracic Spine Mobility", ["Chest", "Upper Back"], "Flat", "bench_and_dumbbells", "Recruit", 1, "Sunday Recovery Sanctuary", 2, 10, 12, 30, 5,
   ["Kneel beside bench with one forearm rested on pad.", "Reach other hand behind head and rotate elbow open toward ceiling, then back down."],
   ["Rotate through mid-back, not lower back", "Eyes follow elbow"],
   ["Twisting hips", "Forcing stiff shoulder"],
   ["Spinal Cat-Cow Flow", "Shoulder Dislocates"],
   [
     { step: 1, title: "Forearm Anchor", description: "One arm rested on bench, hand behind head.", coachTip: "Hips locked." },
     { step: 2, title: "Ceiling Rotation", description: "Rotate elbow toward sky.", coachTip: "Feel thoracic spine open." },
     { step: 3, title: "Return", description: "Lower elbow smoothly.", coachTip: "Repeat on both sides." }
   ]
  ],
  ["ex-hip-flexor-stretch", "Half-Kneeling Hip Flexor Stretch", "Sunday", 4, "Psoas & Quad Mobility", ["Glutes", "Lower Back"], "Floor / Standing", "bodyweight", "Recruit", 1, "Sunday Recovery Sanctuary", 2, 45, 60, 30, 5,
   ["In half-kneeling lunge, tuck pelvis under (posterior pelvic tilt) and squeeze back glute.", "Shift forward slightly until deep stretch is felt in front of back hip."],
   ["Posterior pelvic tilt is critical", "Squeeze trailing glute hard"],
   ["Arching lower back", "Lunging too far forward"],
   ["Restorative Child's Pose", "Hamstring Stretch"],
   [
     { step: 1, title: "Half Kneel", description: "One knee down, front foot flat at 90°.", coachTip: "Torso tall." },
     { step: 2, title: "Glute Tuck", description: "Tuck pelvis under and clench trailing glute.", coachTip: "Instant hip flexor stretch." },
     { step: 3, title: "Shift & Hold", description: "Glide forward 2 inches, hold 45 seconds.", coachTip: "Slow breathing." }
   ]
  ],
  ["ex-hamstring-stretch", "Bench-Elevated Hamstring Stretch", "Sunday", 5, "Hamstrings & Sciatic Flossing", ["Calves"], "Flat", "bench_and_dumbbells", "Recruit", 1, "Sunday Recovery Sanctuary", 2, 45, 60, 30, 5,
   ["Place heel on flat bench with leg straight and toes pulled back.", "Hinge gently forward at hips with flat spine until hamstring stretch is felt."],
   ["Keep spine completely flat", "Hinge from hip crease"],
   ["Rounding back to touch toes", "Locking knee violently"],
   ["Half-Kneeling Hip Flexor Stretch", "Spinal Cat-Cow Flow"],
   [
     { step: 1, title: "Heel on Bench", description: "Place heel on flat bench, soft micro-bend.", coachTip: "Toes pulled back." },
     { step: 2, title: "Hinge Forward", description: "Hinge chest forward with flat back.", coachTip: "Feel belly of hamstring stretch." },
     { step: 3, title: "Hold", description: "Breathe into stretch for 45s.", coachTip: "Switch sides." }
   ]
  ],
  ["ex-478-breathing", "4-7-8 Parasympathetic Recovery Breathing", "Sunday", 6, "Nervous System Reset & Cortisol Reduction", ["Vagus Nerve", "Heart Rate Variability"], "Floor / Standing", "bodyweight", "Recruit", 1, "Sunday Recovery Sanctuary", 1, 8, 10, 0, 5,
   ["Lie supine comfortably.", "Inhale through nose for 4 seconds, hold breath for 7 seconds, exhale completely through mouth for 8 seconds.", "Perform 8 cycles to activate deep parasympathetic nervous system recovery."],
   ["Count: Inhale 4s, Hold 7s, Exhale 8s", "Triggers deep nervous system restoration"],
   ["Rushing counts", "Gasping on inhale"],
   ["Restorative Child's Pose", "Spinal Cat-Cow Flow"],
   [
     { step: 1, title: "Supine Rest", description: "Lie flat on mat, one hand on belly, one on chest.", coachTip: "Close eyes." },
     { step: 2, title: "The 4-7-8 Cycle", description: "Inhale 4s through nose, hold 7s, whoosh exhale 8s.", coachTip: "Heart rate slows." },
     { step: 3, title: "System Restored", description: "Complete 8 cycles.", coachTip: "Cortisol reduced." }
   ]
  ]
];

sundayMobility.forEach(item => allExercises.push(makeEx(...item)));
console.log("Loaded Sunday Mobility: 6 movements.");

console.log("==========================================");
console.log("TOTAL EXERCISES COMPILED:", allExercises.length);
console.log("==========================================");

// Write to exerciseCatalog.ts
const fileContent = `import { DayOfWeek, HunterRank } from "@/types";

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

export const MASTER_EXERCISE_CATALOG: MasterExercise[] = ${JSON.stringify(allExercises, null, 2)};

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
`;

fs.writeFileSync('sd-quest/src/lib/data/exerciseCatalog.ts', fileContent, 'utf8');
console.log("Successfully written sd-quest/src/lib/data/exerciseCatalog.ts!");

