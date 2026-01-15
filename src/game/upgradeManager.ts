/**
 * Upgrade Management System
 *
 * Provides utilities for organizing, querying, and validating upgrades
 * by category. Helps identify patterns and incompatibilities across
 * the upgrade system.
 */

import { Upgrade, UpgradeCategory, GameState } from './types';
import { UPGRADES, getUpgrade } from './upgrades';

/**
 * Get all upgrades in a specific category
 */
export function getUpgradesByCategory(category: UpgradeCategory): Upgrade[] {
  return UPGRADES.filter(upgrade => upgrade.category === category);
}

/**
 * Get all categories that an upgrade affects
 * (e.g., a synergy upgrade might have substance-specific properties)
 */
export function getUpgradeCategories(upgradeId: string): UpgradeCategory[] {
  const upgrade = getUpgrade(upgradeId);
  if (!upgrade) return [];

  const categories: UpgradeCategory[] = [];

  // Add primary category if it exists
  if (upgrade.category) {
    categories.push(upgrade.category);
  }

  // Additional categorization based on properties
  if (upgrade.substanceId && upgrade.category !== 'substance-specific') {
    categories.push('substance-specific');
  }

  if (upgrade.synergySubstances && upgrade.synergySubstances.length > 0) {
    categories.push('synergy');
  }

  return categories;
}

/**
 * Check if an upgrade is functioning correctly
 * Returns null if OK, or an error message if broken
 */
export function validateUpgrade(upgradeId: string): string | null {
  const upgrade = getUpgrade(upgradeId);
  if (!upgrade) return 'Upgrade not found';

  // Check for known incompatibilities
  switch (upgrade.category) {
    case 'substance-specific':
      if (!upgrade.substanceId && !upgrade.synergySubstances) {
        return 'Substance-specific upgrade missing substanceId or synergySubstances';
      }
      break;

    case 'synergy':
      if (!upgrade.synergySubstances || upgrade.synergySubstances.length < 2) {
        return 'Synergy upgrade should have synergySubstances array with 2+ substances';
      }
      break;

    case 'automation':
      // Check if auto-clicker upgrades have proper progression
      if (upgrade.id.startsWith('auto-clicker-')) {
        const tier = parseInt(upgrade.id.split('-').pop() || '0');
        if (tier > 1 && !upgrade.requirement?.upgradeOwned) {
          return 'Auto-clicker tiers should require previous tier';
        }
      }
      break;
  }

  // Check for incompatible mechanics
  if (upgrade.effects.energyCostReduction && upgrade.effects.energyCostReduction > 0) {
    // In hybrid model, clicks GENERATE energy, not cost it
    return 'BROKEN: energyCostReduction is incompatible with current energy system';
  }

  return null;
}

/**
 * Get all upgrades owned by player in a category
 */
export function getOwnedUpgradesByCategory(state: GameState, category: UpgradeCategory): Upgrade[] {
  return getUpgradesByCategory(category).filter(upgrade =>
    state.upgrades.includes(upgrade.id)
  );
}

/**
 * Get active multipliers from owned upgrades for a specific substance
 */
export function getSubstanceMultipliers(state: GameState, substanceId: string): {
  specific: number;
  synergy: number;
  global: number;
} {
  let specific = 1;
  let synergy = 1;
  let global = 1;

  for (const upgradeId of state.upgrades) {
    const upgrade = getUpgrade(upgradeId);
    if (!upgrade) continue;

    // Substance-specific multipliers
    if (upgrade.substanceId === substanceId && upgrade.effects.productionMultiplier) {
      specific *= upgrade.effects.productionMultiplier;
    }

    // Synergy multipliers (if this substance is in the synergy list)
    if (upgrade.synergySubstances?.includes(substanceId) && upgrade.effects.productionMultiplier) {
      synergy *= upgrade.effects.productionMultiplier;
    }

    // Global multipliers
    if (upgrade.effects.globalProductionMultiplier) {
      global *= upgrade.effects.globalProductionMultiplier;
    }
  }

  return { specific, synergy, global };
}

/**
 * Get upgrade statistics by category
 */
export function getUpgradeStats(): {
  total: number;
  byCategory: Record<UpgradeCategory, number>;
  broken: string[];
  incomplete: string[];
} {
  const stats = {
    total: UPGRADES.length,
    byCategory: {
      'global': 0,
      'substance-specific': 0,
      'synergy': 0,
      'automation': 0,
      'combo': 0,
      'harm-reduction': 0,
      'progression-gate': 0,
      'special': 0,
    } as Record<UpgradeCategory, number>,
    broken: [] as string[],
    incomplete: [] as string[],
  };

  for (const upgrade of UPGRADES) {
    // Only count upgrades that have a category assigned
    if (upgrade.category) {
      stats.byCategory[upgrade.category]++;
    }

    const validation = validateUpgrade(upgrade.id);
    if (validation) {
      if (validation.includes('BROKEN')) {
        stats.broken.push(`${upgrade.id}: ${validation}`);
      } else {
        stats.incomplete.push(`${upgrade.id}: ${validation}`);
      }
    }
  }

  return stats;
}

/**
 * Get suggested upgrades for player based on current substances
 */
export function getSuggestedUpgrades(state: GameState, maxSuggestions: number = 3): Upgrade[] {
  const suggestions: Upgrade[] = [];
  const ownedSubstances = Object.keys(state.substances).filter(id => state.substances[id] > 0);

  // Prioritize substance-specific upgrades for owned substances
  for (const substanceId of ownedSubstances) {
    const relevantUpgrades = getUpgradesByCategory('substance-specific')
      .filter(u => u.substanceId === substanceId && !state.upgrades.includes(u.id))
      .sort((a, b) => a.cost - b.cost);

    if (relevantUpgrades.length > 0) {
      suggestions.push(relevantUpgrades[0]);
    }

    if (suggestions.length >= maxSuggestions) break;
  }

  // Add global upgrades if we have room
  if (suggestions.length < maxSuggestions) {
    const globalUpgrades = getUpgradesByCategory('global')
      .filter(u => !state.upgrades.includes(u.id))
      .sort((a, b) => a.cost - b.cost);

    suggestions.push(...globalUpgrades.slice(0, maxSuggestions - suggestions.length));
  }

  return suggestions;
}

/**
 * Check if player has all upgrades in a category
 */
export function hasCompletedCategory(state: GameState, category: UpgradeCategory): boolean {
  const categoryUpgrades = getUpgradesByCategory(category);
  return categoryUpgrades.every(upgrade => state.upgrades.includes(upgrade.id));
}

/**
 * Get category completion percentage
 */
export function getCategoryCompletion(state: GameState, category: UpgradeCategory): number {
  const categoryUpgrades = getUpgradesByCategory(category);
  if (categoryUpgrades.length === 0) return 100;

  const owned = categoryUpgrades.filter(upgrade => state.upgrades.includes(upgrade.id)).length;
  return Math.floor((owned / categoryUpgrades.length) * 100);
}
