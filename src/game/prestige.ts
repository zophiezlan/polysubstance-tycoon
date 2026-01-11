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
