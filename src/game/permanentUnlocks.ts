// Permanent Unlocks - Meta-progression using Insight Points (prestige currency)

import { PermanentUnlock, ExtendedGameState } from './progressionTypes';

// ============================================================================
// PERMANENT UNLOCKS - Purchased with Insight Points
// ============================================================================

export const PERMANENT_UNLOCKS: Record<string, PermanentUnlock> = {
  // Quality of Life
  auto_save_frequency: {
    id: 'auto_save_frequency',
    name: '💾 Faster Auto-Save',
    description: 'Auto-save every 10 seconds instead of 30.',
    insightCost: 1,
    category: 'quality-of-life',
  },

  click_notification_threshold: {
    id: 'click_notification_threshold',
    name: '🔇 Quiet Mode',
    description: 'Reduce notification spam from milestones and achievements.',
    insightCost: 1,
    category: 'quality-of-life',
  },

  hotkey_controls: {
    id: 'hotkey_controls',
    name: '⌨️ Hotkey Controls',
    description: 'Enable keyboard shortcuts for common actions (1-5 for energy boosters, Q/W/E for chaos actions).',
    insightCost: 2,
    category: 'quality-of-life',
  },

  advanced_statistics: {
    id: 'advanced_statistics',
    name: '📊 Advanced Statistics',
    description: 'Unlock detailed statistics panel with graphs and trends.',
    insightCost: 3,
    category: 'quality-of-life',
  },

  // Build Presets
  extra_build_slot_1: {
    id: 'extra_build_slot_1',
    name: '📋 Extra Build Slot (4th)',
    description: 'Add a 4th build preset slot.',
    insightCost: 2,
    category: 'build',
    unlockCondition: (state) => state.unlockedFeatures.includes('build_presets'),
    maxPurchases: 1,
  },

  extra_build_slot_2: {
    id: 'extra_build_slot_2',
    name: '📋 Extra Build Slot (5th)',
    description: 'Add a 5th build preset slot.',
    insightCost: 3,
    category: 'build',
    unlockCondition: (state) => {
      const extended = state as ExtendedGameState;
      return (extended.permanentUnlocks['extra_build_slot_1'] || 0) > 0;
    },
    maxPurchases: 1,
  },

  extra_build_slot_3: {
    id: 'extra_build_slot_3',
    name: '📋 Extra Build Slot (6th)',
    description: 'Add a 6th build preset slot.',
    insightCost: 5,
    category: 'build',
    unlockCondition: (state) => {
      const extended = state as ExtendedGameState;
      return (extended.permanentUnlocks['extra_build_slot_2'] || 0) > 0;
    },
    maxPurchases: 1,
  },

  build_swap_instant: {
    id: 'build_swap_instant',
    name: '⚡ Instant Build Swap',
    description: 'Remove the 30 second cooldown on build swapping.',
    insightCost: 5,
    category: 'build',
    unlockCondition: (state) => state.unlockedFeatures.includes('build_presets'),
    maxPurchases: 1,
  },

  // Automation
  auto_purchase_substances: {
    id: 'auto_purchase_substances',
    name: '🤖 Auto-Purchase Substances',
    description: 'Automatically purchase substances when you have enough vibes. Configure which ones in settings.',
    insightCost: 5,
    category: 'automation',
  },

  auto_use_maintenance: {
    id: 'auto_use_maintenance',
    name: '🔧 Auto-Maintenance',
    description: 'Automatically use maintenance actions when meters get critical (energy < 20, chaos > 80).',
    insightCost: 7,
    category: 'automation',
  },

  offline_progress_boost: {
    id: 'offline_progress_boost',
    name: '💤 Enhanced Offline Progress',
    description: 'Increase offline production efficiency from 50% to 75%.',
    insightCost: 3,
    category: 'automation',
    maxPurchases: 2, // Can stack to 100%
  },

  auto_clicker_boost: {
    id: 'auto_clicker_boost',
    name: '👆 Auto-Clicker Boost',
    description: 'Increase all auto-clicker speeds by +50%. Stackable up to 5 times.',
    insightCost: 3,
    category: 'automation',
    unlockCondition: (state) => state.autoClickerLevel > 0,
    maxPurchases: 5,
  },

  // Special Starting Bonuses
  fresh_start_bonus: {
    id: 'fresh_start_bonus',
    name: '🎁 Fresh Start Bonus',
    description: 'Start each prestige with 25% of your previous substances. Stackable.',
    insightCost: 5,
    category: 'special',
    maxPurchases: 4, // 25%, 50%, 75%, 100%
  },

  knowledge_retention: {
    id: 'knowledge_retention',
    name: '🧠 Knowledge Retention',
    description: 'Start each prestige with +1 knowledge level.',
    insightCost: 10,
    category: 'special',
    maxPurchases: 3, // Up to +3 starting knowledge
  },

  insight_multiplier: {
    id: 'insight_multiplier',
    name: '💎 Insight Multiplier',
    description: 'Gain +10% more insight points when you prestige. Stackable.',
    insightCost: 8,
    category: 'special',
    maxPurchases: 5,
  },

  // Special Substances
  unlock_forbidden_substance_1: {
    id: 'unlock_forbidden_substance_1',
    name: '🚫 Unlock: Void Substance',
    description: 'Unlock a special forbidden substance with extreme effects.',
    insightCost: 15,
    category: 'special',
    unlockCondition: (state) => {
      const extended = state as ExtendedGameState;
      return extended.prestigeTier >= 2;
    },
    maxPurchases: 1,
  },

  unlock_forbidden_substance_2: {
    id: 'unlock_forbidden_substance_2',
    name: '🌟 Unlock: Transcendence Substance',
    description: 'Unlock an ultimate substance that breaks reality.',
    insightCost: 25,
    category: 'special',
    unlockCondition: (state) => {
      const extended = state as ExtendedGameState;
      return extended.prestigeTier >= 5;
    },
    maxPurchases: 1,
  },

  // Meta Upgrades
  permanent_production_boost: {
    id: 'permanent_production_boost',
    name: '📈 Permanent Production +10%',
    description: 'Permanently increase all production by +10%. Stackable.',
    insightCost: 5,
    category: 'special',
    maxPurchases: 10,
  },

  permanent_click_boost: {
    id: 'permanent_click_boost',
    name: '👆 Permanent Click +15%',
    description: 'Permanently increase click power by +15%. Stackable.',
    insightCost: 4,
    category: 'special',
    maxPurchases: 10,
  },

  permanent_energy_boost: {
    id: 'permanent_energy_boost',
    name: '⚡ Permanent Energy +20%',
    description: 'Permanently increase energy regeneration by +20%. Stackable.',
    insightCost: 3,
    category: 'special',
    maxPurchases: 10,
  },

  chaos_mastery: {
    id: 'chaos_mastery',
    name: '🌀 Chaos Mastery',
    description: 'Reduce all chaos action cooldowns by 25%. Stackable.',
    insightCost: 6,
    category: 'special',
    maxPurchases: 4,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getAvailablePermanentUnlocks(state: ExtendedGameState): PermanentUnlock[] {
  return Object.values(PERMANENT_UNLOCKS).filter((unlock) => {
    // Check if already maxed out
    const currentPurchases = state.permanentUnlocks[unlock.id] || 0;
    if (unlock.maxPurchases && currentPurchases >= unlock.maxPurchases) {
      return false;
    }

    // Check unlock condition
    if (unlock.unlockCondition && !unlock.unlockCondition(state)) {
      return false;
    }

    return true;
  });
}

export function canPurchasePermanentUnlock(
  state: ExtendedGameState,
  unlockId: string
): boolean {
  const unlock = PERMANENT_UNLOCKS[unlockId];
  if (!unlock) return false;

  // Check insight points
  if (state.insightPoints < unlock.insightCost) return false;

  // Check if already maxed
  const currentPurchases = state.permanentUnlocks[unlockId] || 0;
  if (unlock.maxPurchases && currentPurchases >= unlock.maxPurchases) {
    return false;
  }

  // Check unlock condition
  if (unlock.unlockCondition && !unlock.unlockCondition(state)) {
    return false;
  }

  return true;
}

export function purchasePermanentUnlock(
  state: ExtendedGameState,
  unlockId: string
): boolean {
  if (!canPurchasePermanentUnlock(state, unlockId)) return false;

  const unlock = PERMANENT_UNLOCKS[unlockId];

  // Deduct cost
  state.insightPoints -= unlock.insightCost;

  // Increment purchase count
  state.permanentUnlocks[unlockId] = (state.permanentUnlocks[unlockId] || 0) + 1;

  // Apply immediate effects for some unlocks
  if (unlockId.startsWith('extra_build_slot')) {
    state.maxBuildSlots += 1;
  }

  state.log.push({
    timestamp: state.timeRemaining,
    message: `✨ Unlocked: ${unlock.name}!`,
    type: 'achievement',
  });

  return true;
}

export function getPermanentUnlockLevel(state: ExtendedGameState, unlockId: string): number {
  return state.permanentUnlocks[unlockId] || 0;
}

export function hasPermanentUnlock(state: ExtendedGameState, unlockId: string): boolean {
  return getPermanentUnlockLevel(state, unlockId) > 0;
}

// ============================================================================
// MULTIPLIER CALCULATIONS
// ============================================================================

export function getPermanentProductionMultiplier(state: ExtendedGameState): number {
  const boostLevel = getPermanentUnlockLevel(state, 'permanent_production_boost');
  return 1.0 + boostLevel * 0.1; // +10% per level
}

export function getPermanentClickMultiplier(state: ExtendedGameState): number {
  const boostLevel = getPermanentUnlockLevel(state, 'permanent_click_boost');
  return 1.0 + boostLevel * 0.15; // +15% per level
}

export function getPermanentEnergyMultiplier(state: ExtendedGameState): number {
  const boostLevel = getPermanentUnlockLevel(state, 'permanent_energy_boost');
  return 1.0 + boostLevel * 0.2; // +20% per level
}

export function getAutoClickerSpeedMultiplier(state: ExtendedGameState): number {
  const boostLevel = getPermanentUnlockLevel(state, 'auto_clicker_boost');
  return 1.0 + boostLevel * 0.5; // +50% per level
}

export function getOfflineProgressEfficiency(state: ExtendedGameState): number {
  const boostLevel = getPermanentUnlockLevel(state, 'offline_progress_boost');
  return 0.5 + boostLevel * 0.25; // 50% base, +25% per level (max 100%)
}

export function getChaosActionCooldownMultiplier(state: ExtendedGameState): number {
  const masteryLevel = getPermanentUnlockLevel(state, 'chaos_mastery');
  return 1.0 - masteryLevel * 0.25; // -25% per level (min 0%)
}

export function getFreshStartPercentage(state: ExtendedGameState): number {
  const level = getPermanentUnlockLevel(state, 'fresh_start_bonus');
  return level * 0.25; // 25% per level (max 100%)
}

export function getStartingKnowledgeLevel(state: ExtendedGameState): number {
  return getPermanentUnlockLevel(state, 'knowledge_retention');
}

export function getInsightPointMultiplier(state: ExtendedGameState): number {
  const level = getPermanentUnlockLevel(state, 'insight_multiplier');
  return 1.0 + level * 0.1; // +10% per level
}

export function shouldAutoMaintenance(state: ExtendedGameState): boolean {
  if (!hasPermanentUnlock(state, 'auto_use_maintenance')) return false;
  return state.energy < 20 || state.chaos > 80;
}

export function shouldAutoPurchase(state: ExtendedGameState): boolean {
  return hasPermanentUnlock(state, 'auto_purchase_substances');
}

export function hasInstantBuildSwap(state: ExtendedGameState): boolean {
  return hasPermanentUnlock(state, 'build_swap_instant');
}

export function hasHotkeyControls(state: ExtendedGameState): boolean {
  return hasPermanentUnlock(state, 'hotkey_controls');
}
