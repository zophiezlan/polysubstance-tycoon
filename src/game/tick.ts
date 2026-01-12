import { GameState } from './types';
import { getSubstance } from './substances';
import { calculateExperience, getKnowledgeLevel } from './prestige';
import {
  calculateInteractionMultipliers,
  getAlcoholAmplification,
  getStimulantEnergyMod,
} from './interactions';
import { calculateProductionMultiplier } from './upgradeEffects';

export function gameTick(state: GameState, deltaTime: number): GameState {
  if (!state.isNightActive) {
    return state;
  }

  const newState = { ...state };
  const dt = deltaTime / 1000; // Convert to seconds

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

  const vibesGained = totalVibesPerSec * dt;
  newState.vibes += vibesGained;
  newState.totalVibesEarned += vibesGained;
  newState.timePlayed += dt;
  newState.highestVibesPerSecond = Math.max(newState.highestVibesPerSecond, totalVibesPerSec);

  // 2. Apply energy changes
  newState.energy += totalEnergyMod * dt;

  // COOKIE CLICKER MODE: Improved energy sustainability
  // Base passive energy regen (always active, scales with progression)
  const baseRegen = 0.3; // Increased from 0.1
  const progressionBonus = Math.min(1.0, newState.knowledgeLevel * 0.1); // +0.1 per knowledge level
  const energyRegen = (baseRegen + progressionBonus) * dt;

  // Apply regen when below max (not just when low)
  if (newState.energy < 100) {
    newState.energy += energyRegen;
  }

  // Hydration debt reduces but doesn't eliminate regen
  if (newState.hydrationDebt > 50) {
    const penalty = Math.min(energyRegen, (newState.hydrationDebt - 50) * 0.01 * dt);
    newState.energy -= penalty;
  }

  newState.energy = Math.max(0, Math.min(100, newState.energy));

  // 3. Apply chaos changes
  newState.chaos += totalChaosMod * dt;

  // Empathogen special: pulls chaos toward 50
  const empathogenCount = newState.substances.empathogen || 0;
  if (empathogenCount > 0) {
    const pullStrength = 0.5 * empathogenCount * dt;
    if (newState.chaos < 50) {
      newState.chaos += pullStrength;
    } else {
      newState.chaos -= pullStrength;
    }
  }

  // Handle chaos randomization from dissociative + alcohol
  if (interactions.specialEffects.includes('chaos_randomization')) {
    const randomShift = (Math.random() - 0.5) * 5 * dt;
    newState.chaos += randomShift;
  }

  // Paradox anxiety from stimulant + sedative
  if (interactions.specialEffects.includes('paradox_anxiety')) {
    if (Math.random() < 0.1 * dt) {
      newState.chaos += Math.random() * 20;
    }
  }

  newState.chaos = Math.max(0, Math.min(100, newState.chaos));

  // 4. Update hidden meters
  newState.hydrationDebt += totalHydrationMod * dt;
  newState.hydrationDebt = Math.max(0, newState.hydrationDebt);

  // Triple hydration from stimulant + empathogen
  if (interactions.specialEffects.includes('triple_hydration')) {
    newState.hydrationDebt += totalHydrationMod * 2 * dt; // Already added once, add 2x more
  }

  newState.sleepDebt += totalSleepDebtMod * dt;

  // Exponential sleep debt after 10 stimulants
  const stimulantCount = newState.substances.stimulant || 0;
  if (stimulantCount >= 10) {
    newState.sleepDebt += Math.pow(stimulantCount - 9, 1.5) * 0.1 * dt;
  }

  // COOKIE CLICKER MODE: Passive sleep debt recovery (very slow but allows endless play)
  // Only recovers when not actively using stimulants heavily
  if (stimulantCount < 5) {
    newState.sleepDebt = Math.max(0, newState.sleepDebt - 0.05 * dt);
  }

  newState.sleepDebt = Math.max(0, newState.sleepDebt);

  // 5. Calculate strain with interactions
  let strainAccumulation = totalStrainMod * dt;

  // Apply alcohol amplification
  strainAccumulation *= alcoholAmp;

  // Apply interaction multipliers
  strainAccumulation *= interactions.strainMultiplier;

  // High chaos penalty
  if (newState.chaos > 70) {
    strainAccumulation *= 1 + ((newState.chaos - 70) * 0.02);
  }

  // Hydration debt increases strain
  if (newState.hydrationDebt > 50) {
    strainAccumulation += (newState.hydrationDebt - 50) * 0.01 * dt;
  }

  newState.strain += strainAccumulation;
  newState.strain = Math.max(0, newState.strain);

  // 6. Update memory integrity
  newState.memoryIntegrity += totalMemoryMod * dt;

  // Memory crash from alcohol + empathogen
  if (interactions.specialEffects.includes('memory_crash')) {
    newState.memoryIntegrity -= 0.8 * dt;
  }

  // Memory blackout from dissociative + sedative
  if (interactions.specialEffects.includes('memory_blackout')) {
    newState.memoryIntegrity -= 1.5 * dt;
  }

  newState.memoryIntegrity = Math.max(0, Math.min(100, newState.memoryIntegrity));

  // 7. Update confidence
  newState.confidence = totalConfidenceMod;

  // High vibes inflate confidence
  if (newState.vibes > 1000) {
    newState.confidence += Math.log10(newState.vibes / 1000) * 10;
  }

  // Low energy/high chaos should reduce confidence, but we invert it (THE LIE)
  if (newState.energy < 30) {
    newState.confidence += (30 - newState.energy) * 0.5; // OPPOSITE of reality
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

  // 11. Check collapse condition - but don't end the game, just apply debuffs
  if (checkCollapse(newState)) {
    handleCollapse(newState);
  }

  // 12. ENDLESS MODE: Time loops, days increment, but NO STATE RESET
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
  // Base Collapse = 100
  // Modified by:
  //   - Energy: +0.5 per point above 50
  //   - Hydration Debt: -0.3 per point
  //   - Chaos: -0.2 per point above 70

  const baseThreshold = 100;
  const energyBonus = state.energy > 50 ? (state.energy - 50) * 0.5 : 0;
  const hydrationPenalty = state.hydrationDebt * 0.3;
  const chaosPenalty = state.chaos > 70 ? (state.chaos - 70) * 0.2 : 0;

  const collapseThreshold = baseThreshold + energyBonus - hydrationPenalty - chaosPenalty;

  return state.strain >= collapseThreshold;
}

export function handleCollapse(state: GameState): GameState {
  // COOKIE CLICKER MODE: Collapse is a setback, not a game-over
  // Apply harsh debuffs but allow recovery and continuation

  // Prevent spam-triggering: only trigger if not collapsed recently
  if (state.hasCollapsed) {
    return state; // Already collapsed, wait for recovery
  }

  state.hasCollapsed = true;

  // Add log entry (unless memory is completely gone)
  if (state.memoryIntegrity > 5) {
    const messages = [
      '⚠️ COLLAPSE EVENT: Heavy penalties applied.',
      'You pushed too hard. Everything slows down...',
      'The Night fights back. Systems degrading...',
      '[WARNING] Operating at reduced capacity.',
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];

    state.log.push({
      timestamp: 3600 - state.timeRemaining,
      message,
      type: 'danger',
    });
  } else {
    state.log.push({
      timestamp: 3600 - state.timeRemaining,
      message: '[DATA CORRUPTED] - SYSTEM INSTABILITY',
      type: 'danger',
      corrupted: true,
    });
  }

  // HARSH PENALTIES (but recoverable):

  // 1. Reset strain to 50 (not 0) - you're hurt but functional
  state.strain = 50;

  // 2. Heavy energy drain
  state.energy = Math.max(0, state.energy - 40);

  // 3. Memory damage
  state.memoryIntegrity = Math.max(0, state.memoryIntegrity - 30);

  // 4. Chaos spike
  state.chaos = Math.min(100, state.chaos + 25);

  // 5. Hydration crisis
  state.hydrationDebt = Math.min(100, state.hydrationDebt + 20);

  // 6. Sleep debt penalty (for future cycles)
  state.sleepDebt = Math.min(200, state.sleepDebt + 15);

  // NOTE: Production continues but at reduced efficiency due to debuffs
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
