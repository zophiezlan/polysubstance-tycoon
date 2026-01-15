// Extended types for new progression systems

import { GameState } from './types';

// ============================================================================
// ENERGY MANAGEMENT SYSTEM
// ============================================================================

export interface EnergyMode {
  id: string;
  name: string;
  description: string;
  unlockCondition: (state: GameState) => boolean;
  effects: {
    energyRegenMultiplier: number; // Multiplier to base regen
    clickPowerMultiplier: number; // Multiplier to click power
    autoClickerSpeedMultiplier?: number; // Multiplier to auto-clicker speed
    productionMultiplier?: number; // Multiplier to passive production
    energyHarvestRate?: number; // If > 0, converts energy above threshold to vibes
    energyHarvestThreshold?: number; // Energy level to start harvesting
  };
}

export interface EnergyBooster {
  id: string;
  name: string;
  description: string;
  cooldown: number; // Seconds (kept for compatibility, but boosters now use energy cost)
  energyCost?: number; // HYBRID MODEL: Energy cost to use this booster
  unlockCondition: (state: GameState) => boolean;
  apply: (state: GameState) => void; // Modifies state directly
}

// ============================================================================
// CHAOS STRATEGY SYSTEM
// ============================================================================

export interface ChaosThreshold {
  min: number;
  max: number;
  name: string;
  description: string;
  effects: {
    productionMultiplier: number;
    clickPowerMultiplier: number;
    energyRegenMultiplier: number;
    specialEffect?: string;
  };
}

export interface ChaosAction {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  chaosCost?: number; // Chaos consumed
  chaosGain?: number; // Chaos gained
  unlockCondition: (state: GameState) => boolean;
  apply: (state: GameState) => void;
}

export interface ChaosStrategy {
  id: string;
  name: string;
  description: string;
  unlockCondition: (state: GameState) => boolean;
  effects: {
    chaosThresholdMultiplier: number; // Amplifies chaos threshold bonuses
    chaosDecayMultiplier: number; // Affects decay rate
    chaosGenerationMultiplier: number; // Affects generation rate
    chaosCapOverride?: number; // If set, caps chaos at this level
    chaosFloorOverride?: number; // If set, prevents chaos from falling below
  };
}

// ============================================================================
// MILESTONE SYSTEM
// ============================================================================

export interface Milestone {
  id: string;
  name: string;
  description: string;
  category: 'vibes' | 'clicks' | 'substance' | 'collection' | 'special';
  checkCondition: (state: GameState) => boolean;
  reward: {
    permanentProductionBonus?: number; // Percentage
    permanentClickBonus?: number; // Percentage
    temporaryBonus?: {
      productionMultiplier?: number;
      clickMultiplier?: number;
      duration: number; // Seconds
    };
    unlockFeature?: string; // Feature ID to unlock
    insightPoints?: number; // Prestige currency
  };
  hidden?: boolean; // Don't show until unlocked
  repeatable?: boolean; // Can be earned multiple times
  nextThreshold?: (currentValue: number) => number; // For repeatable milestones
}

export interface ActiveBonus {
  id: string;
  name: string;
  productionMultiplier?: number;
  clickMultiplier?: number;
  expiresAt: number; // Timestamp
}

// ============================================================================
// LOADOUT/BUILD SYSTEM
// ============================================================================

export interface SavedBuild {
  id: string;
  name: string;
  timestamp: number;
  substances: Record<string, number>; // Substance counts
  energyMode: string;
  chaosStrategy: string;
  notes?: string;
}

// ============================================================================
// SPECIALIZATION SYSTEM
// ============================================================================

export interface Specialization {
  id: string;
  name: string;
  description: string;
  unlockCondition: (state: GameState) => boolean;
  effects: {
    clickPowerMultiplier: number;
    productionMultiplier: number;
    energyRegenMultiplier: number;
    chaosGenerationMultiplier: number;
    autoClickerMultiplier: number;
    specialEffect?: string;
  };
  tradeoff?: string; // Description of the downside
}

// ============================================================================
// PERMANENT UNLOCK SYSTEM
// ============================================================================

export interface PermanentUnlock {
  id: string;
  name: string;
  description: string;
  insightCost: number; // Cost in prestige currency
  category: 'automation' | 'quality-of-life' | 'build' | 'special';
  unlockCondition?: (state: GameState) => boolean;
  maxPurchases?: number; // For stackable unlocks (default 1)
}

// ============================================================================
// EXTENDED GAME STATE
// ============================================================================

export interface ExtendedGameState extends GameState {
  // Energy Management
  activeEnergyMode: string;
  unlockedEnergyModes: string[];
  energyBoosterCooldowns: Record<string, number>;
  energyHarvestAccumulator: number; // Tracks partial vibe conversions

  // Chaos Strategy
  activeChaosStrategy: string;
  unlockedChaosStrategies: string[];
  chaosActionCooldowns: Record<string, number>;
  chaosActionCharges: Record<string, number>; // For multi-use actions

  // Milestone System
  completedMilestones: string[];
  lastMilestoneVibes: number; // For tracking "every X vibes" milestones
  lastMilestoneClicks: number;
  activeBonuses: ActiveBonus[]; // Temporary milestone bonuses

  // Loadout System
  savedBuilds: SavedBuild[];
  activeBuildIndex: number; // -1 = no build active
  buildSwapCooldown: number;
  maxBuildSlots: number;

  // Specialization
  activeSpecialization: string | null;
  prestigeTier: number; // 0-5+, increases with multiple prestiges
  canRespecialization: boolean;

  // Idle/Away System
  lastActiveTime: number; // Timestamp of last interaction
  offlineProgressPending: {
    vibesGained: number;
    timeAway: number; // Seconds
    claimed: boolean;
  } | null;

  // Permanent Unlocks
  permanentUnlocks: Record<string, number>; // unlock ID -> purchase count

  // Auto-clicker (now properly tracked)
  autoClickerActive: boolean;
  autoClickerAccumulator: number; // Tracks fractional clicks

  // Statistics (for milestone tracking)
  statistics: {
    highestCombo: number;
    totalSubstancesPurchased: number;
    totalUpgradesPurchased: number;
    timeInHighChaos: number; // Seconds spent above 80 chaos
    timeInLowEnergy: number; // Seconds spent below 20 energy
    prestigeCount: number;
    maxSimultaneousSubstances: number; // Most different substances owned at once
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function isExtendedGameState(state: GameState): state is ExtendedGameState {
  return 'activeEnergyMode' in state;
}

export function upgradeToExtendedGameState(state: GameState): ExtendedGameState {
  if (isExtendedGameState(state)) {
    return state;
  }

  return {
    ...state,
    activeEnergyMode: 'balanced',
    unlockedEnergyModes: ['balanced'],
    energyBoosterCooldowns: {},
    energyHarvestAccumulator: 0,
    activeChaosStrategy: 'none',
    unlockedChaosStrategies: ['none'],
    chaosActionCooldowns: {},
    chaosActionCharges: {},
    completedMilestones: [],
    lastMilestoneVibes: 0,
    lastMilestoneClicks: 0,
    activeBonuses: [],
    savedBuilds: [],
    activeBuildIndex: -1,
    buildSwapCooldown: 0,
    maxBuildSlots: 3,
    activeSpecialization: null,
    prestigeTier: 0,
    canRespecialization: false,
    lastActiveTime: Date.now(),
    offlineProgressPending: null,
    permanentUnlocks: {},
    autoClickerActive: true,
    autoClickerAccumulator: 0,
    statistics: {
      highestCombo: 0,
      totalSubstancesPurchased: 0,
      totalUpgradesPurchased: 0,
      timeInHighChaos: 0,
      timeInLowEnergy: 0,
      prestigeCount: 0,
      maxSimultaneousSubstances: 0,
    },
  };
}
