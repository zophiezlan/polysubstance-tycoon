// Milestone System - Constant progression feedback with micro and macro milestones

import { GameState } from './types';
import { Milestone, ExtendedGameState } from './progressionTypes';

// ============================================================================
// REPEATABLE MICRO-MILESTONES - Frequent dopamine hits
// ============================================================================

export const REPEATABLE_MILESTONES: Milestone[] = [
  {
    id: 'vibes_1k',
    name: '🎉 Thousand Club',
    description: 'Earned 1,000 vibes milestone!',
    category: 'vibes',
    checkCondition: (state: GameState) => {
      const extended = state as ExtendedGameState;
      const threshold = getNextVibesThreshold(extended.lastMilestoneVibes);
      return state.totalVibesEarned >= threshold;
    },
    reward: {
      temporaryBonus: {
        productionMultiplier: 1.05, // +5% for 60s
        duration: 60,
      },
    },
    repeatable: true,
    nextThreshold: (current) => {
      if (current === 0) return 1000;
      // Exponential scaling: 1k, 2k, 5k, 10k, 20k, 50k, 100k...
      if (current < 10000) return current + 1000; // +1k until 10k
      if (current < 100000) return current + 10000; // +10k until 100k
      if (current < 1000000) return current + 100000; // +100k until 1M
      return current + 1000000; // +1M thereafter
    },
  },

  {
    id: 'clicks_100',
    name: '👆 Click Master',
    description: 'Reached 100 clicks milestone!',
    category: 'clicks',
    checkCondition: (state: GameState) => {
      const extended = state as ExtendedGameState;
      const threshold = getNextClickThreshold(extended.lastMilestoneClicks);
      return state.totalClicks >= threshold;
    },
    reward: {
      temporaryBonus: {
        clickMultiplier: 1.5, // +50% click power for 30s
        duration: 30,
      },
    },
    repeatable: true,
    nextThreshold: (current) => {
      if (current === 0) return 100;
      if (current < 1000) return current + 100;
      if (current < 10000) return current + 1000;
      if (current < 100000) return current + 10000;
      return current + 100000;
    },
  },
];

// ============================================================================
// MAJOR VIBES MILESTONES - Permanent unlocks and bonuses
// ============================================================================

export const VIBES_MILESTONES: Milestone[] = [
  {
    id: 'vibes_10k',
    name: '💎 Ten Thousand Strong',
    description: 'Earned 10,000 total vibes. Your operation is growing!',
    category: 'vibes',
    checkCondition: (state) => state.totalVibesEarned >= 10000,
    reward: {
      permanentProductionBonus: 5, // +5% forever
      temporaryBonus: {
        productionMultiplier: 2.0,
        duration: 120,
      },
    },
  },

  {
    id: 'vibes_100k',
    name: '⚡ Energy Master',
    description: 'Earned 100,000 total vibes. Unlocked Energy Modes!',
    category: 'vibes',
    checkCondition: (state) => state.totalVibesEarned >= 100000,
    reward: {
      permanentProductionBonus: 10,
      unlockFeature: 'energy_modes',
    },
  },

  {
    id: 'vibes_500k',
    name: '🎯 Chaos Controller',
    description: 'Earned 500,000 total vibes. Unlocked Chaos Strategies!',
    category: 'vibes',
    checkCondition: (state) => state.totalVibesEarned >= 500000,
    reward: {
      permanentProductionBonus: 15,
      unlockFeature: 'chaos_strategies',
    },
  },

  {
    id: 'vibes_1m',
    name: '🚀 Million Club',
    description: 'Earned 1,000,000 total vibes! Unlocked Chaos Actions!',
    category: 'vibes',
    checkCondition: (state) => state.totalVibesEarned >= 1000000,
    reward: {
      permanentProductionBonus: 25,
      permanentClickBonus: 10,
      unlockFeature: 'chaos_actions',
    },
  },

  {
    id: 'vibes_10m',
    name: '💼 Corporate Tycoon',
    description: 'Earned 10,000,000 total vibes! Unlocked Build Presets!',
    category: 'vibes',
    checkCondition: (state) => state.totalVibesEarned >= 10000000,
    reward: {
      permanentProductionBonus: 50,
      permanentClickBonus: 25,
      unlockFeature: 'build_presets',
    },
  },

  {
    id: 'vibes_100m',
    name: '🌟 Prestige Plus',
    description: 'Earned 100,000,000 total vibes! Unlocked Prestige+ features!',
    category: 'vibes',
    checkCondition: (state) => state.totalVibesEarned >= 100000000,
    reward: {
      permanentProductionBonus: 100,
      permanentClickBonus: 50,
      unlockFeature: 'prestige_plus',
      insightPoints: 5,
    },
  },

  {
    id: 'vibes_1b',
    name: '👑 Reality Breaker',
    description: 'Earned 1,000,000,000 total vibes. You broke the game!',
    category: 'vibes',
    checkCondition: (state) => state.totalVibesEarned >= 1000000000,
    reward: {
      permanentProductionBonus: 250,
      permanentClickBonus: 100,
      unlockFeature: 'singularity_mode',
      insightPoints: 25,
    },
  },
];

// ============================================================================
// COLLECTION MILESTONES - Complete sets and reach thresholds
// ============================================================================

export const COLLECTION_MILESTONES: Milestone[] = [
  {
    id: 'own_all_substances',
    name: '📦 Full Inventory',
    description: 'Own at least 1 of every substance type.',
    category: 'collection',
    checkCondition: (state) => {
      const uniqueSubstances = Object.keys(state.substances).filter(
        (id) => state.substances[id] > 0
      ).length;
      // Assume 10 total substances (this should be imported from substances.ts)
      return uniqueSubstances >= 10;
    },
    reward: {
      permanentProductionBonus: 10,
    },
  },

  {
    id: 'ten_of_each',
    name: '📊 Diversified Portfolio',
    description: 'Own at least 10 of every substance type.',
    category: 'collection',
    checkCondition: (state) => {
      const substances = Object.values(state.substances);
      if (substances.length < 10) return false;
      return substances.every((count) => count >= 10);
    },
    reward: {
      permanentProductionBonus: 25,
      permanentClickBonus: 15,
    },
  },

  {
    id: 'max_one_substance',
    name: '🎖️ Specialist',
    description: 'Max out one substance to 100 units.',
    category: 'collection',
    checkCondition: (state) => {
      return Object.values(state.substances).some((count) => count >= 100);
    },
    reward: {
      permanentProductionBonus: 20,
      unlockFeature: 'specialist_upgrades',
    },
  },

  {
    id: 'max_all_substances',
    name: '♾️ Singularity',
    description: 'Max out ALL substances to 100 units. You are unstoppable!',
    category: 'collection',
    checkCondition: (state) => {
      const substances = Object.values(state.substances);
      if (substances.length < 10) return false;
      return substances.every((count) => count >= 100);
    },
    reward: {
      permanentProductionBonus: 100,
      permanentClickBonus: 100,
      unlockFeature: 'singularity_mode',
      insightPoints: 10,
    },
  },
];

// ============================================================================
// SPECIAL ACHIEVEMENT MILESTONES - Unique accomplishments
// ============================================================================

export const SPECIAL_MILESTONES: Milestone[] = [
  {
    id: 'combo_100',
    name: '🔥 Combo God',
    description: 'Achieved a 100x combo streak!',
    category: 'special',
    checkCondition: (state) => state.maxCombo >= 100,
    reward: {
      permanentClickBonus: 25,
      insightPoints: 1,
    },
  },

  {
    id: 'high_chaos_survivor',
    name: '💀 Chaos Survivor',
    description: 'Spent 10 minutes at 80+ chaos without collapsing.',
    category: 'special',
    checkCondition: (state) => {
      const extended = state as ExtendedGameState;
      return extended.statistics.timeInHighChaos >= 600; // 10 minutes
    },
    reward: {
      permanentProductionBonus: 15,
      unlockFeature: 'chaos_mastery',
    },
  },

  {
    id: 'low_energy_grinder',
    name: '😴 Sleep Fighter',
    description: 'Spent 10 minutes at 20- energy. You need a break!',
    category: 'special',
    checkCondition: (state) => {
      const extended = state as ExtendedGameState;
      return extended.statistics.timeInLowEnergy >= 600;
    },
    reward: {
      permanentProductionBonus: 10,
      unlockFeature: 'energy_mastery',
    },
  },

  {
    id: 'prestige_5',
    name: '🔄 Veteran Resetter',
    description: 'Performed 5 prestiges. You know the game well!',
    category: 'special',
    checkCondition: (state) => {
      const extended = state as ExtendedGameState;
      return extended.prestigeTier >= 5;
    },
    reward: {
      permanentProductionBonus: 30,
      permanentClickBonus: 20,
      unlockFeature: 'veteran_perks',
    },
  },

  {
    id: 'all_upgrades',
    name: '🛒 Shopaholic',
    description: 'Purchased every available upgrade. Nothing left to buy!',
    category: 'special',
    checkCondition: (state) => {
      // This needs to check against total upgrades available
      const extended = state as ExtendedGameState;
      return extended.statistics.totalUpgradesPurchased >= 50; // Placeholder
    },
    reward: {
      permanentProductionBonus: 50,
      permanentClickBonus: 25,
      insightPoints: 5,
    },
  },

  {
    id: 'perfect_balance',
    name: '☯️ Zen Master',
    description: 'Maintained exactly 50 energy and 50 chaos simultaneously for 60 seconds.',
    category: 'special',
    checkCondition: (_state) => {
      // This will need special tracking in future update
      return false; // Placeholder
    },
    reward: {
      permanentProductionBonus: 25,
      unlockFeature: 'zen_perks',
      insightPoints: 2,
    },
    hidden: true,
  },

  {
    id: 'idle_overnight',
    name: '💤 Overnight Success',
    description: 'Left the game idle for 8+ hours and came back to rewards.',
    category: 'special',
    checkCondition: (state) => {
      const extended = state as ExtendedGameState;
      return (
        extended.offlineProgressPending !== null &&
        extended.offlineProgressPending.timeAway >= 28800 &&
        extended.offlineProgressPending.claimed
      );
    },
    reward: {
      permanentProductionBonus: 20,
      unlockFeature: 'idle_master',
    },
  },
];

// ============================================================================
// ALL MILESTONES COMBINED
// ============================================================================

export const ALL_MILESTONES: Milestone[] = [
  ...REPEATABLE_MILESTONES,
  ...VIBES_MILESTONES,
  ...COLLECTION_MILESTONES,
  ...SPECIAL_MILESTONES,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function checkMilestones(state: ExtendedGameState): Milestone[] {
  const newlyCompleted: Milestone[] = [];

  for (const milestone of ALL_MILESTONES) {
    // Skip if already completed (unless repeatable)
    if (!milestone.repeatable && state.completedMilestones.includes(milestone.id)) {
      continue;
    }

    // Skip hidden milestones that aren't unlocked yet
    if (milestone.hidden && !state.completedMilestones.includes(milestone.id)) {
      continue;
    }

    // Check condition
    if (milestone.checkCondition(state)) {
      newlyCompleted.push(milestone);
    }
  }

  return newlyCompleted;
}

export function awardMilestone(state: ExtendedGameState, milestone: Milestone): void {
  // Add to completed list (unless repeatable)
  if (!milestone.repeatable && !state.completedMilestones.includes(milestone.id)) {
    state.completedMilestones.push(milestone.id);
  }

  // Apply rewards
  const reward = milestone.reward;

  // Permanent bonuses are tracked separately and applied in calculations
  // (We'll handle this in upgradeEffects.ts)

  // Temporary bonuses
  if (reward.temporaryBonus) {
    state.activeBonuses.push({
      id: `milestone_${milestone.id}_${Date.now()}`,
      name: milestone.name,
      productionMultiplier: reward.temporaryBonus.productionMultiplier || 1.0,
      clickMultiplier: reward.temporaryBonus.clickMultiplier || 1.0,
      expiresAt: Date.now() + reward.temporaryBonus.duration * 1000,
    });
  }

  // Insight points
  if (reward.insightPoints) {
    state.insightPoints += reward.insightPoints;
  }

  // Feature unlocks
  if (reward.unlockFeature) {
    if (!state.unlockedFeatures.includes(reward.unlockFeature)) {
      state.unlockedFeatures.push(reward.unlockFeature);
    }
  }

  // Update repeatable thresholds
  if (milestone.repeatable) {
    if (milestone.category === 'vibes' && milestone.nextThreshold) {
      state.lastMilestoneVibes = milestone.nextThreshold(state.lastMilestoneVibes);
    } else if (milestone.category === 'clicks' && milestone.nextThreshold) {
      state.lastMilestoneClicks = milestone.nextThreshold(state.lastMilestoneClicks);
    }
  }

  // Log achievement
  state.log.push({
    timestamp: state.timeRemaining,
    message: `🏆 MILESTONE: ${milestone.name}!`,
    type: 'achievement',
  });
}

export function processMilestones(state: ExtendedGameState): void {
  const repeatableMilestones = ALL_MILESTONES.filter((milestone) => milestone.repeatable);

  for (const milestone of repeatableMilestones) {
    let safetyCounter = 0;
    while (milestone.checkCondition(state)) {
      awardMilestone(state, milestone);
      safetyCounter += 1;
      if (safetyCounter > 1000) {
        break;
      }
    }
  }

  const completed = ALL_MILESTONES.filter((milestone) => {
    if (milestone.repeatable) return false;
    if (state.completedMilestones.includes(milestone.id)) return false;
    if (milestone.hidden && !state.completedMilestones.includes(milestone.id)) return false;
    return milestone.checkCondition(state);
  });

  for (const milestone of completed) {
    awardMilestone(state, milestone);
  }
}

export function getMilestoneProgress(state: ExtendedGameState): {
  nextVibesMilestone: number;
  nextClicksMilestone: number;
  completedCount: number;
  totalCount: number;
} {
  const nonRepeatable = ALL_MILESTONES.filter((m) => !m.repeatable);

  return {
    nextVibesMilestone: getNextVibesThreshold(state.lastMilestoneVibes),
    nextClicksMilestone: getNextClickThreshold(state.lastMilestoneClicks),
    completedCount: state.completedMilestones.length,
    totalCount: nonRepeatable.length,
  };
}

export function getPermanentBonusesFromMilestones(state: ExtendedGameState): {
  productionBonus: number;
  clickBonus: number;
} {
  let productionBonus = 0;
  let clickBonus = 0;

  for (const milestoneId of state.completedMilestones) {
    const milestone = ALL_MILESTONES.find((m) => m.id === milestoneId);
    if (!milestone) continue;

    if (milestone.reward.permanentProductionBonus) {
      productionBonus += milestone.reward.permanentProductionBonus;
    }
    if (milestone.reward.permanentClickBonus) {
      clickBonus += milestone.reward.permanentClickBonus;
    }
  }

  return { productionBonus, clickBonus };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getNextVibesThreshold(current: number): number {
  const milestone = REPEATABLE_MILESTONES.find((m) => m.id === 'vibes_1k');
  if (!milestone || !milestone.nextThreshold) return current + 1000;
  return milestone.nextThreshold(current);
}

function getNextClickThreshold(current: number): number {
  const milestone = REPEATABLE_MILESTONES.find((m) => m.id === 'clicks_100');
  if (!milestone || !milestone.nextThreshold) return current + 100;
  return milestone.nextThreshold(current);
}

export function cleanupExpiredBonuses(state: ExtendedGameState): void {
  const now = Date.now();
  state.activeBonuses = state.activeBonuses.filter((bonus) => bonus.expiresAt > now);
}

export function getActiveBonusMultipliers(state: ExtendedGameState): {
  productionMultiplier: number;
  clickMultiplier: number;
} {
  cleanupExpiredBonuses(state);

  let productionMultiplier = 1.0;
  let clickMultiplier = 1.0;

  for (const bonus of state.activeBonuses) {
    if (bonus.productionMultiplier) {
      productionMultiplier *= bonus.productionMultiplier;
    }
    if (bonus.clickMultiplier) {
      clickMultiplier *= bonus.clickMultiplier;
    }
  }

  return { productionMultiplier, clickMultiplier };
}
