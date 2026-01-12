import { GameState } from './types';
import { calculateComboTimerExtension } from './upgradeEffects';

// COOKIE CLICKER MODE: Combo system rewards active clicking
// Combos expire after 2 seconds of no clicking, encouraging rapid clicking
// Can be extended with upgrades

export const BASE_COMBO_TIMEOUT = 2; // seconds
export const COMBO_MILESTONES = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

export function getComboTimeout(state: GameState): number {
  return BASE_COMBO_TIMEOUT + calculateComboTimerExtension(state);
}

/**
 * Calculate combo multiplier for vibes
 * Scaling: 1x at 0, up to 5x at 500+ combo
 */
export function calculateComboMultiplier(combo: number): number {
  if (combo < 10) return 1;
  if (combo < 50) return 1 + (combo / 100); // 1x to 1.5x
  if (combo < 100) return 1.5 + ((combo - 50) / 50); // 1.5x to 2.5x
  if (combo < 500) return 2.5 + ((combo - 100) / 200); // 2.5x to 4.5x
  return Math.min(5, 4.5 + ((combo - 500) / 500)); // 4.5x to 5x
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
      if (state.comboCount > 10) {
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
  if (combo < 10) return '#ffffff';
  if (combo < 50) return '#ffff00'; // Yellow
  if (combo < 100) return '#ff8800'; // Orange
  if (combo < 500) return '#ff0000'; // Red
  return '#ff00ff'; // Purple
}
