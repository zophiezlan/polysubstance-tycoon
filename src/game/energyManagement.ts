// Energy Management System - Transparent, controllable energy mechanics

import { GameState } from './types';
import { EnergyMode, EnergyBooster, ExtendedGameState } from './progressionTypes';

// ============================================================================
// ENERGY MODES - SIMPLIFIED: Only baseline mode for now
// ============================================================================

export const ENERGY_MODES: Record<string, EnergyMode> = {
  balanced: {
    id: 'balanced',
    name: 'Baseline',
    description: 'Standard energy mechanics. Earn energy from actions, spend it on powerful effects.',
    unlockCondition: () => true, // Always available
    effects: {
      energyRegenMultiplier: 1.0,
      clickPowerMultiplier: 1.0,
      productionMultiplier: 1.0,
    },
  },
};

// ============================================================================
// ENERGY BOOSTERS - Now cost energy instead of having cooldowns
// ============================================================================

export const ENERGY_BOOSTERS: Record<string, EnergyBooster> = {
  quickBoost: {
    id: 'quickBoost',
    name: '⚡ Quick Boost',
    description: 'Spend 15 energy for +3x click power for 10 seconds.',
    cooldown: 0, // No cooldown, just energy cost
    energyCost: 15,
    unlockCondition: () => true, // Always available
    apply: (state: GameState) => {
      const extended = state as ExtendedGameState;
      extended.activeBonuses.push({
        id: 'quick_boost_' + Date.now(),
        name: 'Quick Boost',
        clickMultiplier: 3.0,
        expiresAt: Date.now() + 10000, // 10 seconds
      });
      state.log.push({
        timestamp: state.timeRemaining,
        message: '⚡ Quick Boost! +3x clicks for 10s',
        type: 'info',
      });
    },
  },

  powerSurge: {
    id: 'powerSurge',
    name: '💥 Power Surge',
    description: 'Spend 40 energy for +5x click power AND +2x production for 15 seconds.',
    cooldown: 0,
    energyCost: 40,
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 100000,
    apply: (state: GameState) => {
      const extended = state as ExtendedGameState;
      extended.activeBonuses.push({
        id: 'power_surge_' + Date.now(),
        name: 'Power Surge',
        clickMultiplier: 5.0,
        productionMultiplier: 2.0,
        expiresAt: Date.now() + 15000, // 15 seconds
      });
      state.log.push({
        timestamp: state.timeRemaining,
        message: '💥 POWER SURGE! +5x clicks, +2x production for 15s',
        type: 'warning',
      });
    },
  },

  zenState: {
    id: 'zenState',
    name: '🧘 Zen State',
    description: 'Spend 30 energy to balance chaos at 50. Gain +3x production for 20 seconds.',
    cooldown: 0,
    energyCost: 30,
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 500000,
    apply: (state: GameState) => {
      state.chaos = 50;
      const extended = state as ExtendedGameState;
      extended.activeBonuses.push({
        id: 'zen_state_' + Date.now(),
        name: 'Zen State',
        productionMultiplier: 3.0,
        expiresAt: Date.now() + 20000, // 20 seconds
      });
      state.log.push({
        timestamp: state.timeRemaining,
        message: '🧘 Zen State achieved! Chaos balanced, +3x production for 20s',
        type: 'achievement',
      });
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getActiveEnergyMode(state: ExtendedGameState): EnergyMode {
  return ENERGY_MODES[state.activeEnergyMode] || ENERGY_MODES.balanced;
}

export function getAvailableEnergyModes(state: GameState): EnergyMode[] {
  return Object.values(ENERGY_MODES).filter((mode) => mode.unlockCondition(state));
}

export function canUseEnergyBooster(state: ExtendedGameState, boosterId: string): boolean {
  const booster = ENERGY_BOOSTERS[boosterId];
  if (!booster) return false;
  if (!booster.unlockCondition(state)) return false;

  // Check energy cost instead of cooldown
  const energyCost = booster.energyCost || 0;
  return state.energy >= energyCost;
}

export function useEnergyBooster(state: ExtendedGameState, boosterId: string): boolean {
  if (!canUseEnergyBooster(state, boosterId)) return false;

  const booster = ENERGY_BOOSTERS[boosterId];

  // Spend energy
  const energyCost = booster.energyCost || 0;
  state.energy = Math.max(0, state.energy - energyCost);

  booster.apply(state);

  return true;
}

export function switchEnergyMode(state: ExtendedGameState, modeId: string): boolean {
  const mode = ENERGY_MODES[modeId];
  if (!mode) return false;
  if (!mode.unlockCondition(state)) return false;

  state.activeEnergyMode = modeId;

  // Add to unlocked list if not already there
  if (!state.unlockedEnergyModes.includes(modeId)) {
    state.unlockedEnergyModes.push(modeId);
  }

  state.log.push({
    timestamp: state.timeRemaining,
    message: `⚡ Switched to ${mode.name}`,
    type: 'info',
  });

  return true;
}

// Calculate energy regeneration with current mode
export function calculateEnergyRegen(state: ExtendedGameState): number {
  // HYBRID MODEL: Minimal passive regeneration
  // Energy is primarily gained from actions (clicks, milestones) not passive regen
  let baseRegen = 0.0; // No passive regen by default

  // Minimal base drain to prevent energy capping at 100
  const baseDrain = -0.5; // -0.5 energy/sec keeps it from sitting at 100

  // High chaos drain (only when chaos > 80)
  let chaosDrain = 0;
  if (state.chaos > 80) {
    chaosDrain = -0.5; // Additional -0.5/sec at high chaos
  }

  return baseRegen + baseDrain + chaosDrain;
}

// Calculate energy harvesting (if in Harvester mode)
export function calculateEnergyHarvest(state: ExtendedGameState, vibesPerSecond: number): number {
  const mode = getActiveEnergyMode(state);

  if (!mode.effects.energyHarvestRate || !mode.effects.energyHarvestThreshold) {
    return 0;
  }

  if (state.energy < mode.effects.energyHarvestThreshold) {
    return 0;
  }

  const excessEnergy = state.energy - mode.effects.energyHarvestThreshold;
  const harvestRate = mode.effects.energyHarvestRate;

  // Convert excess energy to bonus vibes
  // Formula: (excess energy) × (harvest rate) × (current vibes/sec) per second
  return excessEnergy * harvestRate * vibesPerSecond;
}

// Get energy's impact on click power (from current implementation)
export function getEnergyClickMultiplier(state: ExtendedGameState): number {
  const mode = getActiveEnergyMode(state);

  // Base: energy provides 0-100% bonus (1x at 0 energy, 2x at 100 energy)
  const energyBonus = 1.0 + (state.energy / 100);

  // Apply mode multiplier
  return energyBonus * mode.effects.clickPowerMultiplier;
}

// Get energy's impact on production (new!)
export function getEnergyProductionMultiplier(state: ExtendedGameState): number {
  const mode = getActiveEnergyMode(state);

  // Energy provides a smaller bonus to production (0-25% at 100 energy)
  const energyBonus = 1.0 + (state.energy / 400);

  // Apply mode multiplier
  return energyBonus * (mode.effects.productionMultiplier || 1.0);
}
