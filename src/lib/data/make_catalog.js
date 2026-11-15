const fs = require('fs');
const path = require('path');

// Helper to construct high-quality exercise objects
function ex(id, name, splitDay, order, muscle, secondary, angle, equip, tier, lvl, criteria, sets, rMin, rMax, rest, dur, inst, cues, mistakes, alts, demos) {
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

// We will build all 140+ movements with biomechanically exact data
const exercises = [];

// ==================== MONDAY (LEGS - 20 MOVEMENTS) ====================
const monLegs = [
  ["ex-goblet-squat", "Goblet Dumbbell Squat", "Quadriceps & Glutes", ["Core", "Calves"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 4, 8, 12, 90, 8,
   ["Stand shoulder-width apart, flare toes 20° outward.", "Hold dumbbell vertically against upper chest with palms under the top plate.", "Inhale deep into belly, push hips backward and bend knees until thighs hit parallel.", "Drive through midfoot, exhale forcefully at top lockout."],
   ["Chest tall and proud", "Spread the floor with feet", "Knees track over second toe"],
   ["Knees collapsing inward (valgus)", "Rounding lower back at bottom", "Heels lifting off ground"],
   ["Dumbbell Front Squat", "Dumbbell Sumo Squat"],
   [
     { step: 1, title: "Torso & Horn Grip", description: "Cup dumbbell against sternum like a goblet, elbows tucked tight to ribs.", coachTip: "Maintain proud ribcage." },
     { step: 2, title: "The Decent", description: "Hinge hips slightly back then drop straight down between heels.", coachTip: "Inhale and brace core." },
     { step: 3, title: "Concentric Drive", description: "Push the ground away to return to full upright lockout.", coachTip: "Squeeze glutes at top." }
   ]
  ],
  ["ex-db-front-squat", "Dumbbell Front Squat", "Quadriceps & Core", ["Upper Back", "Glutes"], "Floor / Standing", "dumbbells", "Recruit", 2, "Recruit Stage II", 4, 8, 10, 90, 8,
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
  ["ex-db-sumo-squat", "Dumbbell Sumo Squat", "Adductors & Glutes", ["Quadriceps", "Hamstrings"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 3, 10, 15, 75, 7,
   ["Take a wide stance (1.5x shoulder width) with toes angled 45° outward.", "Hold single dumbbell hanging straight down between legs.", "Squat straight down, pushing knees wide along toe angle.", "Squeeze inner thighs and glutes to return to stand."],
   ["Knees wide and flared", "Vertical pelvis descent"],
   ["Leaning forward excessively", "Knees caving inwards"],
   ["Goblet Dumbbell Squat", "Lateral Lunge"],
   [
     { step: 1, title: "Wide Stance", description: "Set feet wide, toes flared 45 degrees.", coachTip: "Dumbbell hangs perpendicular." },
     { step: 2, title: "Adductor Descent", description: "Drop hips straight down, knees opening wide.", coachTip: "Feel inner thigh stretch." },
     { step: 3, title: "Glute Lockout", description: "Drive up and contract glutes forcefully.", coachTip: "Do not hyperextend spine." }
   ]
  ],
  ["ex-db-rdl", "Dumbbell Romanian Deadlift (RDL)", "Hamstrings & Glutes", ["Erectors", "Grip", "Forearms"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 4, 8, 12, 90, 8,
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
  ["ex-db-stiff-leg-dl", "Dumbbell Stiff-Leg Deadlift", "Hamstrings (Lower/Tendon)", ["Glutes", "Lower Back"], "Floor / Standing", "dumbbells", "Warrior", 10, "Warrior Rank Hinge Mastery", 3, 10, 12, 90, 7,
   ["Keep knees nearly straight (minimal micro-bend).", "Hinge at the hips, keeping back flat as weights descend lower toward ankles.", "Feel intense loaded stretch in hamstrings before reversing."],
   ["Knees almost locked but not hyperextended", "Focus on hamstring stretch"],
   ["Rounding thoracic or lumbar spine", "Jerking the weights at the bottom"],
   ["Dumbbell Romanian Deadlift (RDL)", "Single-Leg Romanian Deadlift"],
   [
     { step: 1, title: "Fixed Knee Angle", description: "Set minimal micro-bend in knees and lock the joint angle.", coachTip: "Neutral neck." },
     { step: 2, title: "Deep Stretch Descent", description: "Hinge pure at hips down to mid-shin.", coachTip: "Inhale controlled." },
     { step: 3, title: "Hamstring Pull", description: "Pull torso upright purely with hamstrings.", coachTip: "Smooth steady tempo." }
   ]
  ],
  ["ex-db-reverse-lunge", "Dumbbell Reverse Lunge", "Quadriceps & Glutes", ["Calves", "Core"], "Floor / Standing", "dumbbells", "Recruit", 2, "Recruit Stage II", 3, 10, 12, 75, 7,
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
  ["ex-db-forward-lunge", "Dumbbell Forward Lunge", "Quadriceps & Deceleration", ["Glutes", "Calves"], "Floor / Standing", "dumbbells", "Initiate", 5, "Initiate Rank Unlocked", 3, 10, 12, 75, 7,
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
  ["ex-db-walking-lunge", "Dumbbell Walking Lunge", "Total Leg Hypertrophy", ["Glutes", "Hamstrings", "Calves"], "Floor / Standing", "dumbbells", "Initiate", 7, "Initiate Dynamic Legs", 3, 12, 16, 90, 8,
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
  ["ex-bulgarian-split-squat", "Bulgarian Split Squat", "Quadriceps & Glute Isolation", ["Adductors", "Core Balance"], "Flat", "bench_and_dumbbells", "Initiate", 5, "Initiate Rank Bench Unlocked", 3, 8, 12, 90, 8,
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
  ["ex-static-split-squat", "Static Split Squat", "Quadriceps & Hip Flexors", ["Glutes", "Balance"], "Floor / Standing", "dumbbells", "Recruit", 3, "Recruit Stage III", 3, 10, 12, 75, 7,
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
  ["ex-db-step-up", "Dumbbell Step-Up", "Glute & Quad Power", ["Calves", "Core"], "Flat", "bench_and_dumbbells", "Recruit", 3, "Recruit Bench Agility", 3, 10, 12, 75, 7,
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
  ["ex-lateral-lunge", "Dumbbell Lateral Lunge", "Adductors & Glute Medius", ["Quadriceps", "Mobility"], "Floor / Standing", "dumbbells", "Initiate", 6, "Initiate Frontal Plane", 3, 10, 12, 75, 7,
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
  ["ex-db-glute-bridge", "Dumbbell Glute Bridge", "Gluteus Maximus", ["Hamstrings", "Core"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 3, 12, 15, 60, 6,
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
  ["ex-db-hip-thrust", "Dumbbell Hip Thrust", "Glute Peak Hypertrophy", ["Hamstrings", "Core"], "Flat", "bench_and_dumbbells", "Initiate", 5, "Initiate Bench Glute Power", 4, 10, 12, 90, 8,
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
  ["ex-single-leg-glute-bridge", "Single-Leg Glute Bridge", "Glute Unilateral Balance", ["Hamstrings", "Lower Back"], "Floor / Standing", "bodyweight", "Recruit", 2, "Recruit Balance", 3, 12, 15, 60, 6,
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
  ["ex-standing-db-calf-raise", "Standing Dumbbell Calf Raise", "Gastrocnemius (Calves)", ["Tibialis", "Ankles"], "Floor / Standing", "dumbbells", "Recruit", 1, "Awakening Foundation", 4, 15, 20, 60, 6,
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
  ["ex-single-leg-calf-raise", "Single-Leg Calf Raise", "Calf Unilateral Strength", ["Ankles", "Balance"], "Floor / Standing", "dumbbells", "Initiate", 5, "Initiate Ankle Stability", 3, 15, 20, 60, 6,
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
  ["ex-seated-db-calf-raise", "Seated Dumbbell Calf Raise", "Soleus (Deep Calf Muscle)", ["Ankle Stabilizers"], "Seated 90°", "bench_and_dumbbells", "Recruit", 2, "Recruit Soleus Focus", 4, 15, 20, 60, 6,
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
  ["ex-db-good-morning", "Dumbbell Good Morning", "Hamstrings & Spinal Erectors", ["Glutes", "Core"], "Floor / Standing", "dumbbells", "Warrior", 12, "Warrior Posterior Chain", 3, 10, 12, 75, 7,
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
  ["ex-single-leg-rdl", "Single-Leg Romanian Deadlift", "Hamstring & Hip Balance", ["Glute Medius", "Foot Arch", "Core"], "Floor / Standing", "dumbbells", "Warrior", 15, "Warrior Balance Mastery", 3, 8, 10, 75, 7,
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

monLegs.forEach(item => {
  exercises.push(ex(...item));
});

console.log("Monday Legs added:", monLegs.length);

// We write the script out to file so it can generate the complete file cleanly
fs.writeFileSync('sd-quest/src/lib/data/gen_catalog.js', `// Generated by scratch script`);

