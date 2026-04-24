import { GameState } from "./types";
import type { InteractionMultipliers } from "./interactions";
import { getAlcoholAmplification } from "./interactions";
import type { SubstanceAggregates } from "./tickProduction";

// Energy regeneration — base + per-knowledge-level bonus
const ENERGY_REGEN_BASE = 1.0;
const ENERGY_REGEN_PER_KNOWLEDGE = 0.2;
const HYDRATION_ENERGY_PENALTY_THRESHOLD = 70;

// Chaos decay & empathogen pull
const CHAOS_DECAY_THRESHOLD = 30;
const CHAOS_DECAY_RATE = 0.3;
const EMPATHOGEN_PULL_TARGET = 50;
const EMPATHOGEN_PULL_RATE = 0.8;
const CHAOS_RANDOM_SHIFT_AMPLITUDE = 3;
const PARADOX_CHANCE_PER_SEC = 0.05;
const PARADOX_CHAOS_MAX = 10;

// Hydration & sleep
const HYDRATION_PASSIVE_RECOVERY_THRESHOLD = 2;
const HYDRATION_PASSIVE_RECOVERY_RATE = 0.15;
const STIMULANT_SLEEP_DEBT_THRESHOLD = 10;
const STIMULANT_SLEEP_DEBT_RATE = 0.05;
const SLEEP_DEBT_RECOVERY_THRESHOLD = 8;
const SLEEP_DEBT_RECOVERY_RATE = 0.1;
const SLEEP_DEBT_CAP = 200;

// Strain
const STRAIN_ACCUMULATION_FACTOR = 0.7;
const STRAIN_ALCOHOL_AMP_CAP = 1.5;
const STRAIN_INTERACTION_CAP = 2.0;
const STRAIN_CHAOS_PENALTY_THRESHOLD = 85;
const STRAIN_CHAOS_PENALTY_FACTOR = 0.01;
const STRAIN_HYDRATION_THRESHOLD = 70;
const STRAIN_HYDRATION_FACTOR = 0.005;
const STRAIN_DECAY_THRESHOLD = 20;
const STRAIN_DECAY_RATE = 0.2;
const STRAIN_DECAY_TOTAL_MOD_CEILING = 0.5;

// Memory
const MEMORY_PASSIVE_RECOVERY_RATE = 0.1;
const MEMORY_PASSIVE_RECOVERY_MOD_FLOOR = -1;
const MEMORY_CRASH_RATE = 0.5; // alcohol + empathogen
const MEMORY_BLACKOUT_RATE = 1.0; // dissociative + sedative

// Confidence
const CONFIDENCE_VIBES_LOG_FACTOR = 10;
const CONFIDENCE_VIBES_THRESHOLD = 1000;
const CONFIDENCE_ENERGY_THRESHOLD = 60;
const CONFIDENCE_ENERGY_FACTOR = 0.3;

// Distortion thresholds — visual glitch level based on confidence/memory
const DISTORTION_LEVEL_1_CONFIDENCE_MIN = 75;
const DISTORTION_LEVEL_1_CONFIDENCE_MAX = 86;
const DISTORTION_LEVEL_1_MEMORY_MIN = 15;
const DISTORTION_LEVEL_1_MEMORY_MAX = 30;
const DISTORTION_LEVEL_2_CONFIDENCE_MIN = 86;
const DISTORTION_LEVEL_2_CONFIDENCE_MAX = 96;
const DISTORTION_LEVEL_2_MEMORY_MIN = 5;
const DISTORTION_LEVEL_2_MEMORY_MAX = 15;
const DISTORTION_LEVEL_3_CONFIDENCE_MIN = 96;
const DISTORTION_LEVEL_3_MEMORY_MAX = 5;

export function applyEnergyUpdate(
  state: GameState,
  dt: number,
  aggregates: SubstanceAggregates,
): void {
  state.energy += aggregates.energyMod * dt;

  const regen = ENERGY_REGEN_BASE + state.knowledgeLevel * ENERGY_REGEN_PER_KNOWLEDGE;
  state.energy += regen * dt;

  if (state.hydrationDebt > HYDRATION_ENERGY_PENALTY_THRESHOLD) {
    const penalty = Math.min(
      regen * dt * 0.3,
      (state.hydrationDebt - HYDRATION_ENERGY_PENALTY_THRESHOLD) * 0.005 * dt,
    );
    state.energy -= penalty;
  }

  state.energy = Math.max(0, Math.min(100, state.energy));
}

export function applyChaosUpdate(
  state: GameState,
  dt: number,
  aggregates: SubstanceAggregates,
  interactions: InteractionMultipliers,
): void {
  state.chaos += aggregates.chaosMod * dt;

  if (state.chaos > CHAOS_DECAY_THRESHOLD) {
    state.chaos -= CHAOS_DECAY_RATE * dt;
  }

  // Empathogen pulls chaos toward a target value (both directions).
  const empathogenCount = state.substances.empathogen || 0;
  if (empathogenCount > 0) {
    const pullStrength = EMPATHOGEN_PULL_RATE * empathogenCount * dt;
    if (state.chaos < EMPATHOGEN_PULL_TARGET) {
      state.chaos += pullStrength;
    } else {
      state.chaos -= pullStrength;
    }
  }

  if (interactions.specialEffects.includes("chaos_randomization")) {
    const randomShift = (Math.random() - 0.5) * CHAOS_RANDOM_SHIFT_AMPLITUDE * dt;
    state.chaos += randomShift;
  }

  if (interactions.specialEffects.includes("paradox_anxiety")) {
    if (Math.random() < PARADOX_CHANCE_PER_SEC * dt) {
      state.chaos += Math.random() * PARADOX_CHAOS_MAX;
    }
  }

  state.chaos = Math.max(0, Math.min(100, state.chaos));
}

export function applyHydrationAndSleep(
  state: GameState,
  dt: number,
  aggregates: SubstanceAggregates,
  interactions: InteractionMultipliers,
): void {
  state.hydrationDebt += aggregates.hydrationMod * dt;

  if (aggregates.hydrationMod < HYDRATION_PASSIVE_RECOVERY_THRESHOLD) {
    state.hydrationDebt = Math.max(
      0,
      state.hydrationDebt - HYDRATION_PASSIVE_RECOVERY_RATE * dt,
    );
  }

  if (interactions.specialEffects.includes("triple_hydration")) {
    state.hydrationDebt += aggregates.hydrationMod * 1.5 * dt;
  }

  state.hydrationDebt = Math.max(0, state.hydrationDebt);

  state.sleepDebt += aggregates.sleepDebtMod * dt;

  if (aggregates.stimulantCount >= STIMULANT_SLEEP_DEBT_THRESHOLD) {
    state.sleepDebt +=
      Math.pow(aggregates.stimulantCount - (STIMULANT_SLEEP_DEBT_THRESHOLD - 1), 1.5) *
      STIMULANT_SLEEP_DEBT_RATE *
      dt;
  }

  if (aggregates.stimulantCount < SLEEP_DEBT_RECOVERY_THRESHOLD) {
    state.sleepDebt = Math.max(0, state.sleepDebt - SLEEP_DEBT_RECOVERY_RATE * dt);
  }

  state.sleepDebt = Math.max(0, Math.min(SLEEP_DEBT_CAP, state.sleepDebt));
}

export function applyStrainUpdate(
  state: GameState,
  dt: number,
  aggregates: SubstanceAggregates,
  interactions: InteractionMultipliers,
): void {
  const alcoholAmp = getAlcoholAmplification(state.substances.alcohol || 0);

  let strainAccumulation = aggregates.strainMod * dt * STRAIN_ACCUMULATION_FACTOR;
  strainAccumulation *= Math.min(alcoholAmp, STRAIN_ALCOHOL_AMP_CAP);
  strainAccumulation *= Math.min(interactions.strainMultiplier, STRAIN_INTERACTION_CAP);

  if (state.chaos > STRAIN_CHAOS_PENALTY_THRESHOLD) {
    strainAccumulation *=
      1 + (state.chaos - STRAIN_CHAOS_PENALTY_THRESHOLD) * STRAIN_CHAOS_PENALTY_FACTOR;
  }

  if (state.hydrationDebt > STRAIN_HYDRATION_THRESHOLD) {
    strainAccumulation +=
      (state.hydrationDebt - STRAIN_HYDRATION_THRESHOLD) * STRAIN_HYDRATION_FACTOR * dt;
  }

  if (
    state.strain > STRAIN_DECAY_THRESHOLD &&
    aggregates.strainMod < STRAIN_DECAY_TOTAL_MOD_CEILING
  ) {
    state.strain -= STRAIN_DECAY_RATE * dt;
  }

  state.strain += strainAccumulation;
  state.strain = Math.max(0, state.strain);
}

export function applyMemoryUpdate(
  state: GameState,
  dt: number,
  aggregates: SubstanceAggregates,
  interactions: InteractionMultipliers,
): void {
  state.memoryIntegrity += aggregates.memoryMod * dt;

  if (
    aggregates.memoryMod > MEMORY_PASSIVE_RECOVERY_MOD_FLOOR &&
    state.memoryIntegrity < 100
  ) {
    state.memoryIntegrity += MEMORY_PASSIVE_RECOVERY_RATE * dt;
  }

  if (interactions.specialEffects.includes("memory_crash")) {
    state.memoryIntegrity -= MEMORY_CRASH_RATE * dt;
  }

  if (interactions.specialEffects.includes("memory_blackout")) {
    state.memoryIntegrity -= MEMORY_BLACKOUT_RATE * dt;
  }

  state.memoryIntegrity = Math.max(0, Math.min(100, state.memoryIntegrity));
}

export function applyConfidenceUpdate(
  state: GameState,
  aggregates: SubstanceAggregates,
): void {
  let confidence = aggregates.confidenceMod;

  if (state.vibes > CONFIDENCE_VIBES_THRESHOLD) {
    confidence += Math.log10(state.vibes / CONFIDENCE_VIBES_THRESHOLD) * CONFIDENCE_VIBES_LOG_FACTOR;
  }

  if (state.energy > CONFIDENCE_ENERGY_THRESHOLD) {
    confidence += (state.energy - CONFIDENCE_ENERGY_THRESHOLD) * CONFIDENCE_ENERGY_FACTOR;
  }

  state.confidence = Math.max(0, Math.min(100, confidence));
}

export function calculateDistortionLevel(state: GameState): number {
  if (state.disableDistortion) return 0;

  let level = 0;

  if (
    (state.confidence >= DISTORTION_LEVEL_1_CONFIDENCE_MIN &&
      state.confidence < DISTORTION_LEVEL_1_CONFIDENCE_MAX) ||
    (state.memoryIntegrity >= DISTORTION_LEVEL_1_MEMORY_MIN &&
      state.memoryIntegrity < DISTORTION_LEVEL_1_MEMORY_MAX)
  ) {
    level = 1;
  }

  if (
    (state.confidence >= DISTORTION_LEVEL_2_CONFIDENCE_MIN &&
      state.confidence < DISTORTION_LEVEL_2_CONFIDENCE_MAX) ||
    (state.memoryIntegrity >= DISTORTION_LEVEL_2_MEMORY_MIN &&
      state.memoryIntegrity < DISTORTION_LEVEL_2_MEMORY_MAX)
  ) {
    level = 2;
  }

  if (
    state.confidence >= DISTORTION_LEVEL_3_CONFIDENCE_MIN ||
    state.memoryIntegrity < DISTORTION_LEVEL_3_MEMORY_MAX
  ) {
    level = 3;
  }

  return level;
}
