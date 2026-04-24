import { GameState } from "./types";
import { calculateExperience, getKnowledgeLevel } from "./prestige";

// Collapse thresholds — strain level at which the player "collapses" (mild
// setback rather than game-over).
const COLLAPSE_BASE_THRESHOLD = 150;
const COLLAPSE_ENERGY_THRESHOLD = 40;
const COLLAPSE_ENERGY_FACTOR = 0.3;
const COLLAPSE_HYDRATION_FACTOR = 0.2;
const COLLAPSE_CHAOS_THRESHOLD = 80;
const COLLAPSE_CHAOS_FACTOR = 0.1;

// Collapse penalties — how rough the "oops" moment is.
const COLLAPSE_STRAIN_RESET = 60;
const COLLAPSE_ENERGY_DIP = 20;
const COLLAPSE_ENERGY_FLOOR = 20;
const COLLAPSE_MEMORY_DIP = 15;
const COLLAPSE_MEMORY_FLOOR = 30;
const COLLAPSE_CHAOS_BUMP = 10;
const COLLAPSE_HYDRATION_BUMP = 10;
const COLLAPSE_SLEEP_DEBT_BUMP = 5;
const COLLAPSE_SLEEP_DEBT_CAP = 200;

// Day cycle — length of one in-game day and how much overtime carries over.
const DAY_LENGTH_SECONDS = 3600;
const MAX_CARRY_OVER_OVERTIME = DAY_LENGTH_SECONDS - 1;

export function tickCooldowns(state: GameState, dt: number): void {
  for (const actionId of Object.keys(state.actionCooldowns)) {
    state.actionCooldowns[actionId] = Math.max(
      0,
      state.actionCooldowns[actionId] - dt,
    );
  }
}

export function checkCollapse(state: GameState): boolean {
  const energyBonus =
    state.energy > COLLAPSE_ENERGY_THRESHOLD
      ? (state.energy - COLLAPSE_ENERGY_THRESHOLD) * COLLAPSE_ENERGY_FACTOR
      : 0;
  const hydrationPenalty = state.hydrationDebt * COLLAPSE_HYDRATION_FACTOR;
  const chaosPenalty =
    state.chaos > COLLAPSE_CHAOS_THRESHOLD
      ? (state.chaos - COLLAPSE_CHAOS_THRESHOLD) * COLLAPSE_CHAOS_FACTOR
      : 0;

  const threshold = COLLAPSE_BASE_THRESHOLD + energyBonus - hydrationPenalty - chaosPenalty;
  return state.strain >= threshold;
}

export function handleCollapse(state: GameState): GameState {
  // Single collapse per cycle; cleared by day rollover.
  if (state.hasCollapsed) return state;

  state.hasCollapsed = true;

  if (state.memoryIntegrity > 5) {
    const messages = [
      "⚠️ You overdid it a little. Take it easy.",
      "💫 Maybe slow down? Just a thought.",
      "🌊 That was a lot. Breathing recommended.",
      "⚡ Systems need a moment to recalibrate.",
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    state.log.push({
      timestamp: DAY_LENGTH_SECONDS - state.timeRemaining,
      message,
      type: "warning",
    });
  } else {
    state.log.push({
      timestamp: DAY_LENGTH_SECONDS - state.timeRemaining,
      message: "[...wait what just happened?]",
      type: "warning",
      corrupted: true,
    });
  }

  state.strain = COLLAPSE_STRAIN_RESET;
  state.energy = Math.max(COLLAPSE_ENERGY_FLOOR, state.energy - COLLAPSE_ENERGY_DIP);
  state.memoryIntegrity = Math.max(
    COLLAPSE_MEMORY_FLOOR,
    state.memoryIntegrity - COLLAPSE_MEMORY_DIP,
  );
  state.chaos = Math.min(100, state.chaos + COLLAPSE_CHAOS_BUMP);
  state.hydrationDebt = Math.min(100, state.hydrationDebt + COLLAPSE_HYDRATION_BUMP);
  state.sleepDebt = Math.min(
    COLLAPSE_SLEEP_DEBT_CAP,
    state.sleepDebt + COLLAPSE_SLEEP_DEBT_BUMP,
  );

  return state;
}

export function checkAndHandleCollapse(state: GameState): void {
  if (checkCollapse(state)) {
    handleCollapse(state);
  }
}

/**
 * Advance time and roll over to a new day if the clock hit zero. Preserves
 * everything else (vibes, substances, meters) — Cookie-Clicker-style endless
 * mode.
 */
export function advanceTime(state: GameState, dt: number): void {
  state.timeRemaining -= dt;

  if (state.timeRemaining > 0) return;

  const xpGained = calculateExperience(state, state.hasCollapsed);
  const overtime = Math.abs(state.timeRemaining);

  state.experience += xpGained;
  state.knowledgeLevel = getKnowledgeLevel(state.experience);
  state.nightsCompleted += 1;
  state.daysCompleted += 1;

  state.timeRemaining = DAY_LENGTH_SECONDS - Math.min(overtime, MAX_CARRY_OVER_OVERTIME);
  state.nightStartTime = Date.now();
  state.hasCollapsed = false;

  state.log.push({
    timestamp: 0,
    message: `🌅 Day ${state.daysCompleted} dawns. +${xpGained} XP. Everything continues...`,
    type: "info",
  });
}

export function handleNightEnd(state: GameState): GameState {
  const newState = { ...state };
  newState.timeRemaining = 0;

  if (newState.memoryIntegrity > 10) {
    newState.log.push({
      timestamp: DAY_LENGTH_SECONDS,
      message: "Time's up. Night complete.",
      type: "info",
    });
  } else {
    newState.log.push({
      timestamp: DAY_LENGTH_SECONDS,
      message: "...something ended?",
      type: "info",
      corrupted: true,
    });
  }

  return newState;
}
