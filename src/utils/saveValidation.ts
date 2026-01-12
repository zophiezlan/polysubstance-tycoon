// Save data versioning and validation utilities

import { GameState } from '../game/types';
import { createInitialState } from '../game/state';

export const CURRENT_SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  timestamp: number;
  state: GameState;
}

/**
 * Validates that loaded save data has all required fields
 */
export function validateSaveData(data: any): data is SaveData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check for version field
  if (typeof data.version !== 'number') {
    console.warn('Save data missing version field, assuming legacy save');
    return typeof data.vibes === 'number'; // Legacy format check
  }

  // Version-specific validation
  if (data.version === 1) {
    return (
      typeof data.timestamp === 'number' &&
      data.state &&
      typeof data.state.vibes === 'number' &&
      typeof data.state.energy === 'number'
    );
  }

  return false;
}

/**
 * Migrates save data from older versions to current version
 */
export function migrateSaveData(data: any): GameState {
  // Legacy format (no version field) - treat as version 0
  if (!data.version) {
    console.log('Migrating legacy save data to version 1');
    return migrateLegacyToV1(data);
  }

  // Future migrations would go here
  // if (data.version === 1) return migrateV1ToV2(data.state);

  return data.state;
}

/**
 * Migrate legacy save format (direct GameState) to version 1
 */
function migrateLegacyToV1(legacyData: any): GameState {
  const initialState = createInitialState();

  // Merge legacy data with initial state, preserving new fields
  return {
    ...initialState,
    ...legacyData,
    // Ensure critical arrays exist
    substances: legacyData.substances || {},
    upgrades: legacyData.upgrades || [],
    achievements: legacyData.achievements || [],
    actionCooldowns: legacyData.actionCooldowns || {},
    log: legacyData.log || initialState.log,
    unlockedFeatures: legacyData.unlockedFeatures || [],
    groupChatMessages: legacyData.groupChatMessages || [],
    organComplaints: legacyData.organComplaints || [],
    ritualProgress: legacyData.ritualProgress || {},
    // Reset timestamps to current time
    lastTickTime: Date.now(),
    nightStartTime: Date.now(),
    lastClickTime: Date.now(),
  };
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
    energy: Math.max(0, Math.min(100, isFinite(state.energy) ? state.energy : 100)),
    chaos: Math.max(0, Math.min(100, isFinite(state.chaos) ? state.chaos : 30)),
    confidence: Math.max(0, Math.min(100, isFinite(state.confidence) ? state.confidence : 0)),
    timeRemaining: Math.max(0, isFinite(state.timeRemaining) ? state.timeRemaining : 3600),
    strain: Math.max(0, isFinite(state.strain) ? state.strain : 0),
    hydrationDebt: Math.max(0, isFinite(state.hydrationDebt) ? state.hydrationDebt : 0),
    sleepDebt: Math.max(0, isFinite(state.sleepDebt) ? state.sleepDebt : 0),
    memoryIntegrity: Math.max(0, Math.min(100, isFinite(state.memoryIntegrity) ? state.memoryIntegrity : 100)),
    // Ensure arrays are arrays
    upgrades: Array.isArray(state.upgrades) ? state.upgrades : [],
    achievements: Array.isArray(state.achievements) ? state.achievements : [],
    unlockedFeatures: Array.isArray(state.unlockedFeatures) ? state.unlockedFeatures : [],
    groupChatMessages: Array.isArray(state.groupChatMessages) ? state.groupChatMessages : [],
    organComplaints: Array.isArray(state.organComplaints) ? state.organComplaints : [],
    log: Array.isArray(state.log) ? state.log : [],
    // Ensure objects are objects
    substances: typeof state.substances === 'object' && state.substances ? state.substances : {},
    actionCooldowns: typeof state.actionCooldowns === 'object' && state.actionCooldowns ? state.actionCooldowns : {},
    ritualProgress: typeof state.ritualProgress === 'object' && state.ritualProgress ? state.ritualProgress : {},
  };
}
