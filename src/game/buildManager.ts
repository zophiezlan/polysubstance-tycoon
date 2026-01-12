// Build/Loadout Management System - Save and swap substance configurations

import { GameState } from './types';
import { ExtendedGameState, SavedBuild } from './progressionTypes';
import { hasInstantBuildSwap } from './permanentUnlocks';

// ============================================================================
// BUILD MANAGEMENT FUNCTIONS
// ============================================================================

export function canSaveBuild(state: ExtendedGameState): boolean {
  return state.savedBuilds.length < state.maxBuildSlots;
}

export function saveBuild(
  state: ExtendedGameState,
  name: string,
  notes?: string
): SavedBuild | null {
  if (!canSaveBuild(state)) {
    return null;
  }

  const build: SavedBuild = {
    id: `build_${Date.now()}`,
    name,
    timestamp: Date.now(),
    substances: { ...state.substances },
    energyMode: state.activeEnergyMode,
    chaosStrategy: state.activeChaosStrategy,
    notes,
  };

  state.savedBuilds.push(build);

  state.log.push({
    timestamp: state.timeRemaining,
    message: `💾 Build saved: ${name}`,
    type: 'info',
  });

  return build;
}

export function deleteBuild(state: ExtendedGameState, buildId: string): boolean {
  const index = state.savedBuilds.findIndex((b) => b.id === buildId);
  if (index === -1) return false;

  // If this was the active build, deactivate it
  if (state.activeBuildIndex === index) {
    state.activeBuildIndex = -1;
  } else if (state.activeBuildIndex > index) {
    // Adjust active index if it's after the deleted build
    state.activeBuildIndex -= 1;
  }

  state.savedBuilds.splice(index, 1);

  return true;
}

export function updateBuildName(
  state: ExtendedGameState,
  buildId: string,
  newName: string
): boolean {
  const build = state.savedBuilds.find((b) => b.id === buildId);
  if (!build) return false;

  build.name = newName;
  return true;
}

export function updateBuildNotes(
  state: ExtendedGameState,
  buildId: string,
  newNotes: string
): boolean {
  const build = state.savedBuilds.find((b) => b.id === buildId);
  if (!build) return false;

  build.notes = newNotes;
  return true;
}

export function canSwapToBuild(state: ExtendedGameState, buildIndex: number): boolean {
  // Check if build exists
  if (buildIndex < 0 || buildIndex >= state.savedBuilds.length) {
    return false;
  }

  // Check if already active
  if (state.activeBuildIndex === buildIndex) {
    return false;
  }

  // Check cooldown (unless instant swap is unlocked)
  if (!hasInstantBuildSwap(state) && state.buildSwapCooldown > 0) {
    return false;
  }

  return true;
}

export function swapToBuild(state: ExtendedGameState, buildIndex: number): boolean {
  if (!canSwapToBuild(state, buildIndex)) return false;

  const build = state.savedBuilds[buildIndex];
  if (!build) return false;

  // Calculate cost of substance changes (you must have enough vibes to "purchase" the difference)
  const costToSwap = calculateBuildSwapCost(state, build);
  if (state.vibes < costToSwap) {
    state.log.push({
      timestamp: state.timeRemaining,
      message: `❌ Not enough vibes to swap build! Need ${Math.floor(costToSwap).toLocaleString()}`,
      type: 'warning',
    });
    return false;
  }

  // Deduct cost
  state.vibes -= costToSwap;

  // Apply build
  state.substances = { ...build.substances };
  state.activeEnergyMode = build.energyMode;
  state.activeChaosStrategy = build.chaosStrategy;
  state.activeBuildIndex = buildIndex;

  // Set cooldown (30 seconds, unless instant swap)
  if (!hasInstantBuildSwap(state)) {
    state.buildSwapCooldown = 30;
  }

  state.log.push({
    timestamp: state.timeRemaining,
    message: `🔄 Swapped to build: ${build.name}`,
    type: 'info',
  });

  return true;
}

export function overwriteBuild(
  state: ExtendedGameState,
  buildIndex: number,
  name?: string
): boolean {
  if (buildIndex < 0 || buildIndex >= state.savedBuilds.length) {
    return false;
  }

  const build = state.savedBuilds[buildIndex];

  // Update build with current state
  build.substances = { ...state.substances };
  build.energyMode = state.activeEnergyMode;
  build.chaosStrategy = state.activeChaosStrategy;
  build.timestamp = Date.now();

  if (name) {
    build.name = name;
  }

  state.log.push({
    timestamp: state.timeRemaining,
    message: `💾 Build updated: ${build.name}`,
    type: 'info',
  });

  return true;
}

export function deactivateBuild(state: ExtendedGameState): void {
  state.activeBuildIndex = -1;
}

export function getBuildInfo(state: ExtendedGameState, buildIndex: number): SavedBuild | null {
  if (buildIndex < 0 || buildIndex >= state.savedBuilds.length) {
    return null;
  }
  return state.savedBuilds[buildIndex];
}

export function getActiveBuild(state: ExtendedGameState): SavedBuild | null {
  if (state.activeBuildIndex === -1) return null;
  return getBuildInfo(state, state.activeBuildIndex);
}

// ============================================================================
// BUILD COMPARISON AND ANALYSIS
// ============================================================================

export function calculateBuildSwapCost(state: GameState, build: SavedBuild): number {
  // Calculate the cost to acquire substances we don't have
  // This is a simplified calculation - in reality you'd need to import substance costs
  // For now, assume average cost of 10 vibes per substance unit

  let totalCost = 0;

  for (const [substanceId, targetCount] of Object.entries(build.substances)) {
    const currentCount = state.substances[substanceId] || 0;

    if (targetCount > currentCount) {
      const diff = targetCount - currentCount;
      // Rough estimate: 10 vibes per unit (should use actual cost calculation)
      totalCost += diff * 10;
    }
    // If we have more than needed, no cost (we keep the extras)
  }

  return totalCost;
}

export function compareBuildToCurrentState(
  state: GameState,
  build: SavedBuild
): {
  substanceDifferences: Array<{
    substanceId: string;
    current: number;
    target: number;
    diff: number;
  }>;
  energyModeChanged: boolean;
  chaosStrategyChanged: boolean;
} {
  const substanceDifferences: Array<{
    substanceId: string;
    current: number;
    target: number;
    diff: number;
  }> = [];

  // Get all unique substance IDs
  const allSubstances = new Set([
    ...Object.keys(state.substances),
    ...Object.keys(build.substances),
  ]);

  for (const substanceId of allSubstances) {
    const current = state.substances[substanceId] || 0;
    const target = build.substances[substanceId] || 0;
    const diff = target - current;

    if (diff !== 0) {
      substanceDifferences.push({
        substanceId,
        current,
        target,
        diff,
      });
    }
  }

  const extendedState = state as ExtendedGameState;
  const energyModeChanged = build.energyMode !== extendedState.activeEnergyMode;
  const chaosStrategyChanged = build.chaosStrategy !== extendedState.activeChaosStrategy;

  return {
    substanceDifferences,
    energyModeChanged,
    chaosStrategyChanged,
  };
}

export function exportBuild(build: SavedBuild): string {
  // Export build as JSON string for sharing
  return JSON.stringify(build, null, 2);
}

export function importBuild(state: ExtendedGameState, buildJson: string): SavedBuild | null {
  try {
    const build = JSON.parse(buildJson) as SavedBuild;

    // Validate build structure
    if (!build.id || !build.name || !build.substances) {
      return null;
    }

    // Check if we have space
    if (!canSaveBuild(state)) {
      return null;
    }

    // Generate new ID and timestamp
    build.id = `build_${Date.now()}`;
    build.timestamp = Date.now();

    state.savedBuilds.push(build);

    state.log.push({
      timestamp: state.timeRemaining,
      message: `📥 Build imported: ${build.name}`,
      type: 'info',
    });

    return build;
  } catch (error) {
    return null;
  }
}

// ============================================================================
// BUILD PRESETS - Starter builds for common strategies
// ============================================================================

export const STARTER_BUILDS: SavedBuild[] = [
  {
    id: 'preset_balanced',
    name: '⚖️ Balanced Starter',
    timestamp: 0,
    substances: {
      stimulant: 5,
      sedative: 3,
      empathogen: 2,
    },
    energyMode: 'balanced',
    chaosStrategy: 'none',
    notes: 'A balanced approach for beginners. Steady production with manageable risks.',
  },
  {
    id: 'preset_active_clicker',
    name: '👆 Active Clicker',
    timestamp: 0,
    substances: {
      stimulant: 10,
      research: 5,
    },
    energyMode: 'overdrive',
    chaosStrategy: 'amplifier',
    notes: 'Maximize click power for active play. High chaos, high reward!',
  },
  {
    id: 'preset_idle',
    name: '💤 Idle Production',
    timestamp: 0,
    substances: {
      sedative: 8,
      empathogen: 5,
      alcohol: 3,
    },
    energyMode: 'conservation',
    chaosStrategy: 'stabilizer',
    notes: 'Optimized for passive income. Set it and forget it!',
  },
  {
    id: 'preset_risky',
    name: '🎲 High Risk High Reward',
    timestamp: 0,
    substances: {
      stimulant: 15,
      deliriant: 10,
      research: 8,
    },
    energyMode: 'overdrive',
    chaosStrategy: 'riskyBusiness',
    notes: 'Live on the edge! Maximum production at maximum risk. Not for beginners!',
  },
];

export function loadStarterBuild(
  state: ExtendedGameState,
  presetId: string
): SavedBuild | null {
  const preset = STARTER_BUILDS.find((b) => b.id === presetId);
  if (!preset) return null;

  // Check if we have space
  if (!canSaveBuild(state)) {
    return null;
  }

  // Create a copy with new ID
  const build: SavedBuild = {
    ...preset,
    id: `build_${Date.now()}`,
    timestamp: Date.now(),
  };

  state.savedBuilds.push(build);

  state.log.push({
    timestamp: state.timeRemaining,
    message: `📦 Starter build loaded: ${build.name}`,
    type: 'info',
  });

  return build;
}
