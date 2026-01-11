import { Upgrade } from './types';

export const UPGRADES: Upgrade[] = [
  // Global Click Upgrades
  {
    id: 'better-technique',
    name: 'Better Technique',
    description: 'Learning to run the night more efficiently. +5 vibes per click.',
    cost: 100,
    tier: 1,
    effects: {
      clickPower: 5,
    },
  },
  {
    id: 'practiced-hands',
    name: 'Practiced Hands',
    description: 'Muscle memory. Click power x2.',
    cost: 1000,
    tier: 2,
    effects: {
      clickMultiplier: 2,
    },
    requirement: {
      upgradeOwned: 'better-technique',
    },
  },
  {
    id: 'efficient-energy',
    name: 'Efficient Energy Use',
    description: 'Pacing yourself. Clicks cost 50% less energy.',
    cost: 2500,
    tier: 2,
    effects: {
      energyCostReduction: 0.5,
    },
  },
  {
    id: 'controlled-chaos',
    name: 'Controlled Chaos',
    description: 'Chaos generation reduced by 30%.',
    cost: 5000,
    tier: 3,
    effects: {
      chaosDampening: 0.3,
    },
  },

  // Alcohol LLC Upgrades
  {
    id: 'plastic-bottles',
    name: 'Plastic Water Bottles',
    description: 'Buying in bulk. Alcohol LLC twice as efficient.',
    cost: 100,
    tier: 1,
    substanceId: 'alcohol',
    effects: {
      productionMultiplier: 2,
    },
    requirement: {
      substanceOwned: { id: 'alcohol', count: 1 },
    },
  },
  {
    id: 'premium-glassware',
    name: 'Premium Glassware',
    description: 'It\'s not a problem if you use nice glasses. Alcohol LLC production +50%.',
    cost: 500,
    tier: 2,
    substanceId: 'alcohol',
    effects: {
      productionMultiplier: 1.5,
    },
    requirement: {
      substanceOwned: { id: 'alcohol', count: 5 },
      upgradeOwned: 'plastic-bottles',
    },
  },
  {
    id: 'strategic-hydration',
    name: 'Strategic Hydration',
    description: 'One water for every three drinks. You\'re responsible now.',
    cost: 2500,
    tier: 3,
    substanceId: 'alcohol',
    effects: {
      productionMultiplier: 1.5,
    },
    requirement: {
      substanceOwned: { id: 'alcohol', count: 10 },
    },
  },

  // Stimulant Startups Upgrades
  {
    id: 'bulk-stimulants',
    name: 'Bulk Discount',
    description: 'Subscribe and save. Stimulant Startups twice as efficient.',
    cost: 250,
    tier: 1,
    substanceId: 'stimulant',
    effects: {
      productionMultiplier: 2,
    },
    requirement: {
      substanceOwned: { id: 'stimulant', count: 1 },
    },
  },
  {
    id: 'refined-synthesis',
    name: 'Refined Synthesis',
    description: 'Pharmaceutical grade. Stimulant Startups +50%.',
    cost: 1000,
    tier: 2,
    substanceId: 'stimulant',
    effects: {
      productionMultiplier: 1.5,
    },
    requirement: {
      substanceOwned: { id: 'stimulant', count: 5 },
      upgradeOwned: 'bulk-stimulants',
    },
  },

  // Empathogen Corp Upgrades
  {
    id: 'test-kits',
    name: 'Reagent Test Kits',
    description: 'Harm reduction™. Empathogen Corp twice as efficient.',
    cost: 500,
    tier: 1,
    substanceId: 'empathogen',
    effects: {
      productionMultiplier: 2,
    },
    requirement: {
      substanceOwned: { id: 'empathogen', count: 1 },
    },
  },
  {
    id: 'pre-loading',
    name: 'Pre-Loading Protocol',
    description: 'Antioxidants and supplements. You did the research.',
    cost: 2500,
    tier: 2,
    substanceId: 'empathogen',
    effects: {
      productionMultiplier: 1.5,
    },
    requirement: {
      substanceOwned: { id: 'empathogen', count: 3 },
      upgradeOwned: 'test-kits',
    },
  },

  // Nootropic Holdings Upgrades
  {
    id: 'nootropic-stacks',
    name: 'Synergistic Stacking',
    description: 'Combining compounds. Definitely science. Nootropic Holdings twice as efficient.',
    cost: 1000,
    tier: 1,
    substanceId: 'nootropic',
    effects: {
      productionMultiplier: 2,
    },
    requirement: {
      substanceOwned: { id: 'nootropic', count: 1 },
    },
  },
  {
    id: 'nootropic-research',
    name: 'Reddit Research',
    description: 'You\'ve read at least three forum posts. Basically an expert now. Nootropic Holdings +50%.',
    cost: 5000,
    tier: 2,
    substanceId: 'nootropic',
    effects: {
      productionMultiplier: 1.5,
    },
    requirement: {
      substanceOwned: { id: 'nootropic', count: 5 },
      upgradeOwned: 'nootropic-stacks',
    },
  },

  // Psychedelic Conglomerate Upgrades
  {
    id: 'set-and-setting',
    name: 'Set and Setting',
    description: 'Creating the right environment. Psychedelic Conglomerate twice as efficient.',
    cost: 5000,
    tier: 1,
    substanceId: 'psychedelic',
    effects: {
      productionMultiplier: 2,
    },
    requirement: {
      substanceOwned: { id: 'psychedelic', count: 1 },
    },
  },
  {
    id: 'trip-sitter',
    name: 'Trip Sitter',
    description: 'Someone to tell you it\'s going to be okay. Psychedelic Conglomerate +50%.',
    cost: 25000,
    tier: 2,
    substanceId: 'psychedelic',
    effects: {
      productionMultiplier: 1.5,
    },
    requirement: {
      substanceOwned: { id: 'psychedelic', count: 3 },
      upgradeOwned: 'set-and-setting',
    },
  },

  // Research Chemical Markets Upgrades
  {
    id: 'darknet-markets',
    name: 'Darknet Markets',
    description: 'Using Tor. Very sophisticated. Research Chemical Markets twice as efficient.',
    cost: 50000,
    tier: 1,
    substanceId: 'research',
    effects: {
      productionMultiplier: 2,
    },
    requirement: {
      substanceOwned: { id: 'research', count: 1 },
    },
  },
  {
    id: 'pgp-encryption',
    name: 'PGP Encryption',
    description: 'Operational security. The feds will never know. Research Chemical Markets +50%.',
    cost: 250000,
    tier: 2,
    substanceId: 'research',
    effects: {
      productionMultiplier: 1.5,
    },
    requirement: {
      substanceOwned: { id: 'research', count: 3 },
      upgradeOwned: 'darknet-markets',
    },
  },

  // Experimental Labs Upgrades
  {
    id: 'lab-equipment',
    name: 'Lab Equipment',
    description: 'Beakers and glassware. You\'re a scientist now. Experimental Labs twice as efficient.',
    cost: 1000000,
    tier: 1,
    substanceId: 'experimental',
    effects: {
      productionMultiplier: 2,
    },
    requirement: {
      substanceOwned: { id: 'experimental', count: 1 },
    },
  },

  // Late Game Global Upgrades
  {
    id: 'tolerance-management',
    name: 'Tolerance Management',
    description: 'Taking breaks between doses. Very responsible. All production +10%.',
    cost: 10000,
    tier: 3,
    effects: {
      globalProductionMultiplier: 1.1,
    },
    requirement: {
      totalVibes: 50000,
    },
  },
  {
    id: 'polypharmacy',
    name: 'Polypharmacy Expertise',
    description: 'Understanding interactions. All production +15%.',
    cost: 100000,
    tier: 4,
    effects: {
      globalProductionMultiplier: 1.15,
    },
    requirement: {
      totalVibes: 500000,
      upgradeOwned: 'tolerance-management',
    },
  },
  {
    id: 'transhumanism',
    name: 'Transhumanism',
    description: 'You\'ve transcended human limitations. All production +25%.',
    cost: 10000000,
    tier: 5,
    effects: {
      globalProductionMultiplier: 1.25,
    },
    requirement: {
      totalVibes: 50000000,
      upgradeOwned: 'polypharmacy',
    },
  },
  {
    id: 'post-human',
    name: 'Post-Human Consciousness',
    description: 'The vibes are all that remain. All production x2.',
    cost: 1000000000,
    tier: 5,
    effects: {
      globalProductionMultiplier: 2,
    },
    requirement: {
      totalVibes: 500000000,
      upgradeOwned: 'transhumanism',
    },
  },
];

export function getUpgrade(id: string): Upgrade | undefined {
  return UPGRADES.find(u => u.id === id);
}

export function canPurchaseUpgrade(upgrade: Upgrade, state: any): boolean {
  // Check cost
  if (state.vibes < upgrade.cost) return false;

  // Check if already owned
  if (state.upgrades.includes(upgrade.id)) return false;

  // Check requirements
  if (upgrade.requirement) {
    const req = upgrade.requirement;

    if (req.substanceOwned) {
      const owned = state.substances[req.substanceOwned.id] || 0;
      if (owned < req.substanceOwned.count) return false;
    }

    if (req.totalVibes && state.totalVibesEarned < req.totalVibes) {
      return false;
    }

    if (req.nightsCompleted && state.nightsCompleted < req.nightsCompleted) {
      return false;
    }

    if (req.upgradeOwned && !state.upgrades.includes(req.upgradeOwned)) {
      return false;
    }
  }

  return true;
}

export function getAvailableUpgrades(state: any): Upgrade[] {
  return UPGRADES.filter(upgrade => canPurchaseUpgrade(upgrade, state));
}

export function getUpgradesByTier(tier: number): Upgrade[] {
  return UPGRADES.filter(u => u.tier === tier);
}
