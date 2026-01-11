# Polysubstance Tycoon - Feature Specification

## Project Identity

**Type:** Single-page incremental idle game  
**Platform:** Web (desktop + mobile responsive)  
**Genre:** Cursed management sim / systems satire  
**Tone Ref:** Cookie Clicker's mechanical depth + Reigns' oblique consequences + an unreliable narrator who thinks they're fine

**The Vibe Check:**
This is a web toy that accidentally teaches you about compound risk by letting you optimise yourself into a corner. The game lies to you when you're doing badly. The tutorial is wrong. The tooltips get weird. You are not a person—you are The Night Manager™, and your KPIs are fucked.

---

## Safety Framework (Read This First)

### What This Game Is Not
- A consumption guide
- A dosage reference
- A "safe combinations" resource
- A how-to for getting high
- Medical or pharmacological advice

### What This Game Actually Is
A systems simulation where:
- Consequences emerge from interactions, not from moralising
- "Risk" is abstracted as game mechanics (strain, debt, collapse)
- Harm reduction concepts appear as optimisation strategies, not lectures
- The player learns by pattern recognition across multiple runs
- Safety information is encoded in consequences, not instructions

### Content Hard Limits
**Never Include:**
- Real dosage amounts (mg, mL, units)
- Timing schedules ("redose after X hours")
- Optimal combination ratios
- ROA (route of administration) specifics
- Brand names, street names, or chemical nomenclature beyond archetype labels
- "Green light" messaging that anything is safe
- Graphic depictions of overdose, self-harm, or medical crisis

**Always Include:**
- Disclaimer on first load (short, not preachy)
- Settings option to view safety resources
- Acknowledgment that the game cannot tell you what's safe
- Oblique, systemic representation of risk

### Disclaimer Text (First Load + Settings)
```
⚠️ THE FINE PRINT THAT ISN'T FINE

This is satirical systems fiction. It cannot tell you what's safe.
Real life has no save states. If you're worried about yourself 
or a mate, talk to someone who isn't a browser game.

National Alcohol and Other Drug Hotline: 1800 250 015
```

---

## Core Game Loop

### The Incremental Engine

**Primary Action:** Click "RUN THE NIGHT" button
- Generates +Vibes, -Energy
- Creates small chaos spikes
- Advances hidden timers

**Passive Production:** Every 1 second:
- Active "substances" (producers) generate Vibes
- Energy decays slowly
- Chaos fluctuates based on active modifiers
- Hidden meters accumulate (Strain, Hydration Debt, Sleep Debt, etc.)
- Time Remaining counts down

**Win/Lose Conditions:**
- No "win"—only degrees of success
- Night ends when Time Remaining = 0 OR Collapse threshold reached
- Collapse = hidden Strain exceeds tolerance (modified by Energy, Hydration, active substances)
- High Vibes at end = better prestige rewards, but Collapse = penalty

**Prestige System:**
- "Start a New Night" after completion
- Converts performance into Experience points
- Experience unlocks Knowledge Upgrades:
  - Visibility of hidden meters
  - More detailed tooltips
  - Warning system improvements
  - Log retention (memory integrity upgrades)
- Knowledge ≠ power; unlocks clarity, not advantages

---

## Primary Stats (Always Visible)

### Vibes
- **What:** Primary score; represents "quality of the night"
- **Range:** 0 to ∞
- **Generation:** Click main button + passive from substances
- **Display:** Big number, celebration effects on milestones

### Energy
- **What:** Action resource; gates active clicking
- **Range:** 0-100
- **Decay:** Slow passive drain; faster with substance use
- **Regen:** Maintenance actions, base regen when low
- **UI State:** Color shifts; <20 = red warning

### Chaos
- **What:** Volatility meter; represents environmental/social entropy
- **Range:** 0-100
- **Effects:** 
  - Low (<30): Slow passive vibe generation
  - Sweet spot (30-70): Optimal
  - High (>70): Penalties to clarity, risk multipliers increase
- **Manipulation:** Substances push it up; maintenance pulls it down

### Time Remaining
- **What:** Night duration countdown
- **Format:** MM:SS
- **Starting value:** 60:00 (adjustable via difficulty/upgrades)
- **Modifications:** Some substances extend time (stimulants) but add hidden debt

### Confidence
- **What:** THE LIAR STAT
- **Range:** 0-100
- **Purpose:** Inverse correlation with actual safety
- **Effects:**
  - <30: Accurate warnings, visible stress
  - 30-70: Mostly reliable
  - >70: UI distortions, warnings suppressed, false sense of control
- **Display:** Smiling face emoji that gets more unhinged as it rises
- **Tooltip (when >80):** "You've never felt better! 🙂"

---

## Hidden Meters (Unlocked via Knowledge)

### Strain
- **Purpose:** Collapse risk accumulator
- **Sources:** 
  - Substance combinations (especially depressants + depressants)
  - Prolonged high Chaos
  - Maintenance neglect
- **Threshold:** When Strain > (100 + modifiers), Collapse triggered
- **Initial state:** Completely hidden
- **Knowledge unlock level:** 3

### Hydration Debt
- **Purpose:** Energy regen penalty, strain multiplier
- **Sources:** Time passage, certain substances (stimulants, alcohol)
- **Reduction:** "Drink Water" maintenance action
- **Effects:** At high debt, Energy regen = 0, strain accumulates faster
- **Initial state:** Hidden
- **Knowledge unlock level:** 1

### Sleep Debt
- **Purpose:** Delayed cost of time extension
- **Sources:** Stimulant use, prolonged nights
- **Effects:** 
  - Carries over between nights (persists through prestige)
  - Increases starting costs for next night
  - Reduces starting Energy
- **Initial state:** Hidden
- **Knowledge unlock level:** 2

### Memory Integrity
- **Purpose:** UI/logging reliability
- **Range:** 0-100
- **Sources damaged by:** Sedatives, alcohol, extreme Confidence
- **Effects:**
  - <50: Logs become patchy, tooltips unreliable
  - <25: Achievement tracking fails, some UI elements disappear intermittently
  - <10: You cannot see your previous night's summary
- **Initial state:** Hidden
- **Knowledge unlock level:** 4

### Respiratory Reserve (Optional - Handle Carefully)
- **Purpose:** Abstract representation of critical system stress
- **Only include if:** Can be kept purely mechanical, no instructional detail
- **Sources:** Depressant combinations (sedatives + alcohol + opioid-type)
- **Effects:** Silent modifier on Collapse threshold; no explicit "can't breathe" messaging
- **Display:** Maybe a small lungs icon that dims? Or just pure background math
- **Initial state:** Hidden
- **Knowledge unlock level:** 5 (very late game)

---

## Substances (Producer Units)

Each substance is a purchasable "business" that generates passive Vibes/sec. They're numbered and scaled Cookie Clicker-style.

### Archetype Template
```typescript
interface SubstanceArchetype {
  id: string;
  name: string;           // Fictionalised corporate name
  description: string;    // Snarky flavor text
  baseCost: number;       // Starting purchase price
  costMultiplier: number; // Exponential scaling (1.15 standard)
  baseVibes: number;      // Vibes/sec per unit
  
  // Visible effects (tooltip + stat panel)
  energyMod: number;      // Per-tick Energy delta
  chaosMod: number;       // Chaos shift per unit active
  
  // Hidden effects (only visible with Knowledge unlocks)
  strainMod: number;      // Adds to Strain accumulator
  hydrationMod: number;   // Debt per tick
  sleepDebtMod: number;   // Debt per tick
  memoryMod: number;      // Integrity damage per tick
  confidenceMod: number;  // Boosts the liar stat
  
  // Interaction multipliers (applied when other types present)
  interactions: {
    [otherType: string]: {
      strainMultiplier?: number;  // 1.5 = 50% more strain
      effectMultiplier?: number;  // Changes base output
      specialEffect?: string;     // Custom behavior trigger
    }
  };
}
```

### MVP Substance List

#### 1. Alcohol LLC
**Tagline:** "The Foundation of Bad Decisions"
**Vibe:** The quiet villain; seems harmless early, multiplies everything else

- **Cost:** 10 Vibes (scaling 1.15x)
- **Vibes/sec:** 0.5 per unit
- **Energy:** -0.2/sec per unit
- **Chaos:** +0.5 per unit
- **Strain:** +0.3/sec per unit
- **Hydration Debt:** +0.5/sec per unit
- **Memory Integrity:** -0.4/sec per unit
- **Confidence:** +1 per unit (THE TRAP)

**Interactions:**
- With Sedative Unlimited: Strain multiplier x2.5
- With Empathogen Corp: Memory damage x2
- With Dissociative Industries: Chaos becomes unreliable (random swings)
- With Stimulant Startups: Masks Energy loss (you don't see the drain)

**Hidden mechanic:** Every 5 units, increases ALL other strain modifiers by 10%

---

#### 2. Stimulant Startups
**Tagline:** "Sleep is a Construct"
**Vibe:** Energy boosts, time extension, but the bill comes due

- **Cost:** 25 Vibes (scaling 1.2x)
- **Vibes/sec:** 1.5 per unit
- **Energy:** +0.5/sec per unit (INITIALLY)
- **Chaos:** +1.5 per unit
- **Strain:** +0.1/sec per unit (seems safe!)
- **Hydration Debt:** +1.5/sec per unit
- **Sleep Debt:** +2/sec per unit
- **Time Extension:** +5 seconds per unit purchased

**Interactions:**
- With Alcohol LLC: Masks Energy/Chaos warnings
- With Sedative Unlimited: Creates strain spike (system confusion)
- With itself (stacking): Exponential sleep debt after 10 units

**Hidden mechanic:** After 30 cumulative seconds of time extension, Energy modifier flips to -1/sec

---

#### 3. Empathogen Corp
**Tagline:** "Connection as a Service"
**Vibe:** Vibes king, but drains the tank

- **Cost:** 50 Vibes (scaling 1.25x)
- **Vibes/sec:** 3 per unit
- **Energy:** -1.2/sec per unit
- **Chaos:** Sweet spot modifier (pulls toward 50)
- **Strain:** +0.2/sec
- **Hydration Debt:** +2/sec per unit
- **Memory Integrity:** -0.3/sec (intensifies good moments, loses details)
- **Confidence:** +2 per unit

**Interactions:**
- With Alcohol LLC: Memory damage doubles
- With Stimulant Startups: Extended duration but triple hydration debt
- With Sedative Unlimited: Nullifies empathogen output (sedative wins)

**Special:** Unlocks "Check On A Mate" action (maintenance buff)

---

#### 4. Dissociative Industries
**Tagline:** "Perspective Adjustment Solutions"
**Vibe:** Chaos reduction, but you lose the controls

- **Cost:** 40 Vibes (scaling 1.18x)
- **Vibes/sec:** 1 per unit
- **Energy:** -0.5/sec per unit
- **Chaos:** -2 per unit (pulls down)
- **Strain:** +0.4/sec per unit
- **Confidence:** +3 per unit (DANGEROUS)

**Interactions:**
- With Alcohol LLC: Chaos becomes random (you can't trust the meter)
- With Sedative Unlimited: Memory integrity crashes
- With itself (high doses): UI distortion effects trigger

**Hidden mechanic:** >5 units active: some tooltips show wrong values

---

#### 5. Sedative Unlimited
**Tagline:** "Anxiety Not Found"
**Vibe:** Removes warnings, deletes memory, quiet danger

- **Cost:** 35 Vibes (scaling 1.2x)
- **Vibes/sec:** 0.8 per unit
- **Energy:** -0.8/sec per unit
- **Chaos:** -1.5 per unit (smooths everything)
- **Strain:** +0.5/sec per unit
- **Memory Integrity:** -1/sec per unit
- **Confidence:** +4 per unit (FALSE CALM)

**Interactions:**
- With Alcohol LLC: Strain x2.5, respiratory reserve damage
- With Dissociative Industries: Memory integrity = 0
- With Stimulant Startups: Creates paradoxical anxiety (chaos spikes randomly)

**Hidden mechanic:** Suppresses warning messages entirely when >3 units active

---

#### 6. Opioid Operations (OPTIONAL - Extreme Caution)
**Only include if it can remain purely abstract.**

If included:
- **Tagline:** "Comfort Logistics"
- **No explicit respiratory language**
- **Effects:** Massive Energy loss, strain accumulation, interacts catastrophically with depressants
- **Interaction with Alcohol/Sedatives:** Silent collapse risk multiplier (no explanation)
- **Display:** Just a quiet danger without detail

**Alternative:** Skip this entirely for MVP and save for post-launch if you can design it responsibly.

---

## Maintenance Actions (Boring But Important)

These are the harm reduction mechanics disguised as optimisation strategies.

### Action Template
```typescript
interface MaintenanceAction {
  id: string;
  name: string;
  description: string;
  cost: number;          // Vibes cost to perform
  cooldown: number;      // Seconds before reuse
  effects: {
    energyRestore?: number;
    chaosReduction?: number;
    strainReduction?: number;
    hydrationRestore?: number;
    memoryRestore?: number;
  };
  unlockCondition?: string; // Optional Knowledge requirement
}
```

### MVP Actions

#### Drink Water
- **Cost:** 0 Vibes
- **Cooldown:** 30 seconds
- **Effects:** -20 Hydration Debt, +5 Energy
- **Tooltip:** "Boring but effective. You hate how true this is."

#### Eat Something
- **Cost:** 5 Vibes
- **Cooldown:** 60 seconds
- **Effects:** +15 Energy, -10 Strain, +20 Time
- **Tooltip:** "Carbs are infrastructure."

#### Take a Breather
- **Cost:** 0 Vibes
- **Cooldown:** 90 seconds
- **Effects:** -20 Chaos, -15 Strain, +10 Memory Integrity
- **Special:** Pauses substance production for 10 seconds
- **Tooltip:** "Sometimes less is more. Disgusting, but true."

#### Check On A Mate
- **Unlock:** Requires Empathogen Corp purchased
- **Cost:** 0 Vibes
- **Cooldown:** 120 seconds
- **Effects:** -30 Strain, +20 Memory Integrity, +5 Energy
- **Tooltip:** "Turns out talking to humans is OP."

#### Test Your Gear
- **Unlock:** Knowledge Level 2
- **Cost:** 20 Vibes
- **Cooldown:** 180 seconds
- **Effects:** Reveals hidden substance modifiers for 30 seconds
- **Tooltip:** "Know what you're working with. Revolutionary."

#### Lie Down For A Bit
- **Unlock:** Knowledge Level 3
- **Cost:** 50 Vibes
- **Cooldown:** 300 seconds
- **Effects:** -50 Strain, +30 Energy, +15 Time
- **Special:** Disables all production for 20 seconds
- **Tooltip:** "Tactical nap. Not giving up. Tactical."

---

## UI/UX Specifications

### Layout (Mobile-First)

```
┌─────────────────────────────────────┐
│   🌙 THE NIGHT MANAGER™             │
├─────────────────────────────────────┤
│  Vibes: 1,234                       │
│  [████████░░] Energy 80/100         │
│  [░░░░████░░] Chaos 45/100          │
│  [☻] Confidence: 72 "Feeling good!" │
│  ⏱ Time: 45:23                      │
├─────────────────────────────────────┤
│                                      │
│    [  RUN THE NIGHT  ]              │
│       (Big button)                  │
│                                      │
├─────────────────────────────────────┤
│ 🏪 ACQUISITIONS                     │
│  □ Alcohol LLC (10 V) [Buy] x3      │
│  □ Stimulant Startups (25 V)        │
│  □ Empathogen Corp (50 V)           │
│  ... (expandable list)              │
├─────────────────────────────────────┤
│ 🔧 MAINTENANCE                      │
│  [Drink Water] [Eat] [Breathe]      │
│  ... (available actions)            │
├─────────────────────────────────────┤
│ 📊 INTELLIGENCE (if unlocked)       │
│  Strain: ██████░░░░ 60/100         │
│  Hydration Debt: 45                 │
│  ...                                │
├─────────────────────────────────────┤
│ 📜 LOG                              │
│  22:13 - Purchased Alcohol LLC      │
│  22:15 - Chaos rising...            │
│  (scrollable, can get corrupted)    │
└─────────────────────────────────────┘
```

### Color Palette (Suggested)
- Background: Dark (#0a0a0f)
- Primary text: Cyan (#00ffff)
- Warning: Yellow (#ffff00)
- Danger: Magenta (#ff00ff)
- Success: Green (#00ff00)
- UI elements: Muted purple (#6b4c9a)

**Aesthetic:** Retro terminal/vaporwave/cursed startup pitch deck

### Typography
- Monospace for numbers (gives spreadsheet/data vibe)
- Sans-serif for body text
- Deliberately mismatched for "unreliable" moments

---

## UI Distortion System

When Confidence >75 OR Memory Integrity <30, trigger distortions:

### Level 1 (Confidence 75-85, Memory 30-50)
- Slight text shimmer on stat numbers
- Tooltips occasionally swap adjectives ("bad" → "good")
- Log timestamps become approximate ("~22:00ish")

### Level 2 (Confidence 86-95, Memory 15-29)
- Button positions shift slightly (still clickable)
- Some stats briefly show wrong values (+/- 10%)
- Warning messages get sarcastic
  - Normal: "Energy is low"
  - Distorted: "Energy is fine probably"

### Level 3 (Confidence >95, Memory <15)
- Numbers occasionally render as "????"
- Chaos meter shows inverted values
- New tooltips appear: "Everything is great :)"
- Hidden meters might become briefly visible... showing catastrophic values... then vanish

**Critical Rule:** Must remain playable. Distortion = narrative flavor, not frustration.

---

## Achievements (Satirical Feedback)

### Early Game
- **"First Time?"** - Start your first night
- **"It's Just a Couple"** - Purchase Alcohol LLC 5 times
- **"I Can Stop Whenever"** - Reach 1000 Vibes

### Mid Game
- **"Multitasking"** - Have 3+ substance types active simultaneously
- **"Confidence Man"** - Hit 90 Confidence
- **"Who Needs Sleep"** - Extend night by 60+ seconds
- **"False Calm"** - Have Chaos <20 while Strain >70

### Late Game / Cursed
- **"Everyone's Fine"** - Reach 95 Confidence while at Collapse threshold
- **"No Notes"** - Complete night with Memory Integrity <10
- **"Unbreakable"** - Finish with 0 maintenance actions used
- **"The Mateship Buff"** - Use "Check On A Mate" 5 times in one night

### Prestige Meta
- **"Pattern Recognition"** - Complete 10 nights
- **"Knowledge Is A Curse"** - Unlock all hidden meters
- **"Harm Reduction Tycoon"** - Complete a night with max Vibes AND no Collapse using only maintenance strategies

---

## Knowledge/Prestige System

### Experience Calculation (End of Night)
```
Base XP = Vibes / 100
Collapse Penalty = -50% XP if collapsed
Maintenance Bonus = +10% per maintenance action used
Survival Bonus = +25% if completed without collapse
Time Bonus = +1 XP per 10 seconds under starting time
```

### Knowledge Level Unlocks

**Level 1 (100 XP):**
- Hydration Debt meter visible
- Maintenance action tooltips show effects
- Warning: "Things you're starting to notice"

**Level 2 (250 XP):**
- Sleep Debt meter visible
- "Test Your Gear" action unlocked
- Substance tooltips show basic interactions
- Warning: "You've seen this before"

**Level 3 (500 XP):**
- Strain meter visible
- Detailed interaction tooltips
- "Lie Down" action unlocked
- Warning: "Recognizing patterns"

**Level 4 (1000 XP):**
- Memory Integrity meter visible
- Log shows reliability indicator
- Achievement tracking shows hidden progress

**Level 5 (2000 XP):**
- All meters visible (including Respiratory if included)
- Complete interaction graph viewable
- Tooltips show exact multipliers
- Warning: "You understand The Night. It doesn't care."

---

## Technical Architecture

### File Structure
```
/src
  /game
    state.ts              # Game state interface
    tick.ts               # Main game loop (1/sec update)
    substances.ts         # Substance definitions & logic
    maintenance.ts        # Maintenance action definitions
    achievements.ts       # Achievement tracking
    prestige.ts           # XP/knowledge system
    interactions.ts       # Poly-substance interaction matrix
    collapse.ts           # End-game condition checker
  
  /ui
    /components
      StatPanel.tsx       # Visible stats display
      MainButton.tsx      # "RUN THE NIGHT" button
      SubstanceShop.tsx   # Purchase interface
      MaintenancePanel.tsx
      LogPanel.tsx        # Event log
      AchievementToast.tsx
      HiddenMeters.tsx    # Conditional render based on Knowledge
      DistortionLayer.tsx # UI corruption effects
    
    App.tsx              # Main component
  
  /hooks
    useGameLoop.ts       # Custom hook for tick system
    useLocalStorage.ts   # Save/load persistence
  
  /utils
    calculations.ts      # Stat math, scaling formulas
    constants.ts         # Balance numbers, starting values
    formatter.ts         # Number display (1.2k, 45.3M, etc)
  
  /data
    substances.json      # Substance configs (easier balance tweaking)
    achievements.json    # Achievement definitions
    disclaimer.json      # Disclaimer text + resources
  
  /styles
    App.css
    distortions.css      # Wobble/glitch effects
```

### State Management

```typescript
interface GameState {
  // Core resources
  vibes: number;
  energy: number;
  chaos: number;
  confidence: number;
  timeRemaining: number; // seconds
  
  // Hidden meters
  strain: number;
  hydrationDebt: number;
  sleepDebt: number;
  memoryIntegrity: number;
  respiratoryReserve?: number; // optional
  
  // Ownership
  substances: {
    [substanceId: string]: number; // count owned
  };
  
  // Meta progression
  experience: number;
  knowledgeLevel: number;
  nightsCompleted: number;
  achievements: string[]; // IDs of unlocked achievements
  
  // Runtime flags
  activeEffects: Effect[];
  actionCooldowns: { [actionId: string]: number };
  nightStartTime: number;
  lastTickTime: number;
  
  // UI state
  showHiddenMeters: boolean;
  distortionLevel: number;
  log: LogEntry[];
}

interface LogEntry {
  timestamp: number;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'achievement';
  corrupted?: boolean; // if memory low
}
```

### Game Loop Logic

```typescript
function gameTick(state: GameState, deltaTime: number): GameState {
  let newState = { ...state };
  
  // 1. Passive vibe generation from substances
  newState.vibes += calculatePassiveVibes(state.substances, deltaTime);
  
  // 2. Apply substance effects (energy drain, chaos, hidden meters)
  newState = applySubstanceEffects(newState, deltaTime);
  
  // 3. Update hidden meters
  newState.hydrationDebt += calculateHydrationDrain(state, deltaTime);
  newState.strain += calculateStrainAccumulation(state, deltaTime);
  newState.memoryIntegrity -= calculateMemoryDecay(state, deltaTime);
  
  // 4. Check interaction multipliers
  newState.strain *= calculateInteractionMultipliers(state.substances);
  
  // 5. Update confidence (based on substances + chaos)
  newState.confidence = calculateConfidence(state);
  
  // 6. Update distortion level (based on confidence + memory)
  newState.distortionLevel = calculateDistortion(state);
  
  // 7. Tick down time
  newState.timeRemaining -= deltaTime;
  
  // 8. Tick down cooldowns
  newState.actionCooldowns = tickCooldowns(state.actionCooldowns, deltaTime);
  
  // 9. Check collapse condition
  if (checkCollapse(newState)) {
    return handleCollapse(newState);
  }
  
  // 10. Check time ended
  if (newState.timeRemaining <= 0) {
    return handleNightEnd(newState);
  }
  
  return newState;
}
```

### Interaction Matrix Design

The interaction system should be data-driven:

```typescript
// interactions.ts
const INTERACTION_MATRIX = {
  alcohol: {
    sedative: {
      strainMultiplier: 2.5,
      specialEffect: 'respiratory_risk'
    },
    empathogen: {
      memoryMultiplier: 2.0
    },
    dissociative: {
      specialEffect: 'chaos_randomization'
    },
    stimulant: {
      specialEffect: 'mask_energy_drain'
    }
  },
  
  stimulant: {
    sedative: {
      strainMultiplier: 1.8,
      specialEffect: 'paradox_anxiety'
    }
  },
  
  // ... etc
};

function calculateInteractionMultipliers(substances: Record<string, number>): number {
  let totalMultiplier = 1.0;
  const activeTypes = Object.keys(substances).filter(id => substances[id] > 0);
  
  // Check each pair
  for (let i = 0; i < activeTypes.length; i++) {
    for (let j = i + 1; j < activeTypes.length; j++) {
      const typeA = getSubstanceType(activeTypes[i]);
      const typeB = getSubstanceType(activeTypes[j]);
      
      const interaction = INTERACTION_MATRIX[typeA]?.[typeB];
      if (interaction) {
        totalMultiplier *= (interaction.strainMultiplier || 1.0);
        
        // Trigger special effects
        if (interaction.specialEffect) {
          triggerSpecialEffect(interaction.specialEffect);
        }
      }
    }
  }
  
  return totalMultiplier;
}
```

---

## Balance Spreadsheet (Starting Values)

### Economy Scaling
- Starting Vibes: 0
- Starting Energy: 100
- Starting Chaos: 30
- Starting Time: 60:00 (3600 seconds)

### Collapse Threshold
```
Base Collapse = 100
Modified by:
  - Energy: +0.5 per point above 50
  - Hydration Debt: -0.3 per point
  - Chaos: -0.2 per point above 70
  
Collapse triggers when:
  Strain > (100 + Energy*0.5 - HydrationDebt*0.3 - max(0, Chaos-70)*0.2)
```

### Substance Cost Progression
Standard exponential: `Cost = BaseCost * (Multiplier ^ owned)`

### Experience Curve
```
Level 1: 100 XP
Level 2: 250 XP (+150)
Level 3: 500 XP (+250)
Level 4: 1000 XP (+500)
Level 5: 2000 XP (+1000)
```

### Vibe Generation Targets
- Early game (0-5 min): 50-100 vibes/sec feels good
- Mid game (5-15 min): 200-500 vibes/sec
- Late game (15+ min): Diminishing returns kick in, compound penalties dominate

---

## Accessibility Considerations

### Settings Panel Features
- **Disable UI Distortion:** Checkbox to turn off wobble/corruption effects
  - Preserves narrative but maintains readability for users with visual/vestibular issues
- **High Contrast Mode:** Stronger color differentiation
- **Reduced Motion:** Disables animations
- **Text Size Adjuster:** 3 size options (small/default/large)
- **Screen Reader Hints:** ARIA labels on all interactive elements
  - Stats announce changes on update
  - Cooldown timers are announced

### Color Blindness
- Don't rely solely on red/green for warnings
- Use icons + text labels
- Ensure 4.5:1 contrast minimum

---

## Content Writing Guide

### Tooltip Style Examples

**Bad (too clinical):**
> "Alcohol increases sedation risk when combined with benzodiazepines"

**Good (oblique + systemic):**
> "Pairs poorly with Sedative Unlimited. Very poorly. Management regrets to inform you."

---

**Bad (too instructional):**
> "MDMA depletes serotonin and requires 6-8 weeks between uses"

**Good (systemic + snarky):**
> "Empathogen Corp is a high-yield, high-drain investment. Frequent reinvestment not recommended."

---

**Bad (preachy):**
> "Remember to stay hydrated to avoid dangerous dehydration!"

**Good (optimisation framing):**
> "Hydration Debt compounds faster than you'd think. Water is free DPS."

---

### Warning Message Progression

**Normal state:**
- "Energy dropping. Consider maintenance."
- "Chaos climbing. This affects decision clarity."

**Moderate confidence:**
- "Chaos is fine actually"
- "Energy? What energy"

**High confidence:**
- "Everything is under control 🙂"
- "Strain? Never heard of her"
- "You're doing great! (Citation needed)"

---

### Log Entry Style

```
18:34 - Night started. Time to optimise.
18:35 - Purchased Alcohol LLC (x1)
18:37 - Vibes +15. Efficiency unlocked.
18:40 - Chaos rising. Interesting.
18:43 - [CORRUPTED] somethng about enrgy?
18:45 - Confidence: 87. You've never been better!
18:47 - [SYSTEM ALERT] Strain approaching... something.
18:48 - Everything's fine :)
```

---

## Launch Checklist

### Pre-Launch
- [ ] Runs in browser (Chrome, Firefox, Safari tested)
- [ ] Mobile responsive (portrait + landscape)
- [ ] Save/load from localStorage works
- [ ] Disclaimer appears on first load
- [ ] Settings panel includes resources + reset option
- [ ] All tooltips functional
- [ ] Achievement system tracking correctly
- [ ] Prestige unlocks apply correctly
- [ ] No console errors in production build

### Content Audit
- [ ] No dosage amounts mentioned anywhere
- [ ] No "safe combination" advice
- [ ] No ROA instructions
- [ ] Interactions described systemically, not chemically
- [ ] Tone is absurd, not glamorising
- [ ] Disclaimers present and not buried

### Balance Check
- [ ] Early game doesn't feel punishing
- [ ] Mid game introduces meaningful choices
- [ ] Late game creates emergence
- [ ] Collapse feels like consequence, not RNG
- [ ] Prestige rewards feel worth it
- [ ] Multiple viable strategies exist

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces critical changes
- [ ] Distortion can be disabled
- [ ] Contrast meets WCAG AA minimum
- [ ] Text scales cleanly

---

## Post-MVP Roadmap Ideas

### Content Expansion
- More substance archetypes (psychedelics, novel substances)
- Environmental modifiers (crowd size, music quality, weather)
- Social mechanics ("The Group" as a resource that helps OR increases peer pressure)
- Narrative events (random encounters, decision trees)

### Systems Depth
- Tolerance building (diminishing returns require "tolerance breaks")
- "Set and Setting" modifiers (mood, location, company)
- Risk communication mini-game (interpreting unreliable information)
- Shareable "Night Summary" cards with satirical commentary

### Meta Progression
- Daily challenges with modifiers
- "New Game+" modes with different starting conditions
- Community leaderboards (highest Vibes, longest survival, etc.)
- Unlockable "alternate nights" (warehouse rave, house party, festival)

### Educational Layer (Subtle)
- Unlockable "Field Notes" that explain real harm reduction concepts
  - Written in same cursed tone, but factual
  - Never mandatory reading
  - Appears in settings/knowledge tab
- Links to real resources (hotlines, testing services, peer support)

---

## Final Notes for Claude Code

### What Success Looks Like
A player finishes their first night thinking "that was fun and weird."

After 3-5 nights they notice: "Wait, every time I stack Alcohol + Sedative I collapse."

After 10 nights: "Oh. OH. This is teaching me about compound risk through repeatedly fucking around and finding out."

They learn harm reduction by optimising a cursed system, not by being lectured.

### Development Philosophy
- **Iterate fast:** Build MVP first, polish later
- **Keep it hackable:** Modding-friendly architecture
- **Balance by playtesting:** Numbers will need tuning
- **Embrace the jank:** Retro/cursed aesthetic forgives rough edges
- **Satirical ≠ cynical:** The game is funny but not mean

### Red Lines (Never Cross)
- No actionable consumption instructions
- No dosage specifics
- No "green light" messaging
- No graphic harm depictions
- No real brand/location names

### Green Lights (Go Wild)
- Weird UI experiments
- Snarky writing
- Mechanical depth
- Easter eggs and secrets
- Accessibility improvements
- Balance tweaks based on playtesting

---

## Build This Thing

You have:
- A clear game design
- Safety boundaries
- Technical architecture
- Content style guide
- Balance starting points

You need to create:
- React + TypeScript + Vite project
- Fully functional game loop
- Clean component structure
- LocalStorage persistence
- Responsive UI
- Snarky content

The tone is indie dev making a cursed web toy. The goal is stealth harm reduction education through systems thinking. The vibe is "what if Cookie Clicker was about risk management but lied to you when you were doing badly."

Make it playable, make it weird, make it teach without preaching.

**Let's fucking go.** 🌙
