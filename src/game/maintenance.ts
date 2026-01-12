import { MaintenanceAction } from './types';

export const MAINTENANCE_ACTIONS: MaintenanceAction[] = [
  {
    id: 'drinkWater',
    name: 'Drink Water',
    description: 'Boring but effective. You hate how true this is.',
    cost: 0,
    cooldown: 30,
    effects: {
      hydrationRestore: 20,
      energyRestore: 5,
    },
  },
  {
    id: 'eatSomething',
    name: 'Eat Something',
    description: 'Carbs are infrastructure.',
    cost: 5,
    cooldown: 60,
    effects: {
      energyRestore: 15,
      strainReduction: 10,
      timeBonus: 20,
    },
  },
  {
    id: 'takeBreather',
    name: 'Take a Breather',
    description: 'Sometimes less is more. Disgusting, but true.',
    cost: 0,
    cooldown: 90,
    effects: {
      chaosReduction: 20,
      strainReduction: 15,
      memoryRestore: 10,
    },
    pausesProduction: 10,
  },
  {
    id: 'checkOnMate',
    name: 'Check On A Mate',
    description: 'Turns out talking to humans is OP.',
    cost: 0,
    cooldown: 120,
    effects: {
      strainReduction: 30,
      memoryRestore: 20,
      energyRestore: 5,
    },
    requiresSubstance: 'empathogen',
  },
  {
    id: 'testGear',
    name: 'Test Your Gear',
    description: 'Know what you\'re working with. Revolutionary.',
    cost: 20,
    cooldown: 180,
    effects: {},
    unlockCondition: 2,
    // Special: reveals hidden modifiers for 30 seconds (handled in game logic)
  },
  {
    id: 'lieDown',
    name: 'Lie Down For A Bit',
    description: 'Tactical nap. Not giving up. Tactical.',
    cost: 50,
    cooldown: 300,
    effects: {
      strainReduction: 50,
      energyRestore: 30,
      timeBonus: 15,
    },
    unlockCondition: 3,
    pausesProduction: 20,
  },
  {
    id: 'actualSleep',
    name: 'Actually Sleep',
    description: 'Revolutionary concept. Your body keeps suggesting it.',
    cost: 100,
    cooldown: 600,
    effects: {
      energyRestore: 50,
      strainReduction: 40,
      memoryRestore: 30,
      sleepDebtReduction: 50, // COOKIE CLICKER MODE: Make sleep debt recoverable
    },
    unlockCondition: 4,
    pausesProduction: 60,
  },
];

export function getAction(id: string): MaintenanceAction | undefined {
  return MAINTENANCE_ACTIONS.find(a => a.id === id);
}

export function isActionAvailable(
  action: MaintenanceAction,
  knowledgeLevel: number,
  substances: Record<string, number>
): boolean {
  // Check knowledge level requirement
  if (action.unlockCondition && knowledgeLevel < action.unlockCondition) {
    return false;
  }

  // Check substance requirement
  if (action.requiresSubstance && !substances[action.requiresSubstance]) {
    return false;
  }

  return true;
}
