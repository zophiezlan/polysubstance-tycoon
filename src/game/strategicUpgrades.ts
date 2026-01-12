// Strategic Choice Upgrades - Meaningful decisions that change playstyle
// These upgrades offer trade-offs and specializations

import { Upgrade } from './types';

// ============================================================================
// SPECIALIZATION UPGRADES - Choose your path
// ============================================================================

export const SPECIALIZATION_UPGRADES: Upgrade[] = [
  // Active vs Passive specializations
  {
    id: 'spec_active_master',
    name: '🔥 Active Master',
    description: '+200% click power, but -50% passive production. For players who love clicking!',
    cost: 500000,
    tier: 6,
    effects: {
      clickMultiplier: 3.0, // Total 3x (2x boost + base)
      globalProductionMultiplier: 0.5, // Half production
    },
    requirement: {
      totalClicks: 10000,
    },
  },

  {
    id: 'spec_idle_master',
    name: '💤 Idle Master',
    description: '+200% passive production, but -50% click power. For players who prefer automation!',
    cost: 500000,
    tier: 6,
    effects: {
      globalProductionMultiplier: 3.0, // Triple production
      clickMultiplier: 0.5, // Half click power
    },
    requirement: {
      totalVibes: 1000000,
    },
  },

  // Energy specializations
  {
    id: 'spec_high_energy',
    name: '⚡ High Energy Protocol',
    description: 'Gain massive bonuses above 80 energy (+100% production), but suffer below 50 (-30% production).',
    cost: 750000,
    tier: 7,
    effects: {
      // This will need special handling in calculations
      globalProductionMultiplier: 1.0, // Placeholder - actual logic in upgradeEffects
    },
    requirement: {
      totalVibes: 5000000,
    },
  },

  {
    id: 'spec_low_energy',
    name: '😴 Low Energy Protocol',
    description: 'Gain bonuses below 30 energy (+80% production), perform normally at high energy.',
    cost: 750000,
    tier: 7,
    effects: {
      globalProductionMultiplier: 1.0, // Placeholder
    },
    requirement: {
      totalVibes: 5000000,
    },
  },

  // Chaos specializations
  {
    id: 'spec_chaos_rider',
    name: '🌪️ Chaos Rider',
    description: 'Gain +5% production per chaos point above 50. Maximum chaos becomes your strength!',
    cost: 1000000,
    tier: 8,
    effects: {
      globalProductionMultiplier: 1.0, // Special handling required
    },
    requirement: {
      totalVibes: 10000000,
    },
  },

  {
    id: 'spec_chaos_damper',
    name: '🛡️ Chaos Damper',
    description: 'Gain +5% production per chaos point below 50. Stability is your advantage!',
    cost: 1000000,
    tier: 8,
    effects: {
      globalProductionMultiplier: 1.0, // Special handling required
    },
    requirement: {
      totalVibes: 10000000,
    },
  },

  // Extreme specializations
  {
    id: 'spec_manual_override',
    name: '🚫 Manual Override',
    description: 'Disable ALL auto-clickers for +300% manual click power. Pure skill!',
    cost: 5000000,
    tier: 9,
    effects: {
      clickMultiplier: 4.0, // +300% = 4x total
    },
    requirement: {
      totalClicks: 100000,
      totalVibes: 50000000,
    },
  },

  {
    id: 'spec_full_automation',
    name: '🤖 Full Automation',
    description: 'Manual clicks disabled, but +300% auto-clicker speed and +100% production.',
    cost: 5000000,
    tier: 9,
    effects: {
      globalProductionMultiplier: 2.0,
    },
    requirement: {
      totalVibes: 50000000,
    },
  },
];

// ============================================================================
// SUBSTANCE SPECIALIZATION UPGRADES
// ============================================================================

export const SUBSTANCE_SPECIALIST_UPGRADES: Upgrade[] = [
  {
    id: 'specialist_stimulant',
    name: '⚡ Stimulant Specialist',
    description: '+200% stimulant production, but all other substances produce -30%.',
    cost: 250000,
    tier: 6,
    substanceId: 'stimulant',
    effects: {
      productionMultiplier: 3.0, // For stimulants
    },
    requirement: {
      substanceOwned: { id: 'stimulant', count: 20 },
    },
  },

  {
    id: 'specialist_sedative',
    name: '😴 Sedative Specialist',
    description: '+200% sedative production, but all other substances produce -30%.',
    cost: 250000,
    tier: 6,
    substanceId: 'sedative',
    effects: {
      productionMultiplier: 3.0,
    },
    requirement: {
      substanceOwned: { id: 'sedative', count: 20 },
    },
  },

  {
    id: 'specialist_empathogen',
    name: '💖 Empathogen Specialist',
    description: '+200% empathogen production, but all other substances produce -30%.',
    cost: 250000,
    tier: 6,
    substanceId: 'empathogen',
    effects: {
      productionMultiplier: 3.0,
    },
    requirement: {
      substanceOwned: { id: 'empathogen', count: 20 },
    },
  },

  {
    id: 'specialist_dissociative',
    name: '🌀 Dissociative Specialist',
    description: '+200% dissociative production, but all other substances produce -30%.',
    cost: 250000,
    tier: 6,
    substanceId: 'dissociative',
    effects: {
      productionMultiplier: 3.0,
    },
    requirement: {
      substanceOwned: { id: 'dissociative', count: 20 },
    },
  },

  {
    id: 'specialist_deliriant',
    name: '👁️ Deliriant Specialist',
    description: '+200% deliriant production, but all other substances produce -30%.',
    cost: 250000,
    tier: 6,
    substanceId: 'deliriant',
    effects: {
      productionMultiplier: 3.0,
    },
    requirement: {
      substanceOwned: { id: 'deliriant', count: 20 },
    },
  },
];

// ============================================================================
// COMBO & SYNERGY UPGRADES
// ============================================================================

export const SYNERGY_UPGRADES: Upgrade[] = [
  {
    id: 'synergy_stimulant_research',
    name: '🧪 Research Enhancement',
    description: 'When you own both Stimulant and Research, both produce +100%.',
    cost: 500000,
    tier: 7,
    effects: {
      globalProductionMultiplier: 1.0, // Special handling
    },
    requirement: {
      totalVibes: 2000000,
    },
  },

  {
    id: 'synergy_alcohol_empathogen',
    name: '🍻 Social Lubricant',
    description: 'Alcohol + Empathogen combo: Reduce memory crash penalty by 50%, both produce +50%.',
    cost: 750000,
    tier: 7,
    effects: {
      globalProductionMultiplier: 1.0, // Special handling
    },
    requirement: {
      totalVibes: 5000000,
    },
  },

  {
    id: 'synergy_dissociative_sedative',
    name: '🛌 Deep Dive',
    description: 'Dissociative + Sedative combo: Memory blackout reduced by 50%, both produce +50%.',
    cost: 750000,
    tier: 7,
    effects: {
      globalProductionMultiplier: 1.0, // Special handling
    },
    requirement: {
      totalVibes: 5000000,
    },
  },

  {
    id: 'synergy_paradox_embrace',
    name: '⚔️ Paradox Embrace',
    description: 'Stimulant + Sedative combo: Convert paradox anxiety into production boost (+10% per anxiety spike).',
    cost: 1000000,
    tier: 8,
    effects: {
      globalProductionMultiplier: 1.0, // Special handling
    },
    requirement: {
      totalVibes: 10000000,
    },
  },
];

// ============================================================================
// RISK/REWARD UPGRADES
// ============================================================================

export const RISK_REWARD_UPGRADES: Upgrade[] = [
  {
    id: 'risk_all_or_nothing',
    name: '🎲 All Or Nothing',
    description: 'Production randomly swings between 50% and 300% every 10 seconds. Average: +175%!',
    cost: 2000000,
    tier: 8,
    effects: {
      globalProductionMultiplier: 1.0, // Special handling
    },
    requirement: {
      totalVibes: 20000000,
    },
  },

  {
    id: 'risk_burnout',
    name: '🔥 Burnout Mode',
    description: 'Lose 5 energy/sec, but gain +500% production. Can you maintain it?',
    cost: 3000000,
    tier: 9,
    effects: {
      globalProductionMultiplier: 6.0,
    },
    requirement: {
      totalVibes: 50000000,
    },
  },

  {
    id: 'risk_chaos_cascade',
    name: '💀 Chaos Cascade',
    description: 'Gain +10 chaos/sec, but production increases by +20% per point of chaos. Dangerous!',
    cost: 5000000,
    tier: 9,
    effects: {
      globalProductionMultiplier: 1.0, // Special handling
    },
    requirement: {
      totalVibes: 100000000,
    },
  },
];

// ============================================================================
// EXPONENTIAL SCALING UPGRADES
// ============================================================================

export const SCALING_UPGRADES: Upgrade[] = [
  {
    id: 'scaling_combo_power',
    name: '🔥 Combo Momentum',
    description: '+1% production per combo point. At 100 combo = +100% production!',
    cost: 1000000,
    tier: 7,
    effects: {
      globalProductionMultiplier: 1.0, // Special handling
    },
    requirement: {
      totalClicks: 50000,
    },
  },

  {
    id: 'scaling_knowledge',
    name: '📚 Knowledge is Power',
    description: '+20% production per knowledge level. Stacks with everything!',
    cost: 2000000,
    tier: 8,
    effects: {
      globalProductionMultiplier: 1.0, // Special handling
    },
    requirement: {
      totalVibes: 25000000,
    },
  },

  {
    id: 'scaling_diversity',
    name: '🌈 Diversity Bonus',
    description: '+15% production for each different substance type owned (max +150%).',
    cost: 1500000,
    tier: 7,
    effects: {
      globalProductionMultiplier: 1.0, // Special handling
    },
    requirement: {
      totalVibes: 10000000,
    },
  },

  {
    id: 'scaling_prestige',
    name: '♾️ Prestige Power',
    description: '+5% production per prestige tier. Rewards veteran players!',
    cost: 5000000,
    tier: 9,
    effects: {
      globalProductionMultiplier: 1.0, // Special handling
    },
    requirement: {
      totalVibes: 100000000,
    },
  },
];

// ============================================================================
// ALL STRATEGIC UPGRADES
// ============================================================================

export const ALL_STRATEGIC_UPGRADES: Upgrade[] = [
  ...SPECIALIZATION_UPGRADES,
  ...SUBSTANCE_SPECIALIST_UPGRADES,
  ...SYNERGY_UPGRADES,
  ...RISK_REWARD_UPGRADES,
  ...SCALING_UPGRADES,
];

// Export for easy import
export default ALL_STRATEGIC_UPGRADES;
