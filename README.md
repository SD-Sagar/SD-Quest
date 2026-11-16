# SD-QUEST: REAL-LIFE RPG PROGRESSION SYSTEM
> **"Only the Awakened Conquer Reality."**  
> A production-grade, dark-fantasy Solo Leveling life-management platform transforming daily workouts, habit disciplines, hydration, physical telemetry, and long-term milestones into an authentic real-life RPG.

---

## ⚡ TABLE OF CONTENTS
1. [Core Design Philosophy](#-core-design-philosophy)
2. [Technical Architecture & Stack](#-technical-architecture--stack)
3. [Key Systems & Engineering Highlights](#-key-systems--engineering-highlights)
4. [Supabase Database Setup & Migrations](#-supabase-database-setup--migrations)
5. [Database Reset & Clean-Wipe Utilities](#-database-reset--clean-wipe-utilities)
6. [Step-by-Step Production Deployment Guide (Vercel + Supabase)](#-step-by-step-production-deployment-guide-vercel--supabase)
7. [Biomechanical & Progression Formulas](#-biomechanical--progression-formulas)
8. [Local Development Guide](#-local-development-guide)

---

## 🗡 CORE DESIGN PHILOSOPHY

SD-Quest is engineered from the ground up to **reject trivial gamification**. In the real world, strength and discipline cannot be forged in a single afternoon.

- **Non-Trivial XP & Tier Curves**: XP and Attribute points are hard-earned. Leveling mirrors actual human neuro-muscular adaptation.
- **Rookie-to-Spartan Ranks**: Progression is divided into 4 hunter tiers:
  - **Recruit** (Levels 1–10)
  - **Warrior** (Levels 11–25)
  - **Vanguard** (Levels 26–50)
  - **Spartan** (Levels 51+)
- **Strict Zero-`localStorage` Architecture**: All player states, active workout sessions, water logs, and quests persist directly in Supabase PostgreSQL with Server Transactions and Row Level Security. Switching from desktop to mobile preserves active workouts without data loss.
- **Zero-Refresh Reactive UI**: All UI counters (Water Meter, Step Tracker, Solo Trials, Workout Completers) leverage optimistic local state updates with silent background revalidation (`router.refresh()`), eliminating manual page refreshes.
- **Local Midnight Rollover**: Dynamic calendar date computation respects local timezone offsets, automatically resetting daily water quotas and telemetry at 12:00 AM local time.

---

## 🏗 TECHNICAL ARCHITECTURE & STACK

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack, React 19) |
| **Language** | TypeScript (Strict mode, fully typed domain models) |
| **Database & Auth** | Supabase PostgreSQL 15+ with Row Level Security (RLS) & Auth Helpers |
| **State Management** | Redux Toolkit (Workout modal state, plate solvers, live timers) |
| **Styling & UI** | Tailwind CSS 3.4+, Lucide React icons, Canvas Confetti |
| **Audio Engine** | Web Audio API (Synthesized 8-bit / mana chimes, zero external asset lag) |
| **Formulas & Math** | ACSM/Compendium MET Metabolic Equations & KaTeX notation |

```
sd-quest/
├── src/
│   ├── app/                      # Next.js App Router Pages
│   │   ├── (auth)/               # Login, Register, Character Creation
│   │   ├── body/                 # Physical progression & biometric tracking
│   │   ├── calendar/             # Monthly calendar & schedule matrix
│   │   ├── diet/                 # Daily nutrition fuel & macro targets
│   │   ├── gym/                  # Main Quest: Home-Gym Trainer Hub
│   │   ├── quests/               # Quest Forge & Directive Matrix
│   │   ├── settings/             # Hunter profile & hardware inventory settings
│   │   └── page.tsx              # Daily Command Dashboard (Today View)
│   ├── components/               # React UI & Interactive Components
│   │   ├── activity/             # Walking & Step Telemetry meters
│   │   ├── character/            # Character HUD, Stats & Attribute Hexagons
│   │   ├── dashboard/            # Pinned Daily Quests & System Crates
│   │   ├── gym/                  # Active Workout Modal, Codex, Custom Manager
│   │   ├── hydration/            # Interactive One-Tap Water Meter
│   │   ├── nutrition/            # Daily fuel & staple nutrition loggers
│   │   └── quests/               # Quest List, NLP Parsers, Timed Quests
│   ├── lib/                      # Core business logic & pure calculation engines
│   │   ├── audio/                # Web Audio sound synthesizers
│   │   ├── calculations/         # Biomechanical calories, plate solvers, XP
│   │   ├── supabase/             # Server & client Supabase browser clients
│   │   └── utils.ts              # Haptic feedback & UI helpers
│   ├── server/                   # Server Actions & Data Repositories
│   │   ├── actions/              # "use server" mutating RPC actions
│   │   └── repositories/         # Supabase PostgreSQL query layers
│   └── store/                    # Redux Toolkit global slices
├── scripts/                      # Database maintenance & wipe SQL utilities
│   └── reset_all_data.sql        # Fresh-start database wipe scripts
└── supabase/
    └── migrations/               # Production SQL migrations
```

---

## 🛡 KEY SYSTEMS & ENGINEERING HIGHLIGHTS

### 1. Home-Gym Companion & Plate Solver
- Tailored specifically for a **20-in-1 multi-angle bench** and **60kg adjustable dumbbell set** (2kg handles, 5kg, 2.5kg, 2kg, 1.25kg, and 1kg plates).
- Features an exact **Greedy Plate Combinatorics Solver** that calculates the exact disc arrangement per dumbbell for any target weight.

### 2. Dual Training Paradigms: System Plan vs. Hunter Custom Plan
- **System Plan (AI Curated)**: Rotates automatically between **Week A** and **Week B** variations to prevent plateauing, scaling rep targets dynamically with user level. Includes mandatory Daily Belly protocols and level-scaled skipping rope targets.
- **Hunter Custom Plan**: Allows hunters to forge their own split days, custom exercise sets, target muscle groupings, and custom dumbbell weights.
- **Solo Trials (Individual Movement Execution)**: Hunters can launch single exercises on the fly. Completing a solo trial marks that exercise complete, credits accurate calories, and intelligently notifies the user if they later start today's full split (`CREDIT DONE (SKIP)` or `RE-DO FOR +0.25x EXTRA BONUS`).

### 3. Biomechanically Authentic Calorie Expenditure
- Rather than naive stopwatch-based calorie counts, SD-Quest combines:
  1. **Effective Muscle-Tension Duration**: $N_{\text{sets}} \times 1.9\text{ min}$.
  2. **Metabolic Equivalent of Task (MET)**: Resistance training at $6.8 - 7.6\text{ MET}$.
  3. **Mechanical Displacement Work**: $\text{Tonnage (kg)} \times 0.045$.
  4. **Skipping Plyometrics**: High-intensity cardiovascular expenditure ($11.0\text{ MET}$).
  5. **Excess Post-Exercise Oxygen Consumption (EPOC)**: Metabolic recovery burn bonus.

---

## 🗄 SUPABASE DATABASE SETUP & MIGRATIONS

To set up a fresh Supabase database for SD-Quest, navigate to **Supabase Dashboard → SQL Editor** and execute the migration files in the exact sequence below:

### Step 1: Master Schema Migration
Copy the contents of [`supabase/migrations/20261115000000_master_schema.sql`](file:///c:/Users/RIZA/Desktop/SD-Quest/sd-quest/supabase/migrations/20261115000000_master_schema.sql) and run it in the SQL Editor.
- Installs `uuid-ossp` extension.
- Creates custom PostgreSQL ENUMs (`hunter_rank`, `quest_category`, `day_of_week`, etc.).
- Creates core tables: `profiles`, `player_attributes`, `attribute_transactions`, `xp_transactions`, `equipment_inventory`, `training_splits`, `workout_sessions`, `workout_set_logs`, `quests`, `hydration_logs`, `activity_logs`, `nutrition_logs`, etc.
- Configures Row Level Security (RLS) policies ensuring players only access their own data.

### Step 2: Exercise Catalog Seed
Copy the contents of [`supabase/migrations/20261115000001_exercise_catalog_seed.sql`](file:///c:/Users/RIZA/Desktop/SD-Quest/sd-quest/supabase/migrations/20261115000001_exercise_catalog_seed.sql) and run it in the SQL Editor.
- Populates 40+ professional dumbbell, bench, bodyweight, and skipping movements with biomechanical cues, bench angles, and target muscle groups.

### Step 3: Enhancements & Session Persistence
Copy the contents of [`supabase/migrations/20261115000002_reset_and_enhancements.sql`](file:///c:/Users/RIZA/Desktop/SD-Quest/sd-quest/supabase/migrations/20261115000002_reset_and_enhancements.sql) and run it in the SQL Editor.
- Adds `active_session_state` JSONB column for cross-device real-time workout resumption.
- Creates `custom_workout_plans` table for hunter-forged training routines.
- Adds `calories_burned` column to `workout_sessions`.

---

## 🔄 DATABASE RESET & CLEAN-WIPE UTILITIES

When testing or launching fresh, you can instantly wipe the database using [`scripts/reset_all_data.sql`](file:///c:/Users/RIZA/Desktop/SD-Quest/sd-quest/scripts/reset_all_data.sql).

### Option A: Complete Gameplay Reset (Keep Email & Password)
*Use this option when you want to wipe all player progress, quests, workouts, and stats, but preserve your login account so you can log in and re-run Character Creation immediately.*

In **Supabase SQL Editor**, execute:
```sql
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS calories_burned INT DEFAULT 0;

TRUNCATE TABLE 
    workout_set_logs,
    workout_sessions,
    quest_timer_sessions,
    quests,
    attribute_transactions,
    xp_transactions,
    player_attributes,
    equipment_inventory,
    daily_nutrition_targets,
    nutrition_logs,
    hydration_logs,
    activity_logs,
    body_measurements,
    progress_photos,
    medical_sanctuary_records,
    monthly_player_snapshots,
    scheduled_reminders,
    future_self_messages,
    custom_workout_plans,
    profiles
CASCADE;
```

### Option B: Nuclear Wipe (Delete All Users & Accounts)
*Use this option to completely empty the database, including all registered authentication accounts.*

In **Supabase SQL Editor**, execute:
```sql
TRUNCATE TABLE 
    workout_set_logs,
    workout_sessions,
    quest_timer_sessions,
    quests,
    attribute_transactions,
    xp_transactions,
    player_attributes,
    equipment_inventory,
    daily_nutrition_targets,
    nutrition_logs,
    hydration_logs,
    activity_logs,
    body_measurements,
    progress_photos,
    medical_sanctuary_records,
    monthly_player_snapshots,
    scheduled_reminders,
    future_self_messages,
    custom_workout_plans,
    profiles
CASCADE;

-- Nuclear wipe: removes all login auth credentials
DELETE FROM auth.users;
```

---

## 🚀 STEP-BY-STEP PRODUCTION DEPLOYMENT GUIDE (VERCEL + SUPABASE)

Follow this end-to-end guide to deploy SD-Quest to a live production environment.

### Phase 1: Supabase Production Configuration
1. Go to [supabase.com](https://supabase.com) and log in.
2. Select your production project (e.g. `zwtvarpqlsgkhampteaj`).
3. Run the migrations described in the [Migrations section](#-supabase-database-setup--migrations) above.
4. Navigate to **Project Settings → API**:
   - Copy **Project URL** (e.g., `https://your-id.supabase.co`).
   - Copy **anon / public** API key.
   - Copy **service_role** API key (keep this secret!).
5. Navigate to **Authentication → URL Configuration**:
   - **Site URL**: Enter your production domain (e.g. `https://sd-quest.vercel.app`).
   - **Redirect URLs**: Add both your local and production endpoints:
     - `https://sd-quest.vercel.app/**`
     - `https://sd-quest.vercel.app/auth/callback`
     - `http://localhost:3000/**`

---

### Phase 2: Vercel Deployment
1. Push your latest code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: production ready SD-Quest engine"
   git push origin master
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository (`SD-Quest`).
4. In the **Configure Project** screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Select `sd-quest` (if your repository contains a parent folder) or `./`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. In **Environment Variables**, add the following 3 production variables:

| Key | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-id.supabase.co` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Anon Public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase Service Role Secret Key |

6. Click **Deploy**. Vercel will build the Next.js project using Turbopack and deploy to edge networks worldwide.

---

### Phase 3: Post-Deployment Smoke Test
1. Visit your live production URL (e.g. `https://sd-quest.vercel.app`).
2. Register a new Hunter account.
3. Complete the **Character Creation & Awakening** ritual (Height, Weight, Objective, Equipment Inventory).
4. Verify:
   - Dashboard renders Character HUD and attributes.
   - Gym Trainer loads the day's training split.
   - One-tap Water Meter increments instantly without page refresh.
   - Completing a solo trial or full session registers rewards and updates Energy Telemetry (KCAL).

---

## 🧮 BIOMECHANICAL & PROGRESSION FORMULAS

### 1. Calorie Expenditure Model (ACSM Calibrated)
$$\text{Total Burned (kcal)} = E_{\text{resistance}} + E_{\text{mechanical}} + E_{\text{skipping}} + E_{\text{EPOC}}$$

Where:
- $\text{Effective Duration } (T_{\text{eff}}) = N_{\text{sets}} \times 1.9\text{ minutes}$.
- $\text{Resistance MET} = 6.8\text{ to }7.6\text{ MET}$ based on Hunter Rank.
- $E_{\text{resistance}} = \frac{\text{MET} \times 3.5 \times \text{Weight (kg)}}{200} \times T_{\text{eff}}$.
- $E_{\text{mechanical}} = \text{Total Tonnage (kg)} \times 0.045$.
- $E_{\text{skipping}} = \frac{11.0 \times 3.5 \times \text{Weight (kg)}}{200} \times \left(\frac{\text{Skips}}{120}\right)$.
- $E_{\text{EPOC}} = (E_{\text{resistance}} + E_{\text{mechanical}}) \times 0.08$.

### 2. Experience Points (XP) Calculation
$$\text{XP}_{\text{earned}} = \text{Base XP} + \min(25, \lfloor \text{Tonnage} / 300 \rfloor) + \text{Bonus}_{\text{speed}} + \text{Bonus}_{\text{skipping}} - \text{Penalty}_{\text{skips}}$$

- **Base XP**: 85 XP for full protocol; 25 XP for Solo Trial.
- **Speed Bonus**: +15 XP & +0.10 Agility if completed within target duration.
- **Extra Workout Multiplier**: Beyond daily quota, workouts award $0.25\times$ base XP for the 1st extra, scaling by $0.50\times$ on consecutive clears.

---

## 💻 LOCAL DEVELOPMENT GUIDE

### Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm or pnpm
- A free Supabase account

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/sd-quest.git
cd sd-quest/sd-quest

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Open .env.local and add your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# Launch development server
npm run dev
```

Visit `http://localhost:3000` to begin your journey.

---

## 📜 LICENSE & ATTRIBUTION
Built with passion by the SD-Quest Engineering Team. Designed for relentless hunters pursuing physical and mental mastery.
