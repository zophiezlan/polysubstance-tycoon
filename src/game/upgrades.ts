import { Upgrade } from './types';

export const UPGRADES: Upgrade[] = [
  // Global Click Upgrades
  {
    id: 'better-technique',
    name: 'Better Technique',
    description: 'Learning to run the night more efficiently. +5 vibes per click.',
    cost: 400,
    tier: 1,
    category: 'global',
    effects: {
      clickPower: 5,
    },
  },
  {
    id: 'practiced-hands',
    name: 'Practiced Hands',
    description: 'Muscle memory. Click power x2.',
    cost: 4000,
    tier: 2,
    category: 'global',
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
    cost: 40000,
    tier: 2,
    category: 'global', // BROKEN: energyCostReduction incompatible with current energy system
    effects: {
      energyCostReduction: 0.5,
    },
  },
  {
    id: 'controlled-chaos',
    name: 'Controlled Chaos',
    description: 'Chaos generation reduced by 30%.',
    cost: 20000,
    tier: 3,
    category: 'harm-reduction',
    effects: {
      chaosDampening: 0.3,
    },
  },

  // Alcohol LLC Upgrades
  {
    id: 'plastic-bottles',
    name: 'Plastic Water Bottles',
    description: 'Buying in bulk. Alcohol LLC twice as efficient.',
    cost: 400,
    tier: 1,
    category: 'substance-specific',
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
    cost: 2000,
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
    cost: 40000,
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
    cost: 4000,
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
    cost: 4000,
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
    cost: 2000,
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
    cost: 40000,
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
    cost: 4000,
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
    cost: 20000,
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
    cost: 20000,
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
    cost: 400000,
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
    cost: 200000,
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
    cost: 3000000,
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
    cost: 3000000,
    tier: 1,
    substanceId: 'experimental',
    effects: {
      productionMultiplier: 2,
    },
    requirement: {
      substanceOwned: { id: 'experimental', count: 1 },
    },
  },
  {
    id: 'peer-reviewed-madness',
    name: 'Peer-Reviewed Madness',
    description: 'Your findings are published. No one will replicate them. Experimental Labs +50%.',
    cost: 15000000,
    tier: 2,
    substanceId: 'experimental',
    effects: {
      productionMultiplier: 1.5,
    },
    requirement: {
      substanceOwned: { id: 'experimental', count: 5 },
      upgradeOwned: 'lab-equipment',
    },
  },

  // Forbidden Formulae Upgrades
  {
    id: 'forbidden-synthesis',
    name: 'Forbidden Synthesis',
    description: 'Techniques that should remain forgotten. Forbidden Formulae twice as efficient.',
    cost: 15000000,
    tier: 1,
    substanceId: 'forbidden',
    effects: {
      productionMultiplier: 2,
    },
    requirement: {
      substanceOwned: { id: 'forbidden', count: 1 },
    },
  },
  {
    id: 'occult-chemistry',
    name: 'Occult Chemistry',
    description: 'Mixing science with things that predate science. Forbidden Formulae +50%.',
    cost: 75000000,
    tier: 2,
    substanceId: 'forbidden',
    effects: {
      productionMultiplier: 1.5,
    },
    requirement: {
      substanceOwned: { id: 'forbidden', count: 5 },
      upgradeOwned: 'forbidden-synthesis',
    },
  },

  // Eldritch Extracts Upgrades
  {
    id: 'dimensional-distillation',
    name: 'Dimensional Distillation',
    description: 'Refining substances from beyond. Eldritch Extracts twice as efficient.',
    cost: 150000000,
    tier: 1,
    substanceId: 'eldritch',
    effects: {
      productionMultiplier: 2,
    },
    requirement: {
      substanceOwned: { id: 'eldritch', count: 1 },
    },
  },
  {
    id: 'cosmic-concentration',
    name: 'Cosmic Concentration',
    description: 'The vibes are listening. Eldritch Extracts +50%.',
    cost: 750000000,
    tier: 2,
    substanceId: 'eldritch',
    effects: {
      productionMultiplier: 1.5,
    },
    requirement: {
      substanceOwned: { id: 'eldritch', count: 5 },
      upgradeOwned: 'dimensional-distillation',
    },
  },

  // Void Pharmaceuticals Upgrades
  {
    id: 'void-optimization',
    name: 'Void Optimization',
    description: 'Optimizing nothingness. A paradox that works. Void Pharmaceuticals twice as efficient.',
    cost: 1500000000,
    tier: 1,
    substanceId: 'void',
    effects: {
      productionMultiplier: 2,
    },
    requirement: {
      substanceOwned: { id: 'void', count: 1 },
    },
  },
  {
    id: 'embrace-the-void',
    name: 'Embrace the Void',
    description: 'Resistance is futile. Void Pharmaceuticals +50%.',
    cost: 7500000000,
    tier: 2,
    substanceId: 'void',
    effects: {
      productionMultiplier: 1.5,
    },
    requirement: {
      substanceOwned: { id: 'void', count: 5 },
      upgradeOwned: 'void-optimization',
    },
  },

  // ===== PROGRESSION GATES - Required to unlock substance tiers =====
  {
    id: 'tier-2-license',
    name: 'Advanced Procurement License',
    description: 'Unlocks access to high-tier substances (Research Chemicals onwards). Required to purchase exotic and beyond.',
    cost: 400000,
    tier: 3,
    effects: {},
    requirement: {
      totalVibes: 700000,
      substanceOwned: { id: 'research', count: 1 },
    },
  },
  {
    id: 'tier-3-connections',
    name: 'Underground Network Access',
    description: 'Connects you to the darkest markets. Required to purchase experimental and beyond.',
    cost: 2000000,
    tier: 4,
    effects: {},
    requirement: {
      totalVibes: 14000000,
      upgradeOwned: 'tier-2-license',
      substanceOwned: { id: 'exotic', count: 5 },
    },
  },
  {
    id: 'tier-4-clearance',
    name: 'Forbidden Knowledge',
    description: 'You know too much. Required to purchase forbidden and beyond.',
    cost: 15000000,
    tier: 5,
    effects: {},
    requirement: {
      totalVibes: 140000000,
      upgradeOwned: 'tier-3-connections',
      substanceOwned: { id: 'experimental', count: 5 },
    },
  },
  {
    id: 'tier-5-transcendence',
    name: 'Reality Breach Protocol',
    description: 'You\'ve pierced the veil. Required to purchase eldritch and void substances.',
    cost: 150000000,
    tier: 5,
    effects: {},
    requirement: {
      totalVibes: 1400000000,
      upgradeOwned: 'tier-4-clearance',
      substanceOwned: { id: 'forbidden', count: 3 },
    },
  },

  // Late Game Global Upgrades
  {
    id: 'tolerance-management',
    name: 'Tolerance Management',
    description: 'Taking breaks between doses. Very responsible. All production +10%.',
    cost: 40000,
    tier: 3,
    effects: {
      globalProductionMultiplier: 1.1,
    },
    requirement: {
      totalVibes: 350000,
    },
  },
  {
    id: 'polypharmacy',
    name: 'Polypharmacy Expertise',
    description: 'Understanding interactions. All production +15%.',
    cost: 400000,
    tier: 4,
    effects: {
      globalProductionMultiplier: 1.15,
    },
    requirement: {
      totalVibes: 3500000,
      upgradeOwned: 'tolerance-management',
    },
  },
  {
    id: 'transhumanism',
    name: 'Transhumanism',
    description: 'You\'ve transcended human limitations. All production +25%.',
    cost: 30000000,
    tier: 5,
    effects: {
      globalProductionMultiplier: 1.25,
    },
    requirement: {
      totalVibes: 350000000,
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
      totalVibes: 3500000000,
      upgradeOwned: 'transhumanism',
    },
  },

  // ===== TIER 6: COOKIE CLICKER ENDLESS SCALING =====

  {
    id: 'hyper-efficiency',
    name: 'Hyper-Efficiency Protocols',
    description: 'You\'ve optimized the optimization. Click power x3.',
    cost: 15000000000,
    tier: 6,
    effects: {
      clickMultiplier: 3,
    },
    requirement: {
      totalVibes: 14000000000,
      totalClicks: 10000,
    },
  },
  {
    id: 'quantum-vibes',
    name: 'Quantum Vibe Superposition',
    description: 'Vibes exist in all states simultaneously. All production x2.5.',
    cost: 75000000000,
    tier: 6,
    effects: {
      globalProductionMultiplier: 2.5,
    },
    requirement: {
      totalVibes: 70000000000,
      upgradeOwned: 'post-human',
    },
  },
  {
    id: 'memetic-hazard',
    name: 'Weaponized Memetics',
    description: 'Your vibes spread like a virus. All production x2.',
    cost: 300000000000,
    tier: 6,
    effects: {
      globalProductionMultiplier: 2,
    },
    requirement: {
      totalVibes: 350000000000,
      upgradeOwned: 'quantum-vibes',
    },
  },

  // ===== TIER 7: ABSURD SCALING =====

  {
    id: 'reality-editing',
    name: 'Reality Editing Privileges',
    description: 'You\'re not playing the game. You ARE the game. Production x5.',
    cost: 3000000000000,
    tier: 7,
    effects: {
      globalProductionMultiplier: 5,
    },
    requirement: {
      totalVibes: 3500000000000,
      upgradeOwned: 'memetic-hazard',
    },
  },
  {
    id: 'singularity-core',
    name: 'Singularity Core',
    description: 'The vibes have achieved consciousness. Click power x10.',
    cost: 30000000000000,
    tier: 7,
    effects: {
      clickMultiplier: 10,
    },
    requirement: {
      totalVibes: 35000000000000,
      totalClicks: 100000,
    },
  },
  {
    id: 'hyperdimensional',
    name: 'Hyperdimensional Operations',
    description: 'Operating across infinite timelines. Production x10.',
    cost: 300000000000000,
    tier: 7,
    effects: {
      globalProductionMultiplier: 10,
    },
    requirement: {
      totalVibes: 350000000000000,
      upgradeOwned: 'reality-editing',
    },
  },

  // ===== TIER 8: TRANSCENDENT SCALING =====

  {
    id: 'vibe-deity',
    name: 'Ascension to Vibe Deity',
    description: 'You are now worshipped. All production x25.',
    cost: 3000000000000000,
    tier: 8,
    effects: {
      globalProductionMultiplier: 25,
    },
    requirement: {
      totalVibes: 3500000000000000,
      upgradeOwned: 'hyperdimensional',
    },
  },
  {
    id: 'omnipotent-clicker',
    name: 'Omnipotent Click',
    description: 'Each click echoes through all of reality. Click power x100.',
    cost: 30000000000000000,
    tier: 8,
    effects: {
      clickMultiplier: 100,
    },
    requirement: {
      totalVibes: 35000000000000000,
      totalClicks: 1000000,
    },
  },
  {
    id: 'heat-death',
    name: 'Survive Heat Death',
    description: 'The universe ends. The vibes continue. Production x100.',
    cost: 300000000000000000,
    tier: 8,
    effects: {
      globalProductionMultiplier: 100,
    },
    requirement: {
      totalVibes: 350000000000000000,
      upgradeOwned: 'vibe-deity',
    },
  },

  // ===== TIER 9: THE FINAL FRONTIER =====

  {
    id: 'infinite-vibes',
    name: '∞ VIBES',
    description: 'You have achieved vibe infinity. Nothing can stop you now. Production x1000.',
    cost: 3000000000000000000,
    tier: 9,
    effects: {
      globalProductionMultiplier: 1000,
    },
    requirement: {
      totalVibes: 3500000000000000000,
      upgradeOwned: 'heat-death',
    },
  },

  // ===== AUTOMATION / IDLE UPGRADES =====

  {
    id: 'auto-clicker-1',
    name: 'Autoclicker Script',
    description: 'Generates 1 click per second automatically. Very legitimate.',
    cost: 20000,
    tier: 2,
    effects: {
      clickPower: 0, // Special: handled in App.tsx
    },
    requirement: {
      totalClicks: 500,
    },
  },
  {
    id: 'auto-clicker-2',
    name: 'Macro Optimization',
    description: '5 clicks per second. Your fingers thank you.',
    cost: 200000,
    tier: 3,
    effects: {
      clickPower: 0,
    },
    requirement: {
      totalClicks: 2500,
      upgradeOwned: 'auto-clicker-1',
    },
  },
  {
    id: 'auto-clicker-3',
    name: 'Neural Interface',
    description: '20 clicks per second. Think and it clicks.',
    cost: 2000000,
    tier: 4,
    effects: {
      clickPower: 0,
    },
    requirement: {
      totalClicks: 10000,
      upgradeOwned: 'auto-clicker-2',
    },
  },
  {
    id: 'auto-clicker-4',
    name: 'Quantum Clicking',
    description: 'Clicks in all timelines simultaneously. 100/sec.',
    cost: 30000000,
    tier: 5,
    effects: {
      clickPower: 0,
    },
    requirement: {
      totalClicks: 50000,
      upgradeOwned: 'auto-clicker-3',
    },
  },

  {
    id: 'idle-bonus-1',
    name: 'Passive Income',
    description: 'Vibes accumulate while you\'re away. +50% idle bonus.',
    cost: 400000,
    tier: 3,
    effects: {
      globalProductionMultiplier: 1.5, // Applied when away
    },
  },
  {
    id: 'idle-bonus-2',
    name: 'Compounding Interest',
    description: 'Time away = more vibes. +100% idle bonus.',
    cost: 3000000,
    tier: 4,
    effects: {
      globalProductionMultiplier: 2,
    },
    requirement: {
      upgradeOwned: 'idle-bonus-1',
    },
  },
  {
    id: 'idle-bonus-3',
    name: 'Time Dilation',
    description: 'Reality bends to your idle game. +300% idle bonus.',
    cost: 15000000,
    tier: 5,
    effects: {
      globalProductionMultiplier: 4,
    },
    requirement: {
      upgradeOwned: 'idle-bonus-2',
    },
  },

  // ===== SYNERGY UPGRADES =====

  {
    id: 'cocktail-theory',
    name: 'Cocktail Theory',
    description: 'Mixing alcohol + empathogen is... strategic? Both +30%.',
    cost: 40000,
    tier: 3,
    category: 'synergy',
    synergySubstances: ['alcohol', 'empathogen'],
    effects: {
      productionMultiplier: 1.3,
    },
    requirement: {
      substanceOwned: { id: 'alcohol', count: 5 },
    },
  },
  {
    id: 'speedball-dynamics',
    name: 'Speedball Dynamics',
    description: 'Stimulant + sedative creates... balance? Both +40%.',
    cost: 400000,
    tier: 3,
    category: 'synergy',
    synergySubstances: ['stimulant', 'sedative'],
    effects: {
      productionMultiplier: 1.4,
    },
    requirement: {
      substanceOwned: { id: 'stimulant', count: 5 },
    },
  },
  {
    id: 'candy-flip-protocol',
    name: 'Candy Flip Protocol',
    description: 'Empathogen + psychedelic = transcendence. Both +50%.',
    cost: 400000,
    tier: 4,
    category: 'synergy',
    synergySubstances: ['empathogen', 'psychedelic'],
    effects: {
      productionMultiplier: 1.5,
    },
    requirement: {
      substanceOwned: { id: 'empathogen', count: 3 },
    },
  },
  {
    id: 'jedi-flip-mastery',
    name: 'Jedi Flip Mastery',
    description: 'Three substances at once. You\'re a chemist now. +100% global.',
    cost: 3000000,
    tier: 5,
    category: 'synergy',
    synergySubstances: ['alcohol', 'empathogen', 'psychedelic'],
    effects: {
      globalProductionMultiplier: 2,
    },
    requirement: {
      upgradeOwned: 'candy-flip-protocol',
    },
  },

  // ===== HARM REDUCTION TECH TREE =====

  {
    id: 'test-kit-pro',
    name: 'Test Kit Pro',
    description: 'Actually test your substances. Strain +30% slower.',
    cost: 60000,
    tier: 3,
    effects: {
      chaosDampening: 0.3,
    },
  },
  {
    id: 'supplements',
    name: 'Supplement Regimen',
    description: 'Vitamins, antioxidants, magnesium. Strain +40% slower.',
    cost: 200000,
    tier: 4,
    effects: {
      chaosDampening: 0.4,
    },
    requirement: {
      upgradeOwned: 'test-kit-pro',
    },
  },
  {
    id: 'medical-supervision',
    name: 'Medical Supervision',
    description: 'Having a doctor on speed dial. Strain +50% slower.',
    cost: 2000000,
    tier: 5,
    effects: {
      chaosDampening: 0.5,
    },
    requirement: {
      upgradeOwned: 'supplements',
    },
  },

  // ===== CURSED FEATURES =====

  {
    id: 'memory-suppression',
    name: 'Selective Memory Suppression',
    description: 'Forget the bad parts. Keep the vibes. Memory damage -50%.',
    cost: 300000,
    tier: 4,
    effects: {
      chaosDampening: 0.3,
    },
  },
  {
    id: 'reality-distortion-field',
    name: 'Reality Distortion Field',
    description: 'Confidence isn\'t lying if you believe it. Distortion = vibes.',
    cost: 3000000,
    tier: 4,
    effects: {
      globalProductionMultiplier: 1.2,
    },
    requirement: {
      totalVibes: 7000000,
    },
  },
  {
    id: 'denial-mechanism',
    name: 'Industrial Denial Mechanism',
    description: 'Nothing is a problem if you refuse to acknowledge it. Chaos means nothing now.',
    cost: 3000000,
    tier: 5,
    effects: {
      chaosDampening: 0.6,
    },
  },
  {
    id: 'perspective-hack',
    name: 'Perspective Hacking',
    description: 'It\'s not addiction, it\'s passion. It\'s not a problem, it\'s a lifestyle. Production +25%.',
    cost: 2500000,
    tier: 5,
    effects: {
      globalProductionMultiplier: 1.25,
    },
  },

  // ===== COMBO UPGRADES =====

  {
    id: 'combo-master',
    name: 'Combo Mastery',
    description: 'Your fingers are now independently sentient. Combo timer +1 second.',
    cost: 40000,
    tier: 3,
    effects: {
      clickPower: 5,
    },
    requirement: {
      totalClicks: 1000,
    },
  },
  {
    id: 'combo-god',
    name: 'Combo Deity',
    description: 'Time bends to your rhythm. Combo timer +2 seconds.',
    cost: 400000,
    tier: 4,
    effects: {
      clickPower: 10,
    },
    requirement: {
      totalClicks: 5000,
      upgradeOwned: 'combo-master',
    },
  },
  {
    id: 'eternal-combo',
    name: 'Eternal Combo',
    description: 'Your combo never dies. It merely... waits. Combo timer +5 seconds.',
    cost: 3000000,
    tier: 5,
    effects: {
      clickPower: 25,
    },
    requirement: {
      totalClicks: 25000,
      upgradeOwned: 'combo-god',
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

    if (req.totalClicks && state.totalClicks < req.totalClicks) {
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
