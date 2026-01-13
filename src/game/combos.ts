import { GameState } from './types';
import { calculateComboTimerExtension } from './upgradeEffects';

// COOKIE CLICKER MODE: Combo system rewards active clicking
// Combos expire after 2 seconds of no clicking, encouraging rapid clicking
// Can be extended with upgrades

export const BASE_COMBO_TIMEOUT = 2; // seconds
export const COMBO_MILESTONES = [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

export function getComboTimeout(state: GameState): number {
  return BASE_COMBO_TIMEOUT + calculateComboTimerExtension(state);
}

/**
 * Calculate combo multiplier for vibes
 * Scaling: 1x at 0, up to 2x at 500+ combo (slower progression for 100+ hour gameplay)
 */
export function calculateComboMultiplier(combo: number): number {
  if (combo < 25) return 1;
  if (combo < 100) return 1 + ((combo - 25) / 300); // 1x to 1.25x
  if (combo < 250) return 1.25 + ((combo - 100) / 600); // 1.25x to 1.5x
  if (combo < 500) return 1.5 + ((combo - 250) / 1000); // 1.5x to 1.75x
  return Math.min(2, 1.75 + ((combo - 500) / 2000)); // 1.75x to 2x
}

/**
 * Update combo state on click
 */
export function updateCombo(state: GameState): GameState {
  const now = Date.now();
  const timeSinceLastClick = (now - state.lastClickTime) / 1000;
  const comboTimeout = getComboTimeout(state);

  // Reset combo if timeout expired
  if (timeSinceLastClick > comboTimeout) {
    state.comboCount = 1;
    state.comboTimer = comboTimeout;
  } else {
    // Increment combo
    state.comboCount += 1;
    state.comboTimer = comboTimeout;

    // Track max combo
    if (state.comboCount > state.maxCombo) {
      state.maxCombo = state.comboCount;

      // Check for combo milestones
      if (COMBO_MILESTONES.includes(state.comboCount)) {
        state.log.push({
          timestamp: 3600 - state.timeRemaining,
          message: `🔥 ${state.comboCount}x COMBO! You're on fire!`,
          type: 'achievement',
        });
      }
    }
  }

  state.lastClickTime = now;
  return state;
}

/**
 * Decay combo timer each tick
 */
export function tickCombo(state: GameState, deltaTime: number): GameState {
  if (state.comboTimer > 0) {
    state.comboTimer -= deltaTime;

    // Combo expired
    if (state.comboTimer <= 0) {
      if (state.comboCount > 25) {
        state.log.push({
          timestamp: 3600 - state.timeRemaining,
          message: `Combo ended at ${state.comboCount}x. Not bad.`,
          type: 'info',
        });
      }
      state.comboCount = 0;
      state.comboTimer = 0;
    }
  }

  return state;
}

/**
 * Get combo display color based on multiplier
 */
export function getComboColor(combo: number): string {
  if (combo < 25) return '#ffffff';
  if (combo < 100) return '#ffff00'; // Yellow
  if (combo < 250) return '#ff8800'; // Orange
  if (combo < 500) return '#ff0000'; // Red
  return '#ff00ff'; // Purple
}
