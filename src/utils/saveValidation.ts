// Save data versioning and validation utilities

import { GameState } from "../game/types";
import { createInitialState } from "../game/state";

export const CURRENT_SAVE_VERSION = 2;

export interface SaveData {
  version: number;
  timestamp: number;
  state: GameState;
}

// Fields from systems that were cut in v2 (energy modes, chaos strategies,
// build manager, strategic upgrades, milestones, permanent unlocks).
// Stripped silently during migration.
const ORPHAN_FIELDS = [
  "autoClickerLevel",
  "autoClickerActive",
  "activeEnergyMode",
  "unlockedEnergyModes",
  "energyBoosterCooldowns",
  "energyHarvestAccumulator",
  "activeChaosStrategy",
  "unlockedChaosStrategies",
  "chaosActionCooldowns",
  "chaosActionCharges",
  "completedMilestones",
  "lastMilestoneVibes",
  "lastMilestoneClicks",
  "activeBonuses",
  "savedBuilds",
  "activeBuildIndex",
  "buildSwapCooldown",
  "maxBuildSlots",
  "activeSpecialization",
  "prestigeTier",
  "canRespecialization",
  "permanentUnlocks",
  "statistics",
];

function stripOrphanFields(state: Record<string, unknown>): Record<string, unknown> {
  const cleaned = { ...state };
  for (const field of ORPHAN_FIELDS) {
    delete cleaned[field];
  }
  return cleaned;
}

/**
 * Validates that loaded save data has the shape we expect. Returns true for
 * any supported version (legacy, v1, v2) — migration fills in missing fields.
 */
export function validateSaveData(data: any): data is SaveData {
  if (!data || typeof data !== "object") {
    return false;
  }

  if (typeof data.version !== "number") {
    // Legacy format: state fields live directly on the root object.
    return typeof data.vibes === "number";
  }

  // v1 and v2 share the same wrapper shape; the migration step reconciles fields.
  return (
    typeof data.timestamp === "number" &&
    data.state &&
    typeof data.state.vibes === "number" &&
    typeof data.state.energy === "number"
  );
}

/**
 * Migrates save data from older versions to current version. Unknown fields
 * from cut systems are silently dropped.
 */
export function migrateSaveData(data: any): GameState {
  const rawState =
    typeof data?.version === "number" ? data.state : data;
  const stripped = stripOrphanFields(rawState ?? {});
  const initialState = createInitialState();

  return {
    ...initialState,
    ...stripped,
    substances: stripped.substances || {},
    upgrades: stripped.upgrades || [],
    achievements: stripped.achievements || [],
    actionCooldowns: stripped.actionCooldowns || {},
    log: stripped.log || initialState.log,
    unlockedFeatures: stripped.unlockedFeatures || [],
    groupChatMessages: stripped.groupChatMessages || [],
    organComplaints: stripped.organComplaints || [],
    ritualProgress: stripped.ritualProgress || {},
    // New fields added in v2 — default for any save that predates them.
    autoClickerAccumulator:
      typeof stripped.autoClickerAccumulator === "number"
        ? stripped.autoClickerAccumulator
        : 0,
    lastActiveTime:
      typeof stripped.lastActiveTime === "number"
        ? stripped.lastActiveTime
        : Date.now(),
    offlineProgressPending:
      stripped.offlineProgressPending ?? null,
    // Reset runtime timestamps — tick.ts will manage these going forward.
    lastTickTime: Date.now(),
    nightStartTime: Date.now(),
    lastClickTime: Date.now(),
  } as GameState;
}

/**
 * Wraps GameState in versioned save format
 */
export function createSaveData(state: GameState): SaveData {
  return {
    version: CURRENT_SAVE_VERSION,
    timestamp: Date.now(),
    state,
  };
}

/**
 * Sanitizes potentially corrupted state values
 */
export function sanitizeGameState(state: GameState): GameState {
  return {
    ...state,
    // Clamp numeric values to valid ranges
    vibes: Math.max(0, isFinite(state.vibes) ? state.vibes : 0),
    energy: Math.max(
      0,
      Math.min(100, isFinite(state.energy) ? state.energy : 100),
    ),
    chaos: Math.max(0, Math.min(100, isFinite(state.chaos) ? state.chaos : 30)),
    confidence: Math.max(
      0,
      Math.min(100, isFinite(state.confidence) ? state.confidence : 0),
    ),
    timeRemaining: Math.max(
      0,
      isFinite(state.timeRemaining) ? state.timeRemaining : 3600,
    ),
    strain: Math.max(0, isFinite(state.strain) ? state.strain : 0),
    hydrationDebt: Math.max(
      0,
      isFinite(state.hydrationDebt) ? state.hydrationDebt : 0,
    ),
    sleepDebt: Math.max(0, isFinite(state.sleepDebt) ? state.sleepDebt : 0),
    memoryIntegrity: Math.max(
      0,
      Math.min(
        100,
        isFinite(state.memoryIntegrity) ? state.memoryIntegrity : 100,
      ),
    ),
    // Ensure arrays are arrays
    upgrades: Array.isArray(state.upgrades) ? state.upgrades : [],
    achievements: Array.isArray(state.achievements) ? state.achievements : [],
    unlockedFeatures: Array.isArray(state.unlockedFeatures)
      ? state.unlockedFeatures
      : [],
    groupChatMessages: Array.isArray(state.groupChatMessages)
      ? state.groupChatMessages
      : [],
    organComplaints: Array.isArray(state.organComplaints)
      ? state.organComplaints
      : [],
    log: Array.isArray(state.log) ? state.log : [],
    // Ensure objects are objects
    substances:
      typeof state.substances === "object" && state.substances
        ? state.substances
        : {},
    actionCooldowns:
      typeof state.actionCooldowns === "object" && state.actionCooldowns
        ? state.actionCooldowns
        : {},
    ritualProgress:
      typeof state.ritualProgress === "object" && state.ritualProgress
        ? state.ritualProgress
        : {},
  };
}
