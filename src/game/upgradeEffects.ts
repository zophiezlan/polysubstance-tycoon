import { GameState } from './types';
import { getUpgrade } from './upgrades';

/**
 * Calculate total click power based on upgrades
 */
export function calculateClickPower(state: GameState, baseClickPower: number = 10): number {
  let power = baseClickPower;
  let multiplier = 1;

  for (const upgradeId of state.upgrades) {
    const upgrade = getUpgrade(upgradeId);
    if (!upgrade) continue;

    if (upgrade.effects.clickPower) {
      power += upgrade.effects.clickPower;
    }

    if (upgrade.effects.clickMultiplier) {
      multiplier *= upgrade.effects.clickMultiplier;
    }
  }

  return power * multiplier;
}

/**
 * Calculate energy cost reduction for clicks
 */
export function calculateEnergyCost(state: GameState, baseCost: number = 5): number {
  let reduction = 0;

  for (const upgradeId of state.upgrades) {
    const upgrade = getUpgrade(upgradeId);
    if (!upgrade) continue;

    if (upgrade.effects.energyCostReduction) {
      reduction += upgrade.effects.energyCostReduction;
    }
  }

  return Math.max(1, baseCost * (1 - reduction));
}

/**
 * Calculate production multiplier for a specific substance
 */
export function calculateProductionMultiplier(state: GameState, substanceId: string): number {
  let multiplier = 1;

  for (const upgradeId of state.upgrades) {
    const upgrade = getUpgrade(upgradeId);
    if (!upgrade) continue;

    // Substance-specific multiplier
    if (upgrade.substanceId === substanceId && upgrade.effects.productionMultiplier) {
      multiplier *= upgrade.effects.productionMultiplier;
    }

    // Global production multiplier
    if (upgrade.effects.globalProductionMultiplier) {
      multiplier *= upgrade.effects.globalProductionMultiplier;
    }
  }

  return multiplier;
}

/**
 * Calculate chaos dampening
 */
export function calculateChaosDampening(state: GameState): number {
  let dampening = 0;

  for (const upgradeId of state.upgrades) {
    const upgrade = getUpgrade(upgradeId);
    if (!upgrade) continue;

    if (upgrade.effects.chaosDampening) {
      dampening += upgrade.effects.chaosDampening;
    }
  }

  return Math.min(0.9, dampening); // Cap at 90% reduction
}
