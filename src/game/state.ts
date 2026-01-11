import { GameState } from './types';

export function createInitialState(): GameState {
  return {
    // Core resources
    vibes: 0,
    energy: 100,
    chaos: 30,
    confidence: 0,
    timeRemaining: 3600, // 60:00

    // Hidden meters
    strain: 0,
    hydrationDebt: 0,
    sleepDebt: 0,
    memoryIntegrity: 100,

    // Ownership
    substances: {},

    // Meta progression
    experience: 0,
    knowledgeLevel: 0,
    nightsCompleted: 0,
    achievements: [],

    // Runtime flags
    actionCooldowns: {},
    nightStartTime: Date.now(),
    lastTickTime: Date.now(),
    isNightActive: true,
    hasCollapsed: false,

    // UI state
    distortionLevel: 0,
    log: [
      {
        timestamp: 0,
        message: 'Night started. Time to optimise.',
        type: 'info',
      },
    ],
    showSettings: false,
    hasSeenDisclaimer: false,

    // Settings
    disableDistortion: false,
    reducedMotion: false,
    fontSize: 'default',
  };
}

export function startNewNight(persistentState: Partial<GameState>): GameState {
  const newState = createInitialState();

  // Preserve persistent data
  newState.experience = persistentState.experience || 0;
  newState.knowledgeLevel = persistentState.knowledgeLevel || 0;
  newState.nightsCompleted = persistentState.nightsCompleted || 0;
  newState.achievements = persistentState.achievements || [];
  newState.hasSeenDisclaimer = persistentState.hasSeenDisclaimer || false;
  newState.disableDistortion = persistentState.disableDistortion || false;
  newState.reducedMotion = persistentState.reducedMotion || false;
  newState.fontSize = persistentState.fontSize || 'default';

  // Apply sleep debt penalty from previous night
  if (persistentState.sleepDebt && persistentState.sleepDebt > 0) {
    newState.sleepDebt = persistentState.sleepDebt;
    newState.energy = Math.max(20, 100 - persistentState.sleepDebt * 0.5);
  }

  return newState;
}
