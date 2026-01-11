// Core game state interface
export interface GameState {
  // Core resources (always visible)
  vibes: number;
  energy: number;
  chaos: number;
  confidence: number;
  timeRemaining: number; // seconds

  // Hidden meters (unlocked via Knowledge)
  strain: number;
  hydrationDebt: number;
  sleepDebt: number;
  memoryIntegrity: number;

  // Ownership
  substances: Record<string, number>; // substanceId -> count owned
  upgrades: string[]; // IDs of purchased upgrades

  // Meta progression
  experience: number;
  knowledgeLevel: number;
  nightsCompleted: number;
  daysCompleted: number;
  totalVibesEarned: number; // Lifetime vibes for achievements
  achievements: string[]; // IDs of unlocked achievements

  // Runtime flags
  actionCooldowns: Record<string, number>; // actionId -> seconds remaining
  nightStartTime: number; // timestamp
  lastTickTime: number; // timestamp
  isNightActive: boolean;
  hasCollapsed: boolean;

  // UI state
  distortionLevel: number;
  log: LogEntry[];
  showSettings: boolean;
  hasSeenDisclaimer: boolean;

  // Settings
  disableDistortion: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'default' | 'large';
}

export interface LogEntry {
  timestamp: number; // seconds into night
  message: string;
  type: 'info' | 'warning' | 'danger' | 'achievement';
  corrupted?: boolean; // if memory low
}

export interface SubstanceDefinition {
  id: string;
  name: string;           // Fictionalized corporate name
  tagline: string;        // Snarky subtitle
  description: string;    // Flavor text
  baseCost: number;       // Starting purchase price
  costMultiplier: number; // Exponential scaling (1.15 standard)
  baseVibes: number;      // Vibes/sec per unit

  // Visible effects (tooltip + stat panel)
  energyMod: number;      // Per-tick Energy delta per unit
  chaosMod: number;       // Chaos shift per unit active

  // Hidden effects (only visible with Knowledge unlocks)
  strainMod: number;      // Adds to Strain accumulator per unit
  hydrationMod: number;   // Debt per tick per unit
  sleepDebtMod: number;   // Debt per tick per unit
  memoryMod: number;      // Integrity damage per tick per unit
  confidenceMod: number;  // Boosts the liar stat per unit

  // Special mechanics
  timeExtension?: number; // Seconds added per purchase
  unlockAction?: string;  // Unlocks maintenance action
}

export interface SubstanceInteraction {
  strainMultiplier?: number;
  effectMultiplier?: number;
  specialEffect?: string;
}

export interface MaintenanceAction {
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
    timeBonus?: number;
  };
  unlockCondition?: number; // Knowledge level required
  requiresSubstance?: string; // Substance that must be owned
  pausesProduction?: number; // Seconds to pause production
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  checkCondition: (state: GameState) => boolean;
  hidden?: boolean;
}

export interface KnowledgeLevel {
  level: number;
  xpRequired: number;
  name: string;
  description: string;
  unlocks: string[];
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  tier: number; // For organizing in UI (1-5)
  substanceId?: string; // If specific to a substance
  effects: {
    clickPower?: number; // Additive bonus to clicks (e.g., 5 = +5 vibes per click)
    clickMultiplier?: number; // Multiplicative bonus (e.g., 2 = double clicks)
    productionMultiplier?: number; // Multiplier for specific substance
    globalProductionMultiplier?: number; // Multiplier for all substances
    energyCostReduction?: number; // Reduce click energy cost (e.g., 0.5 = half cost)
    chaosDampening?: number; // Reduce chaos generation (e.g., 0.5 = half chaos)
  };
  requirement?: {
    substanceOwned?: { id: string; count: number };
    totalVibes?: number;
    nightsCompleted?: number;
    upgradeOwned?: string; // Requires another upgrade first
  };
}
