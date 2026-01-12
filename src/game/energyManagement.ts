// Energy Management System - Transparent, controllable energy mechanics

import { GameState } from './types';
import { EnergyMode, EnergyBooster, ExtendedGameState } from './progressionTypes';

// ============================================================================
// ENERGY MODES - Always unlocked, player chooses one active
// ============================================================================

export const ENERGY_MODES: Record<string, EnergyMode> = {
  balanced: {
    id: 'balanced',
    name: 'Balanced Mode',
    description: 'Normal energy regeneration and balanced bonuses. Good starting point.',
    unlockCondition: () => true, // Always available
    effects: {
      energyRegenMultiplier: 1.0,
      clickPowerMultiplier: 1.0,
      productionMultiplier: 1.0,
    },
  },

  conservation: {
    id: 'conservation',
    name: 'Conservation Mode',
    description: 'Focus on maintaining high energy. +50% energy regen, but -25% click power. Great for idle play.',
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 100000,
    effects: {
      energyRegenMultiplier: 1.5,
      clickPowerMultiplier: 0.75,
      productionMultiplier: 1.0,
    },
  },

  overdrive: {
    id: 'overdrive',
    name: 'Overdrive Mode',
    description: 'Burn energy for power! +100% click power, +50% production, but -50% energy regen. High risk, high reward.',
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 100000,
    effects: {
      energyRegenMultiplier: 0.5,
      clickPowerMultiplier: 2.0,
      productionMultiplier: 1.5,
    },
  },

  automation: {
    id: 'automation',
    name: 'Automation Mode',
    description: 'Optimize for auto-clickers. +100% auto-clicker speed, +25% production, -50% manual click power.',
    unlockCondition: (state: GameState) =>
      state.totalVibesEarned >= 500000 && state.autoClickerLevel > 0,
    effects: {
      energyRegenMultiplier: 1.0,
      clickPowerMultiplier: 0.5,
      autoClickerSpeedMultiplier: 2.0,
      productionMultiplier: 1.25,
    },
  },

  harvester: {
    id: 'harvester',
    name: 'Energy Harvester',
    description: 'Convert excess energy into vibes! Energy above 80 generates bonus vibes (1 energy = 10× current vibes/sec). -25% click power.',
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 1000000,
    effects: {
      energyRegenMultiplier: 1.25,
      clickPowerMultiplier: 0.75,
      productionMultiplier: 1.0,
      energyHarvestRate: 10,
      energyHarvestThreshold: 80,
    },
  },

  unstable: {
    id: 'unstable',
    name: 'Unstable Flux',
    description: 'Chaos reigns! All bonuses are doubled, but energy swings wildly (+/- 10 per second randomly). Unlocked at Prestige 3+.',
    unlockCondition: (state: GameState) => {
      const extended = state as ExtendedGameState;
      return extended.prestigeTier >= 3;
    },
    effects: {
      energyRegenMultiplier: 2.0,
      clickPowerMultiplier: 2.0,
      productionMultiplier: 2.0,
    },
  },
};

// ============================================================================
// ENERGY BOOSTERS - Consumable actions with cooldowns
// ============================================================================

export const ENERGY_BOOSTERS: Record<string, EnergyBooster> = {
  espresso: {
    id: 'espresso',
    name: '☕ Espresso Shot',
    description: 'Instant +30 energy. Perfect for emergencies. (60s cooldown)',
    cooldown: 60,
    unlockCondition: () => true, // Always available
    apply: (state: GameState) => {
      state.energy = Math.min(100, state.energy + 30);
      state.log.push({
        timestamp: state.timeRemaining,
        message: '☕ Espresso Shot! +30 energy',
        type: 'info',
      });
    },
  },

  energyDrink: {
    id: 'energyDrink',
    name: '🥤 Energy Drink',
    description: 'Sustained boost! +3 energy/sec for 20 seconds. (120s cooldown)',
    cooldown: 120,
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 50000,
    apply: (state: GameState) => {
      // This is applied as a temporary buff tracked elsewhere
      // The actual energy gain happens in tick.ts
      const extended = state as ExtendedGameState;
      extended.activeBonuses.push({
        id: 'energy_drink_' + Date.now(),
        name: 'Energy Drink',
        productionMultiplier: 1.0,
        clickMultiplier: 1.0,
        expiresAt: Date.now() + 20000, // 20 seconds
      });
      state.log.push({
        timestamp: state.timeRemaining,
        message: '🥤 Energy Drink active for 20 seconds!',
        type: 'info',
      });
    },
  },

  powerNap: {
    id: 'powerNap',
    name: '😴 Power Nap',
    description: 'Restore to 100 energy instantly. Also reduces sleep debt by 10. (180s cooldown)',
    cooldown: 180,
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 250000,
    apply: (state: GameState) => {
      state.energy = 100;
      state.sleepDebt = Math.max(0, state.sleepDebt - 10);
      state.log.push({
        timestamp: state.timeRemaining,
        message: '😴 Power Nap! Energy restored to 100, sleep debt -10',
        type: 'info',
      });
    },
  },

  megaDose: {
    id: 'megaDose',
    name: '💊 Mega Dose',
    description: 'Extreme boost! +50 energy, +5x click power for 15 seconds, but +20 chaos. (300s cooldown)',
    cooldown: 300,
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 1000000,
    apply: (state: GameState) => {
      state.energy = Math.min(100, state.energy + 50);
      state.chaos = Math.min(100, state.chaos + 20);
      const extended = state as ExtendedGameState;
      extended.activeBonuses.push({
        id: 'mega_dose_' + Date.now(),
        name: 'Mega Dose',
        clickMultiplier: 5.0,
        expiresAt: Date.now() + 15000, // 15 seconds
      });
      state.log.push({
        timestamp: state.timeRemaining,
        message: '💊 MEGA DOSE! +50 energy, +5x clicks for 15s, +20 chaos',
        type: 'warning',
      });
    },
  },

  zenState: {
    id: 'zenState',
    name: '🧘 Zen State',
    description: 'Achieve perfect balance. Set energy to 75 and chaos to 35. Gain +2x production for 30 seconds. (240s cooldown)',
    cooldown: 240,
    unlockCondition: (state: GameState) => state.totalVibesEarned >= 5000000,
    apply: (state: GameState) => {
      state.energy = 75;
      state.chaos = 35;
      const extended = state as ExtendedGameState;
      extended.activeBonuses.push({
        id: 'zen_state_' + Date.now(),
        name: 'Zen State',
        productionMultiplier: 2.0,
        expiresAt: Date.now() + 30000, // 30 seconds
      });
      state.log.push({
        timestamp: state.timeRemaining,
        message: '🧘 Zen State achieved! Energy and chaos balanced, +2x production for 30s',
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

  const cooldownRemaining = state.energyBoosterCooldowns[boosterId] || 0;
  return cooldownRemaining <= 0;
}

export function useEnergyBooster(state: ExtendedGameState, boosterId: string): boolean {
  if (!canUseEnergyBooster(state, boosterId)) return false;

  const booster = ENERGY_BOOSTERS[boosterId];
  booster.apply(state);
  state.energyBoosterCooldowns[boosterId] = booster.cooldown;

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
  const mode = getActiveEnergyMode(state);

  // Base regen - buffed for better late-game energy management
  let baseRegen = 1.0 + state.knowledgeLevel * 0.2; // Was 0.5 + 0.15*level

  // Apply mode multiplier
  baseRegen *= mode.effects.energyRegenMultiplier;

  // Apply substance modifiers (from current implementation)
  // Note: Substance modifiers are handled in tick.ts
  // This placeholder is here for future direct integration

  // Special case: Unstable Flux mode
  if (state.activeEnergyMode === 'unstable') {
    baseRegen += (Math.random() * 20 - 10); // +/- 10 random
  }

  // Check for Energy Drink buff
  const hasEnergyDrink = state.activeBonuses.some(b => b.name === 'Energy Drink');
  if (hasEnergyDrink) {
    baseRegen += 3.0;
  }

  return baseRegen;
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
