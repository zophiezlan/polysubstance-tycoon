import { SubstanceInteraction } from './types';

// Interaction matrix: when two substance types are active together
export const INTERACTION_MATRIX: Record<string, Record<string, SubstanceInteraction>> = {
  alcohol: {
    sedative: {
      strainMultiplier: 2.5,
      specialEffect: 'respiratory_risk',
    },
    empathogen: {
      strainMultiplier: 1.3,
      specialEffect: 'memory_crash',
    },
    dissociative: {
      specialEffect: 'chaos_randomization',
    },
    stimulant: {
      specialEffect: 'mask_energy_drain',
    },
  },
  stimulant: {
    sedative: {
      strainMultiplier: 1.8,
      specialEffect: 'paradox_anxiety',
    },
    empathogen: {
      strainMultiplier: 1.2,
      specialEffect: 'triple_hydration',
    },
    alcohol: {
      specialEffect: 'mask_energy_drain',
    },
  },
  empathogen: {
    alcohol: {
      strainMultiplier: 1.3,
      specialEffect: 'memory_crash',
    },
    sedative: {
      effectMultiplier: 0.3, // Sedative wins, nullifies empathogen output
    },
    stimulant: {
      strainMultiplier: 1.2,
      specialEffect: 'triple_hydration',
    },
  },
  dissociative: {
    alcohol: {
      specialEffect: 'chaos_randomization',
    },
    sedative: {
      specialEffect: 'memory_blackout',
    },
  },
  sedative: {
    alcohol: {
      strainMultiplier: 2.5,
      specialEffect: 'respiratory_risk',
    },
    dissociative: {
      specialEffect: 'memory_blackout',
    },
    empathogen: {
      effectMultiplier: 0.3, // Sedative wins
    },
    stimulant: {
      strainMultiplier: 1.8,
      specialEffect: 'paradox_anxiety',
    },
  },
};

export function getActiveSubstanceTypes(substances: Record<string, number>): string[] {
  return Object.keys(substances).filter(id => substances[id] > 0);
}

export function calculateInteractionMultipliers(
  substances: Record<string, number>
): { strainMultiplier: number; vibesMultiplier: number; specialEffects: string[] } {
  const activeTypes = getActiveSubstanceTypes(substances);
  let totalStrainMultiplier = 1.0;
  let totalVibesMultiplier = 1.0;
  const specialEffects: string[] = [];

  // Check each pair
  for (let i = 0; i < activeTypes.length; i++) {
    for (let j = i + 1; j < activeTypes.length; j++) {
      const typeA = activeTypes[i];
      const typeB = activeTypes[j];

      // Check both directions since matrix might not be symmetrical
      const interactionAB = INTERACTION_MATRIX[typeA]?.[typeB];
      const interactionBA = INTERACTION_MATRIX[typeB]?.[typeA];

      const interaction = interactionAB || interactionBA;

      if (interaction) {
        if (interaction.strainMultiplier) {
          totalStrainMultiplier *= interaction.strainMultiplier;
        }
        if (interaction.effectMultiplier) {
          totalVibesMultiplier *= interaction.effectMultiplier;
        }
        if (interaction.specialEffect && !specialEffects.includes(interaction.specialEffect)) {
          specialEffects.push(interaction.specialEffect);
        }
      }
    }
  }

  return {
    strainMultiplier: totalStrainMultiplier,
    vibesMultiplier: totalVibesMultiplier,
    specialEffects,
  };
}

// Hidden mechanic: Alcohol amplifies all other strain modifiers
export function getAlcoholAmplification(alcoholCount: number): number {
  const amplificationSteps = Math.floor(alcoholCount / 5);
  return 1 + (amplificationSteps * 0.1); // +10% per 5 units
}

// Stimulant energy flip mechanic
export function getStimulantEnergyMod(
  baseEnergyMod: number,
  cumulativeTimeExtension: number
): number {
  if (cumulativeTimeExtension >= 30) {
    return -1; // Flips to negative after 30 seconds of extension
  }
  return baseEnergyMod;
}
