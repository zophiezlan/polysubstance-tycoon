// Integration file for all progression systems into game tick
// This file handles auto-clicker, energy modes, chaos strategies, milestones, etc.

import { GameState } from './types';
import { ExtendedGameState, upgradeToExtendedGameState, isExtendedGameState } from './progressionTypes';
import {
  calculateEnergyRegen,
  calculateEnergyHarvest,
  getEnergyClickMultiplier,
  getEnergyProductionMultiplier,
  getActiveEnergyMode,
} from './energyManagement';
import {
  getChaosThresholdMultipliers,
  getActiveChaosStrategy,
  isChaosFrozen,
  applyChaosStrategy,
} from './chaosStrategy';
import {
  processMilestones,
  cleanupExpiredBonuses,
  getActiveBonusMultipliers,
  getPermanentBonusesFromMilestones,
} from './milestones';
import {
  getPermanentProductionMultiplier,
  getPermanentClickMultiplier,
  getPermanentEnergyMultiplier,
  getAutoClickerSpeedMultiplier,
  getChaosActionCooldownMultiplier,
} from './permanentUnlocks';
import { calculateClickPower } from './upgradeEffects';

// ============================================================================
// AUTO-CLICKER IMPLEMENTATION
// ============================================================================

export function processAutoClicker(state: ExtendedGameState, deltaTime: number): number {
  if (!state.autoClickerActive || state.autoClickerLevel === 0) {
    return 0;
  }

  const dt = deltaTime / 1000; // Convert to seconds

  // Get base auto-clicker rate based on level
  let clicksPerSecond = 0;
  switch (state.autoClickerLevel) {
    case 1:
      clicksPerSecond = 1;
      break;
    case 2:
      clicksPerSecond = 5;
      break;
    case 3:
      clicksPerSecond = 20;
      break;
    case 4:
      clicksPerSecond = 100;
      break;
    case 5:
      clicksPerSecond = 1000; // "Singularity Clicker"
      break;
    default:
      clicksPerSecond = 1;
  }

  // Apply energy mode multiplier
  const energyMode = getActiveEnergyMode(state);
  if (energyMode.effects.autoClickerSpeedMultiplier) {
    clicksPerSecond *= energyMode.effects.autoClickerSpeedMultiplier;
  }

  // Apply permanent unlock boost
  clicksPerSecond *= getAutoClickerSpeedMultiplier(state);

  // Calculate fractional clicks
  state.autoClickerAccumulator += clicksPerSecond * dt;

  // Process whole clicks
  const wholeClicks = Math.floor(state.autoClickerAccumulator);
  state.autoClickerAccumulator -= wholeClicks;

  if (wholeClicks > 0) {
    // Calculate click power (same as manual clicks)
    const clickPower = calculateClickPower(state);
    const energyMultiplier = getEnergyClickMultiplier(state);
    const permanentMultiplier = getPermanentClickMultiplier(state);
    const { clickMultiplier: bonusMultiplier } = getActiveBonusMultipliers(state);
    const { clickBonus: milestoneBonus } = getPermanentBonusesFromMilestones(state);

    const totalClickPower =
      clickPower * energyMultiplier * permanentMultiplier * bonusMultiplier * (1 + milestoneBonus / 100);

    const vibesGained = totalClickPower * wholeClicks;
    state.vibes += vibesGained;
    state.totalVibesEarned += vibesGained;
    state.totalClicks += wholeClicks;

    // Auto-clicks also generate combo progress (at 50% rate)
    if (state.comboTimer > 0) {
      state.comboCount += Math.floor(wholeClicks * 0.5);
      state.maxCombo = Math.max(state.maxCombo, state.comboCount);
    }

    // Auto-clicks generate chaos (at reduced rate)
    const chaosFrozen = isChaosFrozen(state);
    if (!chaosFrozen) {
      const chaosGenerated = wholeClicks * 0.5; // 50% of manual click chaos
      state.chaos = Math.min(100, state.chaos + chaosGenerated);
    }
  }

  return wholeClicks;
}

// ============================================================================
// ENERGY SYSTEM INTEGRATION
// ============================================================================

export function processEnergySystem(state: ExtendedGameState, deltaTime: number): void {
  const dt = deltaTime / 1000;

  // Calculate energy regeneration with new system
  const energyRegen = calculateEnergyRegen(state);
  const permanentMultiplier = getPermanentEnergyMultiplier(state);
  const chaosMultipliers = getChaosThresholdMultipliers(state);

  const totalEnergyRegen = energyRegen * permanentMultiplier * chaosMultipliers.energyRegenMultiplier;

  // Apply regen when below max
  if (state.energy < 100) {
    state.energy += totalEnergyRegen * dt;
  }

  // Energy harvesting (if in Harvester mode)
  const vibesPerSec = calculateVibesPerSecondQuick(state);
  const harvestVibes = calculateEnergyHarvest(state, vibesPerSec);
  if (harvestVibes > 0) {
    // Consume energy above threshold
    const mode = getActiveEnergyMode(state);
    const threshold = mode.effects.energyHarvestThreshold || 80;

    state.energyHarvestAccumulator += harvestVibes * dt;

    // Process whole vibes
    const wholeVibes = Math.floor(state.energyHarvestAccumulator);
    if (wholeVibes > 0) {
      state.vibes += wholeVibes;
      state.totalVibesEarned += wholeVibes;
      state.energyHarvestAccumulator -= wholeVibes;

      // Consume energy
      const energyConsumed = (wholeVibes / (mode.effects.energyHarvestRate || 10)) / vibesPerSec;
      state.energy = Math.max(threshold, state.energy - energyConsumed);
    }
  }

  // Clamp energy
  state.energy = Math.max(0, Math.min(100, state.energy));

  // Update statistics
  if (state.energy < 20) {
    state.statistics.timeInLowEnergy += dt;
  }

  // Tick down energy booster cooldowns
  for (const boosterId in state.energyBoosterCooldowns) {
    state.energyBoosterCooldowns[boosterId] = Math.max(
      0,
      state.energyBoosterCooldowns[boosterId] - dt
    );
  }
}

// ============================================================================
// CHAOS SYSTEM INTEGRATION
// ============================================================================

export function processChaosSystem(state: ExtendedGameState, deltaTime: number): void {
  const dt = deltaTime / 1000;

  // Apply chaos strategy effects
  applyChaosStrategy(state);

  // Chaos decay with strategy modifiers
  const strategy = getActiveChaosStrategy(state);
  const chaosFrozen = isChaosFrozen(state);

  if (!chaosFrozen) {
    const baseDecay = 0.3;
    const modifiedDecay = baseDecay * strategy.effects.chaosDecayMultiplier;

    if (state.chaos > 30) {
      state.chaos -= modifiedDecay * dt;
    }
  }

  // Update statistics
  if (state.chaos > 80) {
    state.statistics.timeInHighChaos += dt;
  }

  // Tick down chaos action cooldowns (with permanent unlock modifier)
  const cooldownMultiplier = getChaosActionCooldownMultiplier(state);
  for (const actionId in state.chaosActionCooldowns) {
    state.chaosActionCooldowns[actionId] = Math.max(
      0,
      state.chaosActionCooldowns[actionId] - dt * cooldownMultiplier
    );
  }
}

// ============================================================================
// PRODUCTION MULTIPLIERS
// ============================================================================

export function getTotalProductionMultiplier(state: ExtendedGameState): number {
  // Energy mode multiplier
  const energyModeMultiplier = getEnergyProductionMultiplier(state);

  // Chaos threshold multiplier
  const chaosMultipliers = getChaosThresholdMultipliers(state);

  // Permanent unlock multiplier
  const permanentMultiplier = getPermanentProductionMultiplier(state);

  // Active bonus multiplier (from milestones, boosters, etc.)
  const { productionMultiplier: bonusMultiplier } = getActiveBonusMultipliers(state);

  // Milestone permanent bonus
  const { productionBonus: milestoneBonus } = getPermanentBonusesFromMilestones(state);

  return (
    energyModeMultiplier *
    chaosMultipliers.productionMultiplier *
    permanentMultiplier *
    bonusMultiplier *
    (1 + milestoneBonus / 100)
  );
}

// ============================================================================
// IDLE/OFFLINE PROGRESS
// ============================================================================

export function calculateOfflineProgress(
  state: ExtendedGameState,
  timeAway: number
): {
  vibesGained: number;
  timeProcessed: number;
} {
  // Cap offline progress at 4 hours (14400 seconds)
  const maxOfflineTime = 14400;
  const effectiveTime = Math.min(timeAway, maxOfflineTime);

  // Calculate offline production rate (simplified, no complex interactions)
  let vibesPerSec = calculateVibesPerSecondQuick(state);

  // Apply offline efficiency (50% base, upgradeable)
  const offlineEfficiency = 0.5; // Will use getOfflineProgressEfficiency(state) when imported

  vibesPerSec *= offlineEfficiency;

  // Apply production multipliers (but not temporary bonuses)
  const permanentMultiplier = getPermanentProductionMultiplier(state);
  vibesPerSec *= permanentMultiplier;

  const vibesGained = vibesPerSec * effectiveTime;

  return {
    vibesGained,
    timeProcessed: effectiveTime,
  };
}

export function claimOfflineProgress(state: ExtendedGameState): void {
  if (!state.offlineProgressPending) return;

  const { vibesGained } = state.offlineProgressPending;

  state.vibes += vibesGained;
  state.totalVibesEarned += vibesGained;

  state.log.push({
    timestamp: state.timeRemaining,
    message: `💤 Welcome back! Earned ${Math.floor(vibesGained).toLocaleString()} vibes while away`,
    type: 'achievement',
  });

  state.offlineProgressPending.claimed = true;
}

// ============================================================================
// MAIN INTEGRATION FUNCTION
// ============================================================================

export function processProgressionSystems(state: GameState, deltaTime: number): GameState {
  // Upgrade to extended state if needed
  const extendedState = isExtendedGameState(state)
    ? state
    : upgradeToExtendedGameState(state);

  // Track last active time
  extendedState.lastActiveTime = Date.now();

  // Process auto-clicker
  processAutoClicker(extendedState, deltaTime);

  // Process energy system
  processEnergySystem(extendedState, deltaTime);

  // Process chaos system
  processChaosSystem(extendedState, deltaTime);

  // Cleanup expired bonuses
  cleanupExpiredBonuses(extendedState);

  // Check and award milestones
  processMilestones(extendedState);

  // Tick down build swap cooldown
  if (extendedState.buildSwapCooldown > 0) {
    extendedState.buildSwapCooldown = Math.max(
      0,
      extendedState.buildSwapCooldown - deltaTime / 1000
    );
  }

  // Update max combo statistic
  extendedState.statistics.highestCombo = Math.max(
    extendedState.statistics.highestCombo,
    extendedState.maxCombo
  );

  return extendedState;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function calculateVibesPerSecondQuick(state: GameState): number {
  // Quick estimation without full calculation
  // This should be replaced with proper calculation from upgradeEffects.ts
  let total = 0;
  for (const [_, count] of Object.entries(state.substances)) {
    total += count * 1; // Assume average of 1 vibe/sec per substance
  }
  return total;
}

// ============================================================================
// OFFLINE PROGRESS DETECTION
// ============================================================================

export function checkOfflineProgress(state: ExtendedGameState): void {
  const now = Date.now();
  const timeSinceLastActive = (now - state.lastActiveTime) / 1000; // seconds

  // Only calculate offline progress if away for more than 5 minutes
  if (timeSinceLastActive > 300 && !state.offlineProgressPending) {
    const offlineProgress = calculateOfflineProgress(state, timeSinceLastActive);

    state.offlineProgressPending = {
      vibesGained: offlineProgress.vibesGained,
      timeAway: offlineProgress.timeProcessed,
      claimed: false,
    };
  }
}

// ============================================================================
// BUILD/LOADOUT SYSTEM
// ============================================================================

export function tickBuildSwapCooldown(state: ExtendedGameState, deltaTime: number): void {
  if (state.buildSwapCooldown > 0) {
    state.buildSwapCooldown = Math.max(0, state.buildSwapCooldown - deltaTime / 1000);
  }
}

// ============================================================================
// STATISTICS TRACKING
// ============================================================================

export function updateStatistics(state: ExtendedGameState): void {
  // Count unique substances
  const uniqueSubstances = Object.values(state.substances).filter((count) => count > 0).length;
  state.statistics.maxSimultaneousSubstances = Math.max(
    state.statistics.maxSimultaneousSubstances,
    uniqueSubstances
  );
}
