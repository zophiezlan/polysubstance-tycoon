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

  // ===== CLICKING ACHIEVEMENTS (Cookie Clicker-inspired) =====
  {
    id: 'clickNovice',
    name: 'Click Novice',
    description: 'Click 100 times',
    checkCondition: (state) => state.totalClicks >= 100,
  },
  {
    id: 'clickJourneyman',
    name: 'Click Journeyman',
    description: 'Click 1,000 times',
    checkCondition: (state) => state.totalClicks >= 1_000,
  },
  {
    id: 'clickMaster',
    name: 'Click Master',
    description: 'Click 10,000 times',
    checkCondition: (state) => state.totalClicks >= 10_000,
  },
  {
    id: 'clickGrandmaster',
    name: 'Click Grandmaster',
    description: 'Click 100,000 times',
    checkCondition: (state) => state.totalClicks >= 100_000,
  },
  {
    id: 'clickAscended',
    name: 'Click Ascended',
    description: 'Click 1,000,000 times. Your fingers are beyond mortal comprehension.',
    checkCondition: (state) => state.totalClicks >= 1_000_000,
  },
  {
    id: 'comboStarter',
    name: 'Combo Starter',
    description: 'Reach a 25x combo',
    checkCondition: (state) => state.maxCombo >= 25,
  },
  {
    id: 'comboExpert',
    name: 'Combo Expert',
    description: 'Reach a 100x combo',
    checkCondition: (state) => state.maxCombo >= 100,
  },
  {
    id: 'comboLegend',
    name: 'Combo Legend',
    description: 'Reach a 500x combo. The rhythm consumes you.',
    checkCondition: (state) => state.maxCombo >= 500,
  },
  {
    id: 'clickPower',
    name: 'Raw Power',
    description: 'Gain 1000+ vibes from a single click',
    checkCondition: () => false, // Checked separately when clicking
  },

  // ===== RANDOM EVENT ACHIEVEMENTS =====
  {
    id: 'luckyClick',
    name: 'Lucky Click',
    description: 'Click your first random event',
    checkCondition: () => false, // Checked when activating events
  },
  {
    id: 'eventCollector',
    name: 'Event Collector',
    description: 'Click 10 random events',
    checkCondition: () => false, // Tracked in event manager
  },
  {
    id: 'eventExpert',
    name: 'Event Expert',
    description: 'Click 50 random events',
    checkCondition: () => false, // Tracked in event manager
  },
  {
    id: 'eventMaster',
    name: 'Event Master',
    description: 'Click 100 random events',
    checkCondition: () => false, // Tracked in event manager
  },
  {
    id: 'legendaryLuck',
    name: 'Legendary Luck',
    description: 'Click a legendary random event',
    checkCondition: () => false, // Checked when activating legendary event
  },
  {
    id: 'fastHands',
    name: 'Fast Hands',
    description: 'Click a random event with less than 2 seconds remaining',
    checkCondition: () => false, // Checked during event activation
  },

  // ===== SYNERGY ACHIEVEMENTS =====
  {
    id: 'firstSynergy',
    name: 'First Synergy',
    description: 'Activate your first synergy bonus',
    checkCondition: (state) => {
      // Check if player has any synergy upgrade
      return state.upgrades.some(id => ['cocktail-theory', 'speedball-dynamics', 'candy-flip-protocol', 'jedi-flip-mastery'].includes(id));
    },
  },
  {
    id: 'synergyCollector',
    name: 'Synergy Collector',
    description: 'Own all basic synergy upgrades (Cocktail, Speedball, Candy Flip)',
    checkCondition: (state) => {
      return state.upgrades.includes('cocktail-theory') &&
             state.upgrades.includes('speedball-dynamics') &&
             state.upgrades.includes('candy-flip-protocol');
    },
  },
  {
    id: 'synergyMaster',
    name: 'Synergy Master',
    description: 'Own all synergy upgrades including Jedi Flip',
    checkCondition: (state) => {
      return state.upgrades.includes('cocktail-theory') &&
             state.upgrades.includes('speedball-dynamics') &&
             state.upgrades.includes('candy-flip-protocol') &&
             state.upgrades.includes('jedi-flip-mastery');
    },
  },
  {
    id: 'polypharmacy',
    name: 'Polypharmacy',
    description: 'Have 5+ substance types active with at least one synergy bonus',
    checkCondition: (state) => {
      const activeTypes = Object.keys(state.substances).filter(id => state.substances[id] > 0);
      const hasSynergy = state.upgrades.some(id => ['cocktail-theory', 'speedball-dynamics', 'candy-flip-protocol', 'jedi-flip-mastery'].includes(id));
      return activeTypes.length >= 5 && hasSynergy;
    },
  },

  // ===== PRODUCTION ACHIEVEMENTS =====
  {
    id: 'passiveIncome',
    name: 'Passive Income',
    description: 'Reach 10 vibes per second',
    checkCondition: () => false, // Checked separately with vibesPerSecond calculation
  },
  {
    id: 'vibeFactory',
    name: 'Vibe Factory',
    description: 'Reach 100 vibes per second',
    checkCondition: () => false, // Checked separately
  },
  {
    id: 'vibeEmpire',
    name: 'Vibe Empire',
    description: 'Reach 1,000 vibes per second',
    checkCondition: () => false, // Checked separately
  },
  {
    id: 'vibeGod',
    name: 'Vibe God',
    description: 'Reach 10,000 vibes per second. Reality bends to your will.',
    checkCondition: () => false, // Checked separately
  },

  // ===== AUTOMATION ACHIEVEMENTS =====
  {
    id: 'firstBot',
    name: 'First Bot',
    description: 'Purchase your first auto-clicker',
    checkCondition: (state) => state.autoClickerLevel >= 1,
  },
  {
    id: 'fullyAutomated',
    name: 'Fully Automated',
    description: 'Reach max auto-clicker tier',
    checkCondition: (state) => state.autoClickerLevel >= 4,
  },
  {
    id: 'idleTycoon',
    name: 'Idle Tycoon',
    description: 'Earn 100,000 vibes without clicking (auto-clicker + passive only)',
    checkCondition: () => false, // Tracked separately
  },

  // ===== SPEED/CHALLENGE ACHIEVEMENTS =====
  {
    id: 'speedRunner',
    name: 'Speed Runner',
    description: 'Reach 10,000 vibes in under 5 minutes',
    checkCondition: () => false, // Checked with timestamp tracking
  },
  {
    id: 'marathoner',
    name: 'Marathoner',
    description: 'Extend night beyond 90 minutes',
    checkCondition: (state) => state.timeRemaining > 3600 + (30 * 60), // 1h + 30min
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Complete night with only 2 substance types',
    checkCondition: () => false, // Checked at night end
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Own at least one of every substance type in a single night',
    checkCondition: (state) => {
      const substanceTypes = ['alcohol', 'stimulant', 'sedative', 'empathogen', 'psychedelic',
                              'dissociative', 'deliriant', 'nootropic', 'synthetic', 'research',
                              'exotic', 'experimental', 'forbidden', 'eldritch', 'void'];
      return substanceTypes.every(id => (state.substances[id] || 0) > 0);
    },
  },

  // ===== UPGRADE MASTERY =====
  {
    id: 'upgradeDedication',
    name: 'Upgrade Dedication',
    description: 'Own 50 upgrades',
    checkCondition: (state) => state.upgrades.length >= 50,
  },
  {
    id: 'upgradePerfection',
    name: 'Upgrade Perfection',
    description: 'Own all available upgrades (100+)',
    checkCondition: (state) => state.upgrades.length >= 100,
  },
  {
    id: 'harmReductionExpert',
    name: 'Harm Reduction Expert',
    description: 'Own all harm reduction upgrades',
    checkCondition: (state) => {
      return state.upgrades.includes('test-kit-pro') &&
             state.upgrades.includes('supplements') &&
             state.upgrades.includes('medical-supervision');
    },
  },

  // ===== META/PRESTIGE ACHIEVEMENTS =====
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Complete 25 nights',
    checkCondition: (state) => state.nightsCompleted >= 25,
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Complete 50 nights',
    checkCondition: (state) => state.nightsCompleted >= 50,
  },
  {
    id: 'master',
    name: 'Master',
    description: 'Complete 100 nights. You know this game too well.',
    checkCondition: (state) => state.nightsCompleted >= 100,
  },
  {
    id: 'insightful',
    name: 'Insightful',
    description: 'Earn your first insight point',
    checkCondition: (state) => state.insightPoints >= 1,
  },
  {
    id: 'enlightened',
    name: 'Enlightened',
    description: 'Accumulate 10 insight points',
    checkCondition: (state) => state.insightPoints >= 10,
  },
  {
    id: 'transcendent',
    name: 'Transcendent',
    description: 'Accumulate 100 insight points. You\'ve seen it all.',
    checkCondition: (state) => state.insightPoints >= 100,
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
