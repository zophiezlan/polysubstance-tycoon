import { Achievement, GameState } from './types';

export const ACHIEVEMENTS: Achievement[] = [
  // Early Game
  {
    id: 'firstTime',
    name: 'First Time?',
    description: 'Start your first night',
    checkCondition: (state) => state.nightsCompleted >= 0 && state.isNightActive,
  },
  {
    id: 'justACouple',
    name: "It's Just a Couple",
    description: 'Purchase Alcohol LLC 5 times',
    checkCondition: (state) => (state.substances.alcohol || 0) >= 5,
  },
  {
    id: 'canStopWhenever',
    name: 'I Can Stop Whenever',
    description: 'Reach 1000 Vibes',
    checkCondition: (state) => state.vibes >= 1000,
  },
  // Substance Milestones
  {
    id: 'firstNootropic',
    name: 'First Nootropic',
    description: 'Silicon Valley Mindset',
    checkCondition: (state) => (state.substances.nootropic || 0) > 0,
  },
  {
    id: 'deliriantDabbler',
    name: 'Deliriant Dabbler',
    description: 'Shadow People Convention',
    checkCondition: (state) => (state.substances.deliriant || 0) > 0,
  },
  {
    id: 'psychonaut',
    name: 'Psychonaut',
    description: 'Ego Death Speedrun',
    checkCondition: (state) => (state.substances.psychedelic || 0) > 0,
  },
  {
    id: 'syntheticPioneer',
    name: 'Synthetic Pioneer',
    description: 'Designer Problems',
    checkCondition: (state) => (state.substances.synthetic || 0) > 0,
  },
  {
    id: 'researchSubject',
    name: 'Research Subject',
    description: 'DIY Pharmacology',
    checkCondition: (state) => (state.substances.research || 0) > 0,
  },
  {
    id: 'exoticCollector',
    name: 'Exotic Collector',
    description: 'Banned in 47 Countries',
    checkCondition: (state) => (state.substances.exotic || 0) > 0,
  },
  {
    id: 'experimentalSubject',
    name: 'Experimental Subject',
    description: 'Human Trial Complete',
    checkCondition: (state) => (state.substances.experimental || 0) > 0,
  },
  {
    id: 'forbiddenKnowledge',
    name: 'Forbidden Knowledge',
    description: 'Geneva Suggestion Violator',
    checkCondition: (state) => (state.substances.forbidden || 0) > 0,
  },
  {
    id: 'eldritchContact',
    name: 'Eldritch Contact',
    description: 'The Vibes Have Eyes',
    checkCondition: (state) => (state.substances.eldritch || 0) > 0,
  },
  {
    id: 'voidGazer',
    name: 'Void Gazer',
    description: 'Neurons On Strike',
    checkCondition: (state) => (state.substances.void || 0) > 0,
  },

  // Mid Game
  {
    id: 'multitasking',
    name: 'Multitasking',
    description: 'Have 3+ substance types active simultaneously',
    checkCondition: (state) => {
      const activeTypes = Object.keys(state.substances).filter(id => state.substances[id] > 0);
      return activeTypes.length >= 3;
    },
  },
  {
    id: 'confidenceMan',
    name: 'Confidence Man',
    description: 'Hit 90 Confidence',
    checkCondition: (state) => state.confidence >= 90,
  },
  {
    id: 'whoNeedsSleep',
    name: 'Who Needs Sleep',
    description: 'Extend night by 60+ seconds',
    checkCondition: (state) => state.timeRemaining > 3660, // 60:00 + 60
  },
  {
    id: 'falseCalm',
    name: 'False Calm',
    description: 'Have Chaos <20 while Strain >70',
    checkCondition: (state) => state.chaos < 20 && state.strain > 70,
  },

  // Late Game / Cursed
  {
    id: 'everyonesFine',
    name: "Everyone's Fine",
    description: 'Reach 95 Confidence while at Collapse threshold',
    checkCondition: (state) => {
      const collapseThreshold = 100 + (state.energy * 0.5) - (state.hydrationDebt * 0.3);
      return state.confidence >= 95 && state.strain >= collapseThreshold - 5;
    },
  },
  {
    id: 'noNotes',
    name: 'No Notes',
    description: 'Complete night with Memory Integrity <10',
    checkCondition: (state) => !state.isNightActive && state.memoryIntegrity < 10 && !state.hasCollapsed,
  },
  {
    id: 'unbreakable',
    name: 'Unbreakable',
    description: 'Finish with 0 maintenance actions used',
    hidden: true,
    checkCondition: () => false, // Checked separately in game logic
  },
  {
    id: 'mateshipBuff',
    name: 'The Mateship Buff',
    description: 'Use "Check On A Mate" 5 times in one night',
    checkCondition: () => false, // Checked separately in game logic
  },

  // Prestige Meta
  {
    id: 'patternRecognition',
    name: 'Pattern Recognition',
    description: 'Complete 10 nights',
    checkCondition: (state) => state.nightsCompleted >= 10,
  },
  {
    id: 'knowledgeIsCurse',
    name: 'Knowledge Is A Curse',
    description: 'Unlock all hidden meters',
    checkCondition: (state) => state.knowledgeLevel >= 5,
  },
  {
    id: 'upgradeEnthusiast',
    name: 'Upgrade Enthusiast',
    description: 'Own 10 upgrades',
    checkCondition: (state) => state.upgrades.length >= 10,
  },
  {
    id: 'fullyOptimized',
    name: 'Fully Optimized',
    description: 'Own 25 upgrades',
    checkCondition: (state) => state.upgrades.length >= 25,
  },
  {
    id: 'vibesMillionaire',
    name: 'Vibes Millionaire',
    description: 'Earn 1,000,000 total Vibes',
    checkCondition: (state) => state.totalVibesEarned >= 1_000_000,
  },
  {
    id: 'vibesBillionaire',
    name: 'Vibes Billionaire',
    description: 'Earn 1,000,000,000 total Vibes',
    checkCondition: (state) => state.totalVibesEarned >= 1_000_000_000,
  },
  {
    id: 'vibesTrillionaire',
    name: 'Vibes Trillionaire',
    description: 'Earn 1,000,000,000,000 total Vibes',
    checkCondition: (state) => state.totalVibesEarned >= 1_000_000_000_000,
  },
  {
    id: 'harmReductionTycoon',
    name: 'Harm Reduction Tycoon',
    description: 'Complete a night with max Vibes AND no Collapse using only maintenance strategies',
    hidden: true,
    checkCondition: () => false, // Checked separately in game logic
  },
];

export function checkAchievements(state: GameState, previousAchievements: string[]): string[] {
  const newAchievements: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (previousAchievements.includes(achievement.id)) {
      continue;
    }

    // Check condition
    if (achievement.checkCondition(state)) {
      newAchievements.push(achievement.id);
    }
  }

  return newAchievements;
}

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
