import { GameState } from "./types";
import { getSubstance } from "./substances";
import { calculateProductionMultiplier } from "./upgradeEffects";
import { calculateInteractionMultipliers } from "./interactions";

const MAX_OFFLINE_SECONDS = 4 * 60 * 60; // 4 hours
const MIN_OFFLINE_SECONDS = 5 * 60; // Ignore gaps shorter than 5 minutes
const OFFLINE_EFFICIENCY = 0.5;

function calculatePassiveVibesPerSecond(state: GameState): number {
  let vibesPerSec = 0;
  for (const [substanceId, count] of Object.entries(state.substances)) {
    if (!count) continue;
    const substance = getSubstance(substanceId);
    if (!substance) continue;
    const multiplier = calculateProductionMultiplier(state, substanceId);
    vibesPerSec += substance.baseVibes * count * multiplier;
  }
  const interactions = calculateInteractionMultipliers(state.substances);
  return vibesPerSec * interactions.vibesMultiplier;
}

/**
 * If the player was away long enough, populate `offlineProgressPending` with
 * the vibes they would have earned. Caller shows a modal and calls
 * {@link claimOfflineProgress} when acknowledged.
 */
export function checkOfflineProgress(state: GameState): GameState {
  if (state.offlineProgressPending) return state;
  const now = Date.now();
  const elapsed = Math.max(0, (now - state.lastActiveTime) / 1000);
  if (elapsed < MIN_OFFLINE_SECONDS) return state;

  const effectiveTime = Math.min(elapsed, MAX_OFFLINE_SECONDS);
  const vibesPerSec = calculatePassiveVibesPerSecond(state);
  const vibesGained = vibesPerSec * effectiveTime * OFFLINE_EFFICIENCY;
  if (vibesGained <= 0) return state;

  return {
    ...state,
    offlineProgressPending: {
      vibesGained,
      timeAway: effectiveTime,
      claimed: false,
    },
  };
}

export function claimOfflineProgress(state: GameState): GameState {
  if (!state.offlineProgressPending || state.offlineProgressPending.claimed) {
    return state;
  }
  const { vibesGained } = state.offlineProgressPending;
  return {
    ...state,
    vibes: state.vibes + vibesGained,
    totalVibesEarned: state.totalVibesEarned + vibesGained,
    offlineProgressPending: null,
    log: [
      ...state.log,
      {
        timestamp: 3600 - state.timeRemaining,
        message: `💤 Welcome back! Earned ${Math.floor(vibesGained).toLocaleString()} vibes while away`,
        type: "achievement",
      },
    ],
  };
}
