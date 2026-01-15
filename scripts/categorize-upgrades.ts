/**
 * Script to add category field to all upgrades in upgrades.ts
 *
 * Run this to auto-categorize based on patterns:
 * npx ts-node scripts/categorize-upgrades.ts
 */

import { UpgradeCategory } from '../src/game/types';

type UpgradePattern = {
  category: UpgradeCategory;
  test: (upgradeId: string, upgrade: any) => boolean;
  priority: number; // Higher priority checked first
};

const CATEGORIZATION_RULES: UpgradePattern[] = [
  // Progression gates (highest priority)
  {
    category: 'progression-gate',
    priority: 100,
    test: (id) => id.includes('tier-') || id.includes('license') || id.includes('clearance') || id.includes('transcendence'),
  },

  // Automation upgrades
  {
    category: 'automation',
    priority: 90,
    test: (id) => id.startsWith('auto-clicker') || id.includes('idle-bonus'),
  },

  // Combo upgrades
  {
    category: 'combo',
    priority: 85,
    test: (id) => id.includes('combo'),
  },

  // Synergy upgrades
  {
    category: 'synergy',
    priority: 80,
    test: (id, u) =>
      id.includes('cocktail') ||
      id.includes('speedball') ||
      id.includes('candy-flip') ||
      id.includes('jedi-flip'),
  },

  // Harm reduction
  {
    category: 'harm-reduction',
    priority: 70,
    test: (id, u) =>
      id.includes('test-kit') ||
      id.includes('supplement') ||
      id.includes('medical') ||
      (u.effects?.chaosDampening && !id.includes('controlled-chaos')),
  },

  // Special / cursed features
  {
    category: 'special',
    priority: 60,
    test: (id) =>
      id.includes('memory-suppression') ||
      id.includes('reality-distortion') ||
      id.includes('denial') ||
      id.includes('perspective'),
  },

  // Substance-specific (check for substanceId field)
  {
    category: 'substance-specific',
    priority: 50,
    test: (id, u) => u.substanceId !== undefined,
  },

  // Global (anything with global multipliers or click power)
  {
    category: 'global',
    priority: 10,
    test: (id, u) =>
      u.effects?.globalProductionMultiplier ||
      u.effects?.clickPower ||
      u.effects?.clickMultiplier ||
      id.includes('tolerance') ||
      id.includes('polypharmacy') ||
      id.includes('transhumanism') ||
      id.includes('post-human') ||
      id.includes('hyper-efficiency') ||
      id.includes('quantum') ||
      id.includes('reality-editing') ||
      id.includes('singularity') ||
      id.includes('hyperdimensional') ||
      id.includes('vibe-deity') ||
      id.includes('omnipotent') ||
      id.includes('heat-death') ||
      id.includes('infinite'),
  },
];

/**
 * Auto-categorize an upgrade based on rules
 */
export function categorizeUpgrade(upgradeId: string, upgrade: any): UpgradeCategory {
  // Sort by priority and find first match
  const sorted = [...CATEGORIZATION_RULES].sort((a, b) => b.priority - a.priority);

  for (const rule of sorted) {
    if (rule.test(upgradeId, upgrade)) {
      return rule.category;
    }
  }

  // Default fallback
  return 'global';
}

/**
 * Map of known synergy upgrades to their substance pairs
 */
export const SYNERGY_SUBSTANCE_MAPPINGS: Record<string, string[]> = {
  'cocktail-theory': ['alcohol', 'empathogen'],
  'speedball-dynamics': ['stimulant', 'sedative'],
  'candy-flip-protocol': ['empathogen', 'psychedelic'],
  'jedi-flip-mastery': ['alcohol', 'empathogen', 'psychedelic'], // Global synergy
};

/**
 * Generate the category field for an upgrade object
 */
export function generateCategoryField(upgradeId: string, upgrade: any): string {
  const category = categorizeUpgrade(upgradeId, upgrade);

  let result = `    category: '${category}',`;

  // Add synergySubstances if this is a synergy upgrade
  if (category === 'synergy' && SYNERGY_SUBSTANCE_MAPPINGS[upgradeId]) {
    const substances = SYNERGY_SUBSTANCE_MAPPINGS[upgradeId];
    result += `\n    synergySubstances: ${JSON.stringify(substances)},`;
  }

  return result;
}

console.log('Upgrade Categorization Rules Loaded');
console.log('Use these functions to add category fields to upgrades.ts');
