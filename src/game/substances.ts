import { SubstanceDefinition } from './types';

export const SUBSTANCES: SubstanceDefinition[] = [
  {
    id: 'alcohol',
    name: 'Alcohol LLC',
    tagline: 'The Foundation of Bad Decisions',
    description: 'The quiet villain. Seems harmless early, multiplies everything else.',
    baseCost: 10,
    costMultiplier: 1.15,
    baseVibes: 0.5,
    energyMod: -0.2,
    chaosMod: 0.5,
    strainMod: 0.3,
    hydrationMod: 0.5,
    sleepDebtMod: 0,
    memoryMod: -0.4,
    confidenceMod: 1,
  },
  {
    id: 'stimulant',
    name: 'Stimulant Startups',
    tagline: 'Sleep is a Construct',
    description: 'Energy boosts, time extension, but the bill comes due.',
    baseCost: 25,
    costMultiplier: 1.2,
    baseVibes: 1.5,
    energyMod: 0.5,
    chaosMod: 1.5,
    strainMod: 0.1,
    hydrationMod: 1.5,
    sleepDebtMod: 2,
    memoryMod: 0,
    confidenceMod: 0,
    timeExtension: 5,
  },
  {
    id: 'empathogen',
    name: 'Empathogen Corp',
    tagline: 'Connection as a Service',
    description: 'Vibes king, but drains the tank.',
    baseCost: 50,
    costMultiplier: 1.25,
    baseVibes: 3,
    energyMod: -1.2,
    chaosMod: 0, // Special: pulls toward 50
    strainMod: 0.2,
    hydrationMod: 2,
    sleepDebtMod: 0,
    memoryMod: -0.3,
    confidenceMod: 2,
    unlockAction: 'checkOnMate',
  },
  {
    id: 'dissociative',
    name: 'Dissociative Industries',
    tagline: 'Perspective Adjustment Solutions',
    description: 'Chaos reduction, but you lose the controls.',
    baseCost: 40,
    costMultiplier: 1.18,
    baseVibes: 1,
    energyMod: -0.5,
    chaosMod: -2,
    strainMod: 0.4,
    hydrationMod: 0,
    sleepDebtMod: 0,
    memoryMod: 0,
    confidenceMod: 3,
  },
  {
    id: 'sedative',
    name: 'Sedative Unlimited',
    tagline: 'Anxiety Not Found',
    description: 'Removes warnings, deletes memory, quiet danger.',
    baseCost: 35,
    costMultiplier: 1.2,
    baseVibes: 0.8,
    energyMod: -0.8,
    chaosMod: -1.5,
    strainMod: 0.5,
    hydrationMod: 0,
    sleepDebtMod: 0,
    memoryMod: -1,
    confidenceMod: 4,
  },
];

export function getSubstance(id: string): SubstanceDefinition | undefined {
  return SUBSTANCES.find(s => s.id === id);
}

export function getSubstanceCost(substance: SubstanceDefinition, owned: number): number {
  return Math.floor(substance.baseCost * Math.pow(substance.costMultiplier, owned));
}
