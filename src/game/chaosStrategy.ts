// Chaos Strategy System - Risk/reward mechanics with player control

import { GameState } from './types';
import { ChaosThreshold, ChaosAction, ChaosStrategy, ExtendedGameState } from './progressionTypes';

// ============================================================================
// CHAOS THRESHOLDS - Passive bonuses based on current chaos level
// ============================================================================

export const CHAOS_THRESHOLDS: ChaosThreshold[] = [
  {
    min: 0,
    max: 20,
    name: '😌 Stable',
    description: 'Low chaos, stable operation. Normal gameplay.',
    effects: {
      productionMultiplier: 1.0,
      clickPowerMultiplier: 1.0,
      energyRegenMultiplier: 1.0,
    },
  },
  {
    min: 21,
    max: 40,
    name: '⚡ Energized',
    description: 'Moderate chaos brings focus. +15% production.',
    effects: {
      productionMultiplier: 1.15,
      clickPowerMultiplier: 1.0,
      energyRegenMultiplier: 1.0,
    },
  },
  {
    min: 41,
    max: 60,
    name: '🔥 Intense',
    description: 'High chaos, high output! +35% production, +20% click power.',
    effects: {
      productionMultiplier: 1.35,
      clickPowerMultiplier: 1.2,
      energyRegenMultiplier: 1.0,
    },
  },
  {
    min: 61,
    max: 80,
    name: '⚠️ Volatile',
    description: 'Dangerous levels! +60% production, +40% click power, -15% energy regen.',
    effects: {
      productionMultiplier: 1.6,
      clickPowerMultiplier: 1.4,
      energyRegenMultiplier: 0.85,
    },
  },
  {
    min: 81,
    max: 100,
    name: '💀 Transcendent',
    description: 'Reality bends! +100% production, +75% click power, -30% energy regen. Random events!',
    effects: {
      productionMultiplier: 2.0,
      clickPowerMultiplier: 1.75,
      energyRegenMultiplier: 0.7,
      specialEffect: 'random_events',
    },
  },
];

// ============================================================================
// CHAOS ACTIONS - Active abilities to manipulate chaos
// ============================================================================

export const CHAOS_ACTIONS: Record<string, ChaosAction> = {
  chaosRelease: {
    id: 'chaosRelease',
    name: '💥 Chaos Release',
    description: 'Spend 30 chaos for +3x production for 15 seconds. (30s cooldown)',
    cooldown: 30,
    chaosCost: 30,
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 1000000,
    apply: (state: GameState) => {
      if (state.chaos < 30) return;

      state.chaos = Math.max(0, state.chaos - 30);
      const extended = state as ExtendedGameState;
      extended.activeBonuses.push({
        id: 'chaos_release_' + Date.now(),
        name: 'Chaos Release',
        productionMultiplier: 3.0,
        expiresAt: Date.now() + 15000, // 15 seconds
      });
      state.log.push({
        timestamp: state.timeRemaining,
        message: '💥 Chaos Released! -30 chaos, +3x production for 15s',
        type: 'info',
      });
    },
  },

  chaosShield: {
    id: 'chaosShield',
    name: '🛡️ Chaos Shield',
    description: 'Lock chaos at current level for 60 seconds. No generation or decay. (120s cooldown)',
    cooldown: 120,
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 500000,
    apply: (state: GameState) => {
      const extended = state as ExtendedGameState;
      extended.activeBonuses.push({
        id: 'chaos_shield_' + Date.now(),
        name: 'Chaos Shield',
        expiresAt: Date.now() + 60000, // 60 seconds
      });
      state.log.push({
        timestamp: state.timeRemaining,
        message: '🛡️ Chaos Shield active! Chaos locked for 60s',
        type: 'info',
      });
    },
  },

  chaosConversion: {
    id: 'chaosConversion',
    name: '💰 Chaos Conversion',
    description: 'Spend 50 chaos to gain vibes equal to 100× your current vibes/sec. (90s cooldown)',
    cooldown: 90,
    chaosCost: 50,
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 2500000,
    apply: (state: GameState) => {
      if (state.chaos < 50) return;

      state.chaos = Math.max(0, state.chaos - 50);

      // Calculate current vibes/sec (we'll need to import this from upgradeEffects.ts)
      // For now, we'll estimate it from substances
      const vibesPerSec = calculateVibesPerSecond(state);
      const bonus = vibesPerSec * 100;

      state.vibes += bonus;
      state.totalVibesEarned += bonus;

      state.log.push({
        timestamp: state.timeRemaining,
        message: `💰 Chaos Converted! -50 chaos, +${Math.floor(bonus).toLocaleString()} vibes`,
        type: 'achievement',
      });
    },
  },

  chaosSurge: {
    id: 'chaosSurge',
    name: '⚡ Chaos Surge',
    description: 'Gain +30 chaos instantly, get +5x click power for 10 seconds. (60s cooldown)',
    cooldown: 60,
    chaosGain: 30,
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 100000,
    apply: (state: GameState) => {
      state.chaos = Math.min(100, state.chaos + 30);
      const extended = state as ExtendedGameState;
      extended.activeBonuses.push({
        id: 'chaos_surge_' + Date.now(),
        name: 'Chaos Surge',
        clickMultiplier: 5.0,
        expiresAt: Date.now() + 10000, // 10 seconds
      });
      state.log.push({
        timestamp: state.timeRemaining,
        message: '⚡ Chaos Surge! +30 chaos, +5x clicks for 10s',
        type: 'warning',
      });
    },
  },

  chaosHarvest: {
    id: 'chaosHarvest',
    name: '🌪️ Chaos Harvest',
    description: 'Spend all chaos above 50. Gain +1% production for 120s per chaos spent. (180s cooldown)',
    cooldown: 180,
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 10000000,
    apply: (state: GameState) => {
      if (state.chaos <= 50) {
        state.log.push({
          timestamp: state.timeRemaining,
          message: '🌪️ Chaos Harvest failed: Need chaos > 50',
          type: 'warning',
        });
        return;
      }

      const chaosSpent = state.chaos - 50;
      state.chaos = 50;

      const bonusMultiplier = 1 + chaosSpent * 0.01; // +1% per chaos
      const extended = state as ExtendedGameState;
      extended.activeBonuses.push({
        id: 'chaos_harvest_' + Date.now(),
        name: 'Chaos Harvest',
        productionMultiplier: bonusMultiplier,
        expiresAt: Date.now() + 120000, // 120 seconds
      });

      state.log.push({
        timestamp: state.timeRemaining,
        message: `🌪️ Chaos Harvested! -${chaosSpent} chaos, +${Math.floor((bonusMultiplier - 1) * 100)}% production for 2 minutes`,
        type: 'achievement',
      });
    },
  },

  perfectBalance: {
    id: 'perfectBalance',
    name: '☯️ Perfect Balance',
    description: 'Set chaos to exactly 50. Gain +10x production for 5 seconds. (300s cooldown)',
    cooldown: 300,
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 50000000,
    apply: (state: GameState) => {
      state.chaos = 50;
      const extended = state as ExtendedGameState;
      extended.activeBonuses.push({
        id: 'perfect_balance_' + Date.now(),
        name: 'Perfect Balance',
        productionMultiplier: 10.0,
        expiresAt: Date.now() + 5000, // 5 seconds
      });
      state.log.push({
        timestamp: state.timeRemaining,
        message: '☯️ Perfect Balance achieved! Chaos set to 50, +10x production for 5s',
        type: 'achievement',
      });
    },
  },
};

// ============================================================================
// CHAOS STRATEGIES - SIMPLIFIED: Only baseline strategy for now
// ============================================================================

export const CHAOS_STRATEGIES: Record<string, ChaosStrategy> = {
  none: {
    id: 'none',
    name: 'Baseline',
    description: 'Standard chaos mechanics. Risk and reward in balance.',
    unlockCondition: () => true,
    effects: {
      chaosThresholdMultiplier: 1.0,
      chaosDecayMultiplier: 1.0,
      chaosGenerationMultiplier: 1.0,
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getCurrentChaosThreshold(chaos: number): ChaosThreshold {
  for (const threshold of CHAOS_THRESHOLDS) {
    if (chaos >= threshold.min && chaos <= threshold.max) {
      return threshold;
    }
  }
  return CHAOS_THRESHOLDS[0]; // Default to Stable
}

export function getChaosThresholdMultipliers(
  state: ExtendedGameState
): {
  productionMultiplier: number;
  clickPowerMultiplier: number;
  energyRegenMultiplier: number;
} {
  const threshold = getCurrentChaosThreshold(state.chaos);
  const strategy = CHAOS_STRATEGIES[state.activeChaosStrategy] || CHAOS_STRATEGIES.none;

  const amplifier = strategy.effects.chaosThresholdMultiplier;

  return {
    productionMultiplier: 1 + (threshold.effects.productionMultiplier - 1) * amplifier,
    clickPowerMultiplier: 1 + (threshold.effects.clickPowerMultiplier - 1) * amplifier,
    energyRegenMultiplier: 1 + (threshold.effects.energyRegenMultiplier - 1) * amplifier,
  };
}

export function getActiveChaosStrategy(state: ExtendedGameState): ChaosStrategy {
  return CHAOS_STRATEGIES[state.activeChaosStrategy] || CHAOS_STRATEGIES.none;
}

export function getAvailableChaosStrategies(state: GameState): ChaosStrategy[] {
  return Object.values(CHAOS_STRATEGIES).filter((strategy) => strategy.unlockCondition(state));
}

export function canUseChaosAction(state: ExtendedGameState, actionId: string): boolean {
  const action = CHAOS_ACTIONS[actionId];
  if (!action) return false;
  if (!action.unlockCondition(state)) return false;

  // Check cooldown
  const cooldownRemaining = state.chaosActionCooldowns[actionId] || 0;
  if (cooldownRemaining > 0) return false;

  // Check chaos cost
  if (action.chaosCost && state.chaos < action.chaosCost) return false;

  return true;
}

export function useChaosAction(state: ExtendedGameState, actionId: string): boolean {
  if (!canUseChaosAction(state, actionId)) return false;

  const action = CHAOS_ACTIONS[actionId];
  action.apply(state);
  state.chaosActionCooldowns[actionId] = action.cooldown;

  return true;
}

export function switchChaosStrategy(state: ExtendedGameState, strategyId: string): boolean {
  const strategy = CHAOS_STRATEGIES[strategyId];
  if (!strategy) return false;
  if (!strategy.unlockCondition(state)) return false;

  state.activeChaosStrategy = strategyId;

  // Add to unlocked list
  if (!state.unlockedChaosStrategies.includes(strategyId)) {
    state.unlockedChaosStrategies.push(strategyId);
  }

  state.log.push({
    timestamp: state.timeRemaining,
    message: `🎯 Switched to ${strategy.name}`,
    type: 'info',
  });

  return true;
}

export function isChaosFrozen(state: ExtendedGameState): boolean {
  return state.activeBonuses.some((b) => b.name === 'Chaos Shield');
}

export function applyChaosStrategy(state: ExtendedGameState): void {
  const strategy = getActiveChaosStrategy(state);

  // Apply chaos cap
  if (strategy.effects.chaosCapOverride !== undefined) {
    state.chaos = Math.min(state.chaos, strategy.effects.chaosCapOverride);
  }

  // Apply chaos floor
  if (strategy.effects.chaosFloorOverride !== undefined) {
    state.chaos = Math.max(state.chaos, strategy.effects.chaosFloorOverride);
  }

  // Wildcard special effect: random chaos swings
  if (state.activeChaosStrategy === 'wildcard' && Math.random() < 0.1) {
    // 10% chance per tick
    const swing = Math.random() * 20 - 10; // +/- 10
    state.chaos = Math.max(0, Math.min(100, state.chaos + swing));
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Quick estimate of vibes/sec (will be replaced with proper calculation)
function calculateVibesPerSecond(state: GameState): number {
  // Import substances to get baseVibes
  // This is a simplified calculation
  let total = 0;
  for (const [_, count] of Object.entries(state.substances)) {
    // Assume average baseVibes of 1 (will be corrected when integrated)
    total += count * 1;
  }
  return total;
}

export function getChaosInfo(state: ExtendedGameState): {
  threshold: ChaosThreshold;
  strategy: ChaosStrategy;
  multipliers: ReturnType<typeof getChaosThresholdMultipliers>;
  isFrozen: boolean;
} {
  return {
    threshold: getCurrentChaosThreshold(state.chaos),
    strategy: getActiveChaosStrategy(state),
    multipliers: getChaosThresholdMultipliers(state),
    isFrozen: isChaosFrozen(state),
  };
}
