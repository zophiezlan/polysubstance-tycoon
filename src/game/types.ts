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
  totalClicks: number; // Lifetime clicks
  timePlayed: number; // Total seconds played
  highestVibesPerSecond: number; // Peak passive vibes/sec
  achievements: string[]; // IDs of unlocked achievements
  insightPoints: number; // PRESTIGE CURRENCY - Permanent multiplier from resets

  // Runtime flags
  actionCooldowns: Record<string, number>; // actionId -> seconds remaining
  nightStartTime: number; // timestamp
  lastTickTime: number; // timestamp
  isNightActive: boolean;
  hasCollapsed: boolean;

  // COOKIE CLICKER MODE: Active clicking features
  comboCount: number; // Current click streak
  comboTimer: number; // Seconds until combo expires
  maxCombo: number; // Lifetime max combo
  lastClickTime: number; // timestamp for combo detection

  // PROGRESSIVE DISCLOSURE: Hidden features
  unlockedFeatures: string[]; // IDs of discovered features
  groupChatMessages: GroupChatMessage[]; // Narrative messages from friends
  organComplaints: OrganComplaint[]; // Body parts complaining
  ritualProgress: Record<string, number>; // Secret pattern detection

  // Automation/Idle features
  autoClickerLevel: number; // 0 = none, 1+ = tiers of automation
  idleMultiplier: number; // Bonus for time away

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
    sleepDebtReduction?: number; // COOKIE CLICKER MODE: Make sleep debt recoverable
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

export interface GroupChatMessage {
  id: string;
  sender: string; // Friend's name
  message: string;
  timestamp: number; // When it was sent
  substance?: string; // If triggered by specific substance
  read: boolean;
}

export interface OrganComplaint {
  id: string;
  organ: string; // 'liver', 'brain', 'kidneys', 'heart', 'lungs'
  message: string;
  severity: 'mild' | 'concerning' | 'critical';
  timestamp: number;
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
    totalClicks?: number; // COOKIE CLICKER MODE: Require certain number of clicks
  };
}
