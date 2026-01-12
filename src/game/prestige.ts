import { GameState, KnowledgeLevel } from './types';

export const KNOWLEDGE_LEVELS: KnowledgeLevel[] = [
  {
    level: 0,
    xpRequired: 0,
    name: 'First Night',
    description: 'You know nothing.',
    unlocks: [],
  },
  {
    level: 1,
    xpRequired: 100,
    name: 'Things you\'re starting to notice',
    description: 'Hydration Debt becomes visible',
    unlocks: ['hydrationDebt', 'maintenanceTooltips'],
  },
  {
    level: 2,
    xpRequired: 250,
    name: 'You\'ve seen this before',
    description: 'Sleep Debt visible, Test Your Gear unlocked',
    unlocks: ['sleepDebt', 'testGear', 'basicInteractions'],
  },
  {
    level: 3,
    xpRequired: 500,
    name: 'Recognizing patterns',
    description: 'Strain meter visible, detailed interactions',
    unlocks: ['strain', 'lieDown', 'detailedInteractions'],
  },
  {
    level: 4,
    xpRequired: 1000,
    name: 'Memory is unreliable',
    description: 'Memory Integrity visible, log reliability tracking',
    unlocks: ['memoryIntegrity', 'logReliability', 'achievementTracking'],
  },
  {
    level: 5,
    xpRequired: 2000,
    name: 'You understand The Night. It doesn\'t care.',
    description: 'All systems visible, complete interaction graph',
    unlocks: ['allMeters', 'completeInteractions', 'exactMultipliers'],
  },
];

export function calculateExperience(state: GameState, collapsed: boolean): number {
  // Base XP = Vibes / 100
  let baseXP = state.vibes / 100;

  // Collapse Penalty = -50% XP if collapsed
  if (collapsed) {
    baseXP *= 0.5;
  }

  // Maintenance Bonus = count actions used (tracked separately)
  // This needs to be passed in or tracked

  // Survival Bonus = +25% if completed without collapse
  if (!collapsed && state.timeRemaining <= 0) {
    baseXP *= 1.25;
  }

  // Time Bonus = +1 XP per 10 seconds under starting time (60:00 = 3600)
  if (state.timeRemaining > 0) {
    const timeBonus = Math.floor((3600 - state.timeRemaining) / 10);
    baseXP += timeBonus;
  }

  return Math.floor(baseXP);
}

export function getKnowledgeLevel(totalXP: number): number {
  for (let i = KNOWLEDGE_LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= KNOWLEDGE_LEVELS[i].xpRequired) {
      return KNOWLEDGE_LEVELS[i].level;
    }
  }
  return 0;
}

export function getNextLevelInfo(currentLevel: number): KnowledgeLevel | null {
  const nextLevel = KNOWLEDGE_LEVELS.find(lvl => lvl.level === currentLevel + 1);
  return nextLevel || null;
}

export function hasUnlock(knowledgeLevel: number, unlockId: string): boolean {
  for (let i = 0; i <= knowledgeLevel; i++) {
    const level = KNOWLEDGE_LEVELS[i];
    if (level && level.unlocks.includes(unlockId)) {
      return true;
    }
  }
  return false;
}

// ============================================================================
// PRESTIGE SYSTEM - Cookie Clicker style reset-for-multipliers
// ============================================================================

/**
 * Calculate how many Insight Points you'd earn from prestiging
 * Formula: sqrt(totalVibesEarned / 1000000)
 * This creates exponential growth: need more vibes for each point, but points give big bonuses
 */
export function calculateInsightPoints(totalVibesEarned: number): number {
  return Math.floor(Math.sqrt(totalVibesEarned / 1000000));
}

/**
 * Calculate global production multiplier from Insight Points
 * Each point gives +1% to ALL production (clicks + passive)
 * Formula: 1 + (points * 0.01)
 */
export function calculateInsightMultiplier(insightPoints: number): number {
  return 1 + (insightPoints * 0.01);
}

/**
 * Perform prestige reset
 * Keeps: Insight Points (prestige currency), total stats for next prestige calculation
 * Resets: Current vibes, substances, day counter, all meters, upgrades (optional)
 */
export function performPrestige(state: GameState): GameState {
  const newInsightPoints = calculateInsightPoints(state.totalVibesEarned);

  // Prevent prestiging if you wouldn't gain any points
  if (newInsightPoints <= state.insightPoints) {
    return state; // No prestige happened
  }

  const pointsGained = newInsightPoints - state.insightPoints;

  // Create fresh state but preserve prestige-related stats
  return {
    ...state,
    // PRESTIGE CURRENCY - Keeps accumulating
    insightPoints: newInsightPoints,

    // STATS FOR NEXT PRESTIGE - Keep for calculation
    totalVibesEarned: state.totalVibesEarned,
    totalClicks: state.totalClicks,

    // RESET CURRENT RUN
    vibes: 0,
    substances: {},
    energy: 100,
    strain: 0,
    hydrationDebt: 0,
    sleepDebt: 0,
    chaos: 50,
    memoryIntegrity: 100,
    confidence: 0,
    timeRemaining: 3600,
    daysCompleted: 0,
    nightsCompleted: 0,
    hasCollapsed: false,
    actionCooldowns: {},

    // KEEP KNOWLEDGE/ACHIEVEMENTS - Player progression
    experience: state.experience,
    knowledgeLevel: state.knowledgeLevel,
    achievements: state.achievements,

    // KEEP UPGRADES - Optional: you could reset these too for harder prestige
    // For now keeping them as Cookie Clicker does
    upgrades: state.upgrades,

    log: [
      ...state.log,
      {
        timestamp: 0,
        message: `✨ PRESTIGE: Gained ${pointsGained} Insight Points! (Total: ${newInsightPoints}) All production +${(pointsGained * 1)}%`,
        type: 'info',
      },
    ],
    distortionLevel: 0,
    nightStartTime: Date.now(),
  };
}

/**
 * Check if prestige is available (would gain at least 1 point)
 */
export function canPrestige(state: GameState): boolean {
  const potentialPoints = calculateInsightPoints(state.totalVibesEarned);
  return potentialPoints > state.insightPoints;
}

/**
 * Get prestige info for UI display
 */
export function getPrestigeInfo(state: GameState): {
  currentPoints: number;
  potentialPoints: number;
  pointsToGain: number;
  currentMultiplier: number;
  nextMultiplier: number;
  vibesNeededForNext: number;
} {
  const currentPoints = state.insightPoints;
  const potentialPoints = calculateInsightPoints(state.totalVibesEarned);
  const pointsToGain = Math.max(0, potentialPoints - currentPoints);

  const currentMultiplier = calculateInsightMultiplier(currentPoints);
  const nextMultiplier = calculateInsightMultiplier(potentialPoints);

  // Calculate vibes needed for next insight point
  const nextPointRequirement = Math.pow(potentialPoints + 1, 2) * 1000000;
  const vibesNeededForNext = Math.max(0, nextPointRequirement - state.totalVibesEarned);

  return {
    currentPoints,
    potentialPoints,
    pointsToGain,
    currentMultiplier,
    nextMultiplier,
    vibesNeededForNext,
  };
}
