/**
 * Random Events System (Golden Cookie equivalent)
 *
 * Provides surprise bonuses and events that keep the game feeling fresh
 * and reward active players.
 */

import { GameState } from './types';
import { getSubstance } from './substances';

export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  duration: number; // seconds the event is available
  cooldown: number; // seconds before this event can appear again

  // Unlock conditions
  unlockCondition?: {
    minKnowledgeLevel?: number;
    minVibes?: number;
    requiresSubstance?: string;
    minNightsCompleted?: number;
  };

  // What happens when activated
  effect: (state: GameState) => {
    vibesBonus?: number;
    vibesMultiplier?: number; // Multiply current vibes
    energyBonus?: number;
    chaosReduction?: number;
    strainReduction?: number;
    hydrationReduction?: number;
    freeSubstance?: string;
    productionBoost?: { multiplier: number; duration: number }; // Temporary boost
    message: string;
  };
}

export const RANDOM_EVENTS: RandomEvent[] = [
  // ===== COMMON EVENTS (Frequent, small bonuses) =====
  {
    id: 'flash-sale',
    name: 'Flash Sale',
    description: 'Limited time discount on next purchase!',
    icon: '💸',
    rarity: 'common',
    duration: 15,
    cooldown: 180,
    effect: (_state) => ({
      message: '💸 Flash Sale! Next purchase 50% off!',
      // TODO: Implement temporary discount flag
    }),
  },

  {
    id: 'hydration-break',
    name: 'Hydration Break',
    description: 'Remember to drink water!',
    icon: '💧',
    rarity: 'common',
    duration: 20,
    cooldown: 240,
    effect: (state) => ({
      hydrationReduction: Math.min(state.hydrationDebt * 0.5, 50),
      message: '💧 Hydration Break! Dehydration -50%',
    }),
  },

  {
    id: 'deep-breath',
    name: 'Deep Breath',
    description: 'Take a moment to center yourself',
    icon: '🌬️',
    rarity: 'common',
    duration: 15,
    cooldown: 200,
    effect: (state) => ({
      chaosReduction: Math.min(state.chaos * 0.3, 30),
      strainReduction: Math.min(state.strain * 0.2, 20),
      message: '🌬️ Deep Breath! Chaos -30%, Strain -20%',
    }),
  },

  {
    id: 'lucky-find',
    name: 'Lucky Find',
    description: 'Found some vibes lying around!',
    icon: '🍀',
    rarity: 'common',
    duration: 12,
    cooldown: 150,
    effect: (state) => ({
      vibesBonus: Math.floor(state.vibes * 0.05 + 100),
      message: '🍀 Lucky Find! +5% vibes!',
    }),
  },

  // ===== RARE EVENTS (Occasional, moderate bonuses) =====
  {
    id: 'the-hookup',
    name: 'The Hook-Up',
    description: 'Friend comes through with the goods',
    icon: '📱',
    rarity: 'rare',
    duration: 20,
    cooldown: 600,
    unlockCondition: {
      minKnowledgeLevel: 1,
    },
    effect: (state) => {
      // Give a random substance they already own (or first one if none)
      const ownedSubstances = Object.keys(state.substances).filter(id => state.substances[id] > 0);
      const randomSubstance = ownedSubstances.length > 0
        ? ownedSubstances[Math.floor(Math.random() * ownedSubstances.length)]
        : 'alcohol';

      return {
        freeSubstance: randomSubstance,
        message: `📱 The Hook-Up! Your friend came through with free ${getSubstance(randomSubstance)?.name}!`,
      };
    },
  },

  {
    id: 'eureka-moment',
    name: 'Eureka Moment',
    description: 'Sudden burst of insight!',
    icon: '💡',
    rarity: 'rare',
    duration: 15,
    cooldown: 900,
    unlockCondition: {
      minKnowledgeLevel: 2,
    },
    effect: (state) => ({
      vibesBonus: Math.floor(state.vibes * 0.15),
      energyBonus: 25,
      message: '💡 Eureka Moment! +15% vibes and +25 energy!',
    }),
  },

  {
    id: 'power-nap',
    name: 'Power Nap',
    description: 'Quick 20-minute recharge',
    icon: '😴',
    rarity: 'rare',
    duration: 18,
    cooldown: 480,
    effect: (_state) => ({
      energyBonus: 40,
      strainReduction: 30,
      message: '😴 Power Nap! +40 energy, -30 strain',
    }),
  },

  {
    id: 'vibe-surge',
    name: 'Vibe Surge',
    description: 'Everything is clicking!',
    icon: '⚡',
    rarity: 'rare',
    duration: 25,
    cooldown: 420,
    effect: (_state) => ({
      productionBoost: { multiplier: 2, duration: 60 },
      message: '⚡ Vibe Surge! Production x2 for 60 seconds!',
    }),
  },

  // ===== EPIC EVENTS (Rare, major bonuses) =====
  {
    id: 'clean-slate',
    name: 'Clean Slate',
    description: 'Reset all negative effects!',
    icon: '✨',
    rarity: 'epic',
    duration: 20,
    cooldown: 1200,
    unlockCondition: {
      minKnowledgeLevel: 3,
    },
    effect: (state) => ({
      chaosReduction: state.chaos,
      strainReduction: state.strain * 0.8,
      hydrationReduction: state.hydrationDebt * 0.7,
      message: '✨ Clean Slate! All chaos removed, strain -80%, hydration -70%!',
    }),
  },

  {
    id: 'dopamine-jackpot',
    name: 'Dopamine Jackpot',
    description: 'Everything feels amazing!',
    icon: '🎰',
    rarity: 'epic',
    duration: 18,
    cooldown: 900,
    unlockCondition: {
      minVibes: 10000,
    },
    effect: (_state) => ({
      vibesMultiplier: 1.25,
      energyBonus: 50,
      message: '🎰 Dopamine Jackpot! +25% total vibes and +50 energy!',
    }),
  },

  {
    id: 'flow-state',
    name: 'Flow State',
    description: 'Perfect harmony achieved',
    icon: '🌊',
    rarity: 'epic',
    duration: 30,
    cooldown: 1800,
    unlockCondition: {
      minKnowledgeLevel: 4,
    },
    effect: (state) => ({
      productionBoost: { multiplier: 3, duration: 120 },
      chaosReduction: state.chaos * 0.5,
      message: '🌊 Flow State! Production x3 for 2 minutes, chaos -50%!',
    }),
  },

  // ===== LEGENDARY EVENTS (Very rare, game-changing) =====
  {
    id: 'divine-intervention',
    name: 'Divine Intervention',
    description: 'The universe smiles upon you',
    icon: '👼',
    rarity: 'legendary',
    duration: 30,
    cooldown: 3600,
    unlockCondition: {
      minKnowledgeLevel: 5,
      minVibes: 100000,
    },
    effect: (state) => ({
      vibesMultiplier: 1.5,
      energyBonus: 100,
      chaosReduction: state.chaos,
      strainReduction: state.strain,
      message: '👼 Divine Intervention! +50% vibes, full energy, all chaos & strain cleared!',
    }),
  },

  {
    id: 'bad-batch-warning',
    name: 'Bad Batch Warning',
    description: 'Dealer warns about sketchy product',
    icon: '⚠️',
    rarity: 'rare',
    duration: 25,
    cooldown: 600,
    unlockCondition: {
      minKnowledgeLevel: 2,
    },
    effect: (_state) => ({
      // This is actually a warning - player SHOULD click to avoid it
      message: '⚠️ Bad Batch Warning! Click to avoid - next purchase will have 2x chaos/strain if ignored!',
      // TODO: Implement temporary debuff flag
    }),
  },
];

/**
 * Random Event Manager - Handles spawning and tracking of events
 */
export class RandomEventManager {
  private activeEvent: { event: RandomEvent; spawnTime: number; clickable: boolean } | null = null;
  private lastEventSpawn: number = 0;
  private eventCooldowns: Map<string, number> = new Map();
  private nextEventCheckTime: number = 0;

  // Configuration
  private baseSpawnInterval = 120; // Check for new event every 2 minutes
  private spawnChance = 0.3; // 30% chance when checking

  constructor() {}

  /**
   * Update event state each tick
   */
  update(state: GameState, currentTime: number): void {
    // Check if active event has expired
    if (this.activeEvent) {
      const elapsed = currentTime - this.activeEvent.spawnTime;
      if (elapsed > this.activeEvent.event.duration * 1000) {
        // Event expired without being clicked
        this.activeEvent = null;
      }
    }

    // Update cooldowns
    this.eventCooldowns.forEach((cooldownEnd, eventId) => {
      if (currentTime >= cooldownEnd) {
        this.eventCooldowns.delete(eventId);
      }
    });

    // Try to spawn new event if none active
    if (!this.activeEvent && currentTime >= this.nextEventCheckTime) {
      this.trySpawnEvent(state, currentTime);
      this.nextEventCheckTime = currentTime + this.baseSpawnInterval * 1000;
    }
  }

  /**
   * Attempt to spawn a random event
   */
  private trySpawnEvent(state: GameState, currentTime: number): void {
    // Roll for spawn
    if (Math.random() > this.spawnChance) return;

    // Get eligible events
    const eligible = RANDOM_EVENTS.filter(event => {
      // Check cooldown
      if (this.eventCooldowns.has(event.id)) return false;

      // Check unlock conditions
      if (event.unlockCondition) {
        const cond = event.unlockCondition;
        if (cond.minKnowledgeLevel && state.knowledgeLevel < cond.minKnowledgeLevel) return false;
        if (cond.minVibes && state.vibes < cond.minVibes) return false;
        if (cond.minNightsCompleted && state.nightsCompleted < cond.minNightsCompleted) return false;
        if (cond.requiresSubstance && !state.substances[cond.requiresSubstance]) return false;
      }

      return true;
    });

    if (eligible.length === 0) return;

    // Weight by rarity (legendary = 1x, epic = 3x, rare = 6x, common = 12x)
    const rarityWeights = { legendary: 1, epic: 3, rare: 6, common: 12 };
    const weightedEvents: RandomEvent[] = [];
    eligible.forEach(event => {
      const weight = rarityWeights[event.rarity];
      for (let i = 0; i < weight; i++) {
        weightedEvents.push(event);
      }
    });

    // Pick random event
    const chosen = weightedEvents[Math.floor(Math.random() * weightedEvents.length)];

    this.activeEvent = {
      event: chosen,
      spawnTime: currentTime,
      clickable: true,
    };

    this.lastEventSpawn = currentTime;
  }

  /**
   * Activate the current event
   */
  activateEvent(state: GameState): { success: boolean; message?: string } {
    if (!this.activeEvent || !this.activeEvent.clickable) {
      return { success: false };
    }

    const event = this.activeEvent.event;
    const result = event.effect(state);

    // Apply effects
    if (result.vibesBonus) state.vibes += result.vibesBonus;
    if (result.vibesMultiplier) state.vibes = Math.floor(state.vibes * result.vibesMultiplier);
    if (result.energyBonus) state.energy = Math.min(100, state.energy + result.energyBonus);
    if (result.chaosReduction) state.chaos = Math.max(0, state.chaos - result.chaosReduction);
    if (result.strainReduction) state.strain = Math.max(0, state.strain - result.strainReduction);
    if (result.hydrationReduction) state.hydrationDebt = Math.max(0, state.hydrationDebt - result.hydrationReduction);

    if (result.freeSubstance) {
      state.substances[result.freeSubstance] = (state.substances[result.freeSubstance] || 0) + 1;
    }

    // TODO: Handle productionBoost (requires new state field)

    // Add to log
    state.log.push({
      timestamp: 3600 - state.timeRemaining,
      message: result.message,
      type: 'info',
    });

    // Set cooldown
    this.eventCooldowns.set(event.id, Date.now() + event.cooldown * 1000);

    // Clear active event
    this.activeEvent = null;

    return { success: true, message: result.message };
  }

  /**
   * Get current active event for display
   */
  getActiveEvent(): { event: RandomEvent; timeRemaining: number } | null {
    if (!this.activeEvent) return null;

    const elapsed = Date.now() - this.activeEvent.spawnTime;
    const remaining = Math.max(0, this.activeEvent.event.duration - elapsed / 1000);

    return {
      event: this.activeEvent.event,
      timeRemaining: remaining,
    };
  }

  /**
   * Serialize for save/load
   */
  serialize(): any {
    return {
      activeEvent: this.activeEvent,
      lastEventSpawn: this.lastEventSpawn,
      eventCooldowns: Array.from(this.eventCooldowns.entries()),
      nextEventCheckTime: this.nextEventCheckTime,
    };
  }

  /**
   * Deserialize from save
   */
  deserialize(data: any): void {
    if (!data) return;

    this.activeEvent = data.activeEvent;
    this.lastEventSpawn = data.lastEventSpawn || 0;
    this.nextEventCheckTime = data.nextEventCheckTime || 0;

    if (data.eventCooldowns) {
      this.eventCooldowns = new Map(data.eventCooldowns);
    }
  }
}
