import { GameState } from "./types";
import { calculateInteractionMultipliers } from "./interactions";
import { tickCombo } from "./combos";
import { checkGroupChatTriggers } from "./groupChat";
import { checkOrganComplaints } from "./organCommentary";
import {
  aggregateSubstanceMods,
  applyAutoClicker,
  applyPassiveProduction,
  expireTemporaryEvents,
} from "./tickProduction";
import {
  applyChaosUpdate,
  applyConfidenceUpdate,
  applyEnergyUpdate,
  applyHydrationAndSleep,
  applyMemoryUpdate,
  applyStrainUpdate,
  calculateDistortionLevel,
} from "./tickMeters";
import {
  advanceTime,
  checkAndHandleCollapse,
  tickCooldowns,
} from "./tickCycle";

export function gameTick(state: GameState, deltaTime: number): GameState {
  if (!state.isNightActive) return state;

  const newState = { ...state };
  const dt = deltaTime / 1000;

  // Keep lastActiveTime fresh so offline-progress detection on next mount is accurate
  newState.lastActiveTime = Date.now();

  const interactions = calculateInteractionMultipliers(newState.substances);
  const aggregates = aggregateSubstanceMods(newState);

  applyPassiveProduction(newState, dt, aggregates, interactions);
  applyAutoClicker(newState, dt);
  expireTemporaryEvents(newState);

  applyEnergyUpdate(newState, dt, aggregates);
  applyChaosUpdate(newState, dt, aggregates, interactions);
  applyHydrationAndSleep(newState, dt, aggregates, interactions);
  applyStrainUpdate(newState, dt, aggregates, interactions);
  applyMemoryUpdate(newState, dt, aggregates, interactions);
  applyConfidenceUpdate(newState, aggregates);
  newState.distortionLevel = calculateDistortionLevel(newState);

  tickCooldowns(newState, dt);
  tickCombo(newState, dt);
  checkGroupChatTriggers(newState, dt);
  checkOrganComplaints(newState, dt);

  checkAndHandleCollapse(newState);
  advanceTime(newState, dt);

  return newState;
}

// Re-exports for callers that used to import these from tick.ts directly.
export { calculateDistortionLevel } from "./tickMeters";
export { checkCollapse, handleCollapse, handleNightEnd } from "./tickCycle";
