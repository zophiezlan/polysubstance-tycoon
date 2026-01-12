import { GameState } from './types';
import { getSubstance } from './substances';
import { calculateExperience, getKnowledgeLevel } from './prestige';
import {
  calculateInteractionMultipliers,
  getAlcoholAmplification,
  getStimulantEnergyMod,
} from './interactions';
import { calculateProductionMultiplier } from './upgradeEffects';
import { tickCombo } from './combos';
import { checkGroupChatTriggers } from './groupChat';
import { checkOrganComplaints } from './organCommentary';
import {
  processProgressionSystems,
  getTotalProductionMultiplier,
  checkOfflineProgress,
} from './progressionIntegration';
import { isExtendedGameState } from './progressionTypes';

export function gameTick(state: GameState, deltaTime: number): GameState {
  if (!state.isNightActive) {
    return state;
  }

  const newState = { ...state };
  const dt = deltaTime / 1000; // Convert to seconds

  // Check for offline progress on first tick back
  if (isExtendedGameState(newState)) {
    checkOfflineProgress(newState);
  }

  // Process all new progression systems (auto-clicker, energy modes, chaos strategies, milestones)
  const stateAfterProgression = processProgressionSystems(newState, deltaTime);
  Object.assign(newState, stateAfterProgression);

  // Calculate interaction effects
  const interactions = calculateInteractionMultipliers(newState.substances);
  const alcoholCount = newState.substances.alcohol || 0;
  const alcoholAmp = getAlcoholAmplification(alcoholCount);

  // Track cumulative time extension for stimulant flip
  let cumulativeTimeExtension = 3600 - newState.timeRemaining;

  // 1. Passive vibe generation from substances
  let totalVibesPerSec = 0;
  let totalEnergyMod = 0;
  let totalChaosMod = 0;
  let totalStrainMod = 0;
  let totalHydrationMod = 0;
  let totalSleepDebtMod = 0;
  let totalMemoryMod = 0;
  let totalConfidenceMod = 0;

  Object.keys(newState.substances).forEach(substanceId => {
    const count = newState.substances[substanceId];
    if (count === 0) return;

    const substance = getSubstance(substanceId);
    if (!substance) return;

    // Apply upgrade multipliers to production
    const productionMultiplier = calculateProductionMultiplier(newState, substanceId);

    totalVibesPerSec += substance.baseVibes * count * productionMultiplier;
    totalEnergyMod += substance.energyMod * count;
    totalChaosMod += substance.chaosMod * count;
    totalStrainMod += substance.strainMod * count;
    totalHydrationMod += substance.hydrationMod * count;
    totalSleepDebtMod += substance.sleepDebtMod * count;
    totalMemoryMod += substance.memoryMod * count;
    totalConfidenceMod += substance.confidenceMod * count;

    // Special handling for stimulants
    if (substanceId === 'stimulant') {
      const adjustedEnergyMod = getStimulantEnergyMod(substance.energyMod, cumulativeTimeExtension);
      totalEnergyMod += (adjustedEnergyMod - substance.energyMod) * count;
    }
  });

  // Apply vibe multiplier from interactions
  totalVibesPerSec *= interactions.vibesMultiplier;

  // Apply new progression system multipliers (energy modes, chaos thresholds, permanent unlocks, milestones)
  if (isExtendedGameState(newState)) {
    const progressionMultiplier = getTotalProductionMultiplier(newState);
    totalVibesPerSec *= progressionMultiplier;
  }

  const vibesGained = totalVibesPerSec * dt;
  newState.vibes += vibesGained;
  newState.totalVibesEarned += vibesGained;
  newState.timePlayed += dt;
  newState.highestVibesPerSecond = Math.max(newState.highestVibesPerSecond, totalVibesPerSec);

  // 2. Apply energy changes - ENERGY IS ALWAYS POSITIVE!
  // NOTE: Energy regeneration is now handled by progressionIntegration.ts
  // This section only applies substance modifiers
  newState.energy += totalEnergyMod * dt;

  // Hydration debt SLIGHTLY reduces energy gain (if not using new system)
  if (!isExtendedGameState(newState) && newState.hydrationDebt > 70) {
    const baseRegen = 1.0 + newState.knowledgeLevel * 0.2; // Buffed for better energy management
    const energyRegen = baseRegen * dt;
    const penalty = Math.min(energyRegen * 0.3, (newState.hydrationDebt - 70) * 0.005 * dt);
    newState.energy -= penalty;
  }

  // Energy is always 0-100, but 0 energy just means no bonus (not a penalty)
  newState.energy = Math.max(0, Math.min(100, newState.energy));

  // 3. Apply chaos changes - EASY MODE
  // NOTE: Chaos decay and strategy effects are now handled by progressionIntegration.ts
  // This section only applies substance modifiers and special interactions
  newState.chaos += totalChaosMod * dt;

  // Legacy chaos decay (only if not using new system)
  if (!isExtendedGameState(newState)) {
    const chaosDecay = 0.3 * dt;
    if (newState.chaos > 30) {
      newState.chaos -= chaosDecay;
    }
  }

  // Empathogen special: pulls chaos toward 50 (more strongly now)
  const empathogenCount = newState.substances.empathogen || 0;
  if (empathogenCount > 0) {
    const pullStrength = 0.8 * empathogenCount * dt; // Increased from 0.5
    if (newState.chaos < 50) {
      newState.chaos += pullStrength;
    } else {
      newState.chaos -= pullStrength;
    }
  }

  // Handle chaos randomization from dissociative + alcohol (reduced intensity)
  if (interactions.specialEffects.includes('chaos_randomization')) {
    const randomShift = (Math.random() - 0.5) * 3 * dt; // Reduced from 5
    newState.chaos += randomShift;
  }

  // Paradox anxiety from stimulant + sedative (less frequent, less intense)
  if (interactions.specialEffects.includes('paradox_anxiety')) {
    if (Math.random() < 0.05 * dt) { // Reduced from 0.1
      newState.chaos += Math.random() * 10; // Reduced from 20
    }
  }

  newState.chaos = Math.max(0, Math.min(100, newState.chaos));

  // 4. Update hidden meters - COOKIE CLICKER MODE: More forgiving
  newState.hydrationDebt += totalHydrationMod * dt;

  // COOKIE CLICKER MODE: Passive hydration debt recovery (drinking water is implied)
  // Slow passive recovery when not actively dehydrating heavily
  if (totalHydrationMod < 2) {
    newState.hydrationDebt = Math.max(0, newState.hydrationDebt - 0.15 * dt);
  }

  newState.hydrationDebt = Math.max(0, newState.hydrationDebt);

  // Triple hydration from stimulant + empathogen (but less punishing now)
  if (interactions.specialEffects.includes('triple_hydration')) {
    newState.hydrationDebt += totalHydrationMod * 1.5 * dt; // Reduced from 2x
  }

  newState.sleepDebt += totalSleepDebtMod * dt;

  // Exponential sleep debt after 10 stimulants (but less harsh)
  const stimulantCount = newState.substances.stimulant || 0;
  if (stimulantCount >= 10) {
    newState.sleepDebt += Math.pow(stimulantCount - 9, 1.5) * 0.05 * dt; // Reduced from 0.1
  }

  // COOKIE CLICKER MODE: Passive sleep debt recovery (allows endless play)
  // Always recovering slowly, even with moderate stimulant use
  if (stimulantCount < 8) { // Increased threshold from 5
    newState.sleepDebt = Math.max(0, newState.sleepDebt - 0.1 * dt); // Increased from 0.05
  }

  newState.sleepDebt = Math.max(0, newState.sleepDebt);

  // 5. Calculate strain with interactions - COOKIE CLICKER MODE: Slower accumulation
  let strainAccumulation = totalStrainMod * dt * 0.7; // 30% reduction in base accumulation

  // Apply alcohol amplification (but capped to stay reasonable)
  strainAccumulation *= Math.min(alcoholAmp, 1.5); // Cap amplification at 1.5x

  // Apply interaction multipliers (but reduced impact)
  strainAccumulation *= Math.min(interactions.strainMultiplier, 2.0); // Cap at 2x

  // High chaos penalty (only at very high chaos, reduced impact)
  if (newState.chaos > 85) {
    strainAccumulation *= 1 + ((newState.chaos - 85) * 0.01); // Reduced from 0.02, higher threshold
  }

  // Hydration debt increases strain (more forgiving threshold)
  if (newState.hydrationDebt > 70) {
    strainAccumulation += (newState.hydrationDebt - 70) * 0.005 * dt; // Reduced from 0.01
  }

  // COOKIE CLICKER MODE: Passive strain decay when low
  // This prevents strain from being a one-way ticket to collapse
  if (newState.strain > 20 && totalStrainMod < 0.5) {
    const strainDecay = 0.2 * dt;
    newState.strain -= strainDecay;
  }

  newState.strain += strainAccumulation;
  newState.strain = Math.max(0, newState.strain);

  // 6. Update memory integrity - COOKIE CLICKER MODE: Recoverable
  newState.memoryIntegrity += totalMemoryMod * dt;

  // COOKIE CLICKER MODE: Memory slowly recovers when not being actively damaged
  // Your brain is trying its best to piece things together
  if (totalMemoryMod > -1 && newState.memoryIntegrity < 100) {
    newState.memoryIntegrity += 0.1 * dt; // Slow passive recovery
  }

  // Memory crash from alcohol + empathogen (reduced intensity)
  if (interactions.specialEffects.includes('memory_crash')) {
    newState.memoryIntegrity -= 0.5 * dt; // Reduced from 0.8
  }

  // Memory blackout from dissociative + sedative (reduced intensity)
  if (interactions.specialEffects.includes('memory_blackout')) {
    newState.memoryIntegrity -= 1.0 * dt; // Reduced from 1.5
  }

  newState.memoryIntegrity = Math.max(0, Math.min(100, newState.memoryIntegrity));

  // 7. Update confidence
  newState.confidence = totalConfidenceMod;

  // High vibes inflate confidence
  if (newState.vibes > 1000) {
    newState.confidence += Math.log10(newState.vibes / 1000) * 10;
  }

  // High energy provides a confidence boost (positive reinforcement!)
  // Low energy just means no bonus, not a penalty
  if (newState.energy > 60) {
    newState.confidence += (newState.energy - 60) * 0.3;
  }

  newState.confidence = Math.max(0, Math.min(100, newState.confidence));

  // 8. Calculate distortion level
  newState.distortionLevel = calculateDistortionLevel(newState);

  // 9. Tick down time - but it loops endlessly now (Cookie Clicker style)
  newState.timeRemaining -= dt;

  // 10. Tick down cooldowns
  Object.keys(newState.actionCooldowns).forEach(actionId => {
    newState.actionCooldowns[actionId] = Math.max(0, newState.actionCooldowns[actionId] - dt);
  });

  // 11. COOKIE CLICKER MODE: Tick combo system
  tickCombo(newState, dt);

  // 12. PROGRESSIVE DISCLOSURE: Check for group chat triggers
  checkGroupChatTriggers(newState, dt);

  // 13. CURSED FEATURE: Organ complaints
  checkOrganComplaints(newState, dt);

  // 14. Check collapse condition - but don't end the game, just apply debuffs
  if (checkCollapse(newState)) {
    handleCollapse(newState);
  }

  // 15. ENDLESS MODE: Time loops, days increment, but NO STATE RESET
  // This is Cookie Clicker style - time is just a counter, not a game-ender
  if (newState.timeRemaining <= 0) {
    const xpGained = calculateExperience(newState, newState.hasCollapsed);
    const overtime = Math.abs(newState.timeRemaining);

    // Add XP and increment day counter
    newState.experience += xpGained;
    newState.knowledgeLevel = getKnowledgeLevel(newState.experience);
    newState.nightsCompleted += 1;
    newState.daysCompleted += 1;

    // Reset time to start a new "day" cycle
    newState.timeRemaining = 3600 - Math.min(overtime, 3599);
    newState.nightStartTime = Date.now();

    // Clear collapse flag for new day (but keep all stats/debuffs)
    newState.hasCollapsed = false;

    // COOKIE CLICKER MODE: DO NOT RESET ANYTHING ELSE
    // Keep: vibes, substances, energy, strain, chaos, memory, hydration, sleep debt
    // This allows endless accumulation and strategic management

    newState.log.push({
      timestamp: 0,
      message: `🌅 Day ${newState.daysCompleted} dawns. +${xpGained} XP. Everything continues...`,
      type: 'info',
    });
  }

  return newState;
}

export function calculateDistortionLevel(state: GameState): number {
  if (state.disableDistortion) {
    return 0;
  }

  let level = 0;

  // Level 1: Confidence 75-85, Memory 30-50
  if ((state.confidence >= 75 && state.confidence < 86) || (state.memoryIntegrity >= 15 && state.memoryIntegrity < 30)) {
    level = 1;
  }

  // Level 2: Confidence 86-95, Memory 15-29
  if ((state.confidence >= 86 && state.confidence < 96) || (state.memoryIntegrity >= 5 && state.memoryIntegrity < 15)) {
    level = 2;
  }

  // Level 3: Confidence >95, Memory <15
  if (state.confidence >= 96 || state.memoryIntegrity < 5) {
    level = 3;
  }

  return level;
}

export function checkCollapse(state: GameState): boolean {
  // COOKIE CLICKER MODE: Much more forgiving collapse mechanic
  // Base Collapse = 150 (increased from 100 to be more lenient)
  // Modified by:
  //   - Energy: +0.3 per point above 40 (easier to maintain buffer)
  //   - Hydration Debt: -0.2 per point (reduced penalty from 0.3)
  //   - Chaos: -0.1 per point above 80 (only matters at very high chaos, reduced from 0.2)

  const baseThreshold = 150; // More forgiving
  const energyBonus = state.energy > 40 ? (state.energy - 40) * 0.3 : 0;
  const hydrationPenalty = state.hydrationDebt * 0.2; // Reduced
  const chaosPenalty = state.chaos > 80 ? (state.chaos - 80) * 0.1 : 0; // Only kicks in above 80

  const collapseThreshold = baseThreshold + energyBonus - hydrationPenalty - chaosPenalty;

  return state.strain >= collapseThreshold;
}

export function handleCollapse(state: GameState): GameState {
  // COOKIE CLICKER MODE: Collapse is a mild setback - annoying but not devastating
  // This should feel like a "whoops" moment, not a punishment

  // Prevent spam-triggering: only trigger if not collapsed recently
  if (state.hasCollapsed) {
    return state; // Already collapsed, wait for recovery
  }

  state.hasCollapsed = true;

  // Add log entry (unless memory is completely gone)
  if (state.memoryIntegrity > 5) {
    const messages = [
      '⚠️ You overdid it a little. Take it easy.',
      '💫 Maybe slow down? Just a thought.',
      '🌊 That was a lot. Breathing recommended.',
      '⚡ Systems need a moment to recalibrate.',
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];

    state.log.push({
      timestamp: 3600 - state.timeRemaining,
      message,
      type: 'warning', // Changed from 'danger' to 'warning'
    });
  } else {
    state.log.push({
      timestamp: 3600 - state.timeRemaining,
      message: '[...wait what just happened?]',
      type: 'warning',
      corrupted: true,
    });
  }

  // MILD PENALTIES (easily recoverable):

  // 1. Reset strain to 60 (was 50) - barely a setback
  state.strain = 60;

  // 2. Minor energy dip (was -40, now -20)
  state.energy = Math.max(20, state.energy - 20);

  // 3. Slight memory hiccup (was -30, now -15)
  state.memoryIntegrity = Math.max(30, state.memoryIntegrity - 15);

  // 4. Small chaos bump (was +25, now +10)
  state.chaos = Math.min(100, state.chaos + 10);

  // 5. Hydration notice (was +20, now +10)
  state.hydrationDebt = Math.min(100, state.hydrationDebt + 10);

  // 6. Minor sleep debt (was +15, now +5)
  state.sleepDebt = Math.min(200, state.sleepDebt + 5);

  // NOTE: Production continues at full efficiency - collapse is just a tap on the shoulder
  // hasCollapsed flag clears on day rollover, allowing endless play

  return state;
}

export function handleNightEnd(state: GameState): GameState {
  const newState = { ...state };
  newState.timeRemaining = 0;

  if (newState.memoryIntegrity > 10) {
    newState.log.push({
      timestamp: 3600,
      message: 'Time\'s up. Night complete.',
      type: 'info',
    });
  } else {
    newState.log.push({
      timestamp: 3600,
      message: '...something ended?',
      type: 'info',
      corrupted: true,
    });
  }

  return newState;
}
