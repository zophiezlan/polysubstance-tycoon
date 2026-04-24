import { GameState } from "./types";
import { getSubstance } from "./substances";
import { getStimulantEnergyMod } from "./interactions";
import type { InteractionMultipliers } from "./interactions";
import {
  calculateAutoClickerRate,
  calculateChaosDampening,
  calculateClickPower,
  calculateProductionMultiplier,
} from "./upgradeEffects";

// Each manual click nudges chaos by up to this much; auto-clicks pay half.
const AUTO_CLICK_CHAOS_PER_CLICK = 0.5;

/**
 * Aggregated per-substance modifiers — computed once per tick so downstream
 * meter updates don't re-walk the substance list.
 */
export interface SubstanceAggregates {
  vibesPerSec: number;
  energyMod: number;
  chaosMod: number;
  strainMod: number;
  hydrationMod: number;
  sleepDebtMod: number;
  memoryMod: number;
  confidenceMod: number;
  cumulativeTimeExtension: number; // Stimulant-flip bonus window
  stimulantCount: number;
}

export function aggregateSubstanceMods(state: GameState): SubstanceAggregates {
  const stimulantCount = state.substances.stimulant || 0;
  const cumulativeTimeExtension = stimulantCount * 5;

  let vibesPerSec = 0;
  let energyMod = 0;
  let chaosMod = 0;
  let strainMod = 0;
  let hydrationMod = 0;
  let sleepDebtMod = 0;
  let memoryMod = 0;
  let confidenceMod = 0;

  for (const substanceId of Object.keys(state.substances)) {
    const count = state.substances[substanceId];
    if (!count) continue;

    const substance = getSubstance(substanceId);
    if (!substance) continue;

    const productionMultiplier = calculateProductionMultiplier(state, substanceId);
    vibesPerSec += substance.baseVibes * count * productionMultiplier;

    energyMod += substance.energyMod * count;
    chaosMod += substance.chaosMod * count;
    strainMod += substance.strainMod * count;
    hydrationMod += substance.hydrationMod * count;
    sleepDebtMod += substance.sleepDebtMod * count;
    memoryMod += substance.memoryMod * count;
    confidenceMod += substance.confidenceMod * count;

    // Stimulant's energy contribution decays with cumulative time extension.
    if (substanceId === "stimulant") {
      const adjustedEnergyMod = getStimulantEnergyMod(
        substance.energyMod,
        cumulativeTimeExtension,
      );
      energyMod += (adjustedEnergyMod - substance.energyMod) * count;
    }
  }

  return {
    vibesPerSec,
    energyMod,
    chaosMod,
    strainMod,
    hydrationMod,
    sleepDebtMod,
    memoryMod,
    confidenceMod,
    cumulativeTimeExtension,
    stimulantCount,
  };
}

/**
 * Passive vibes/sec from owned substances, modified by interaction multipliers
 * and the temporary random-event production boost.
 */
export function applyPassiveProduction(
  state: GameState,
  dt: number,
  aggregates: SubstanceAggregates,
  interactions: InteractionMultipliers,
): void {
  let vibesPerSec = aggregates.vibesPerSec * interactions.vibesMultiplier;

  const now = Date.now();
  if (state.productionBoostUntil > now && state.productionBoostMultiplier > 1) {
    vibesPerSec *= state.productionBoostMultiplier;
  }

  const gained = vibesPerSec * dt;
  state.vibes += gained;
  state.totalVibesEarned += gained;
  state.timePlayed += dt;
  state.highestVibesPerSecond = Math.max(
    state.highestVibesPerSecond,
    vibesPerSec,
  );
}

/**
 * Auto-clicker accrual. Fractional clicks carry between ticks so the rate is
 * stable at any dt.
 */
export function applyAutoClicker(state: GameState, dt: number): void {
  const rate = calculateAutoClickerRate(state);
  if (rate <= 0) return;

  state.autoClickerAccumulator += rate * dt;
  const wholeClicks = Math.floor(state.autoClickerAccumulator);
  if (wholeClicks <= 0) return;

  state.autoClickerAccumulator -= wholeClicks;
  const clickPower = calculateClickPower(state);
  const autoVibes = clickPower * wholeClicks;
  state.vibes += autoVibes;
  state.totalVibesEarned += autoVibes;
  state.totalClicks += wholeClicks;

  const chaosPerClick = AUTO_CLICK_CHAOS_PER_CLICK * (1 - calculateChaosDampening(state));
  state.chaos = Math.min(100, state.chaos + wholeClicks * chaosPerClick);
}

/**
 * Clear expired random-event timers so downstream reads stay cheap. Mutates
 * in place for consistency with the other phase functions.
 */
export function expireTemporaryEvents(state: GameState): void {
  const now = Date.now();
  if (state.productionBoostUntil !== 0 && state.productionBoostUntil <= now) {
    state.productionBoostUntil = 0;
    state.productionBoostMultiplier = 1;
  }
  if (state.flashSaleDiscountUntil !== 0 && state.flashSaleDiscountUntil <= now) {
    state.flashSaleDiscountUntil = 0;
  }
  if (state.badBatchDebuffUntil !== 0 && state.badBatchDebuffUntil <= now) {
    state.badBatchDebuffUntil = 0;
  }
}
