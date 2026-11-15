const fs = require('fs');

const exercises = [];

function add(id, name, splitDay, order, muscle, secondary, angle, equip, tier, lvl, criteria, sets, rMin, rMax, rest, dur, inst, cues, mistakes, alts, demos) {
  exercises.push({
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
  });
}

// Read Monday from build_mon
require('./build_mon.js');
const monItems = JSON.parse(fs.readFileSync('sd-quest/scripts/catalog_items.json', 'utf8'));
monItems.forEach(item => exercises.push(item));

// ===================== TUESDAY: CHEST (20) =====================
const chestList = [
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

chestList.forEach(item => exercises.push(add(...item)));
console.log("Tuesday Chest written. Total exercises:", exercises.length);

fs.writeFileSync('sd-quest/scripts/catalog_stage2.json', JSON.stringify(exercises, null, 2));

