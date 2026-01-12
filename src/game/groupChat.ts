import { GameState, GroupChatMessage } from './types';

// PROGRESSIVE DISCLOSURE: Group chat unlocks at knowledge level 2
// Friends send messages based on your substance use and game state

const FRIEND_NAMES = [
  'Alex', 'Jordan', 'Sam', 'Casey', 'Taylor', 'Morgan',
  'Riley', 'Avery', 'Quinn', 'Blake'
];

let messageIdCounter = 0;

interface ChatTrigger {
  condition: (state: GameState) => boolean;
  messages: Array<{
    sender: string;
    text: string;
    substance?: string;
  }>;
  cooldown: number; // Minimum seconds between triggers
  lastTriggered?: number;
}

const CHAT_TRIGGERS: ChatTrigger[] = [
  // First substance purchase
  {
    condition: (state) => Object.keys(state.substances).length === 1 && Object.values(state.substances)[0] === 1,
    messages: [
      { sender: 'Alex', text: 'yo you up?' },
      { sender: 'Alex', text: 'wanna hang out tonight?' },
    ],
    cooldown: 0,
  },

  // After 100 clicks
  {
    condition: (state) => state.totalClicks === 100,
    messages: [
      { sender: 'Jordan', text: 'you good?' },
    ],
    cooldown: 0,
  },

  // Heavy alcohol use
  {
    condition: (state) => (state.substances.alcohol || 0) >= 10,
    messages: [
      { sender: 'Sam', text: 'bro maybe slow down a bit' },
      { sender: 'Sam', text: 'just saying' },
    ],
    cooldown: 600,
  },

  // First stimulant
  {
    condition: (state) => (state.substances.stimulant || 0) === 1,
    messages: [
      { sender: 'Casey', text: 'DUDE' },
      { sender: 'Casey', text: 'I JUST REALIZED SOMETHING' },
      { sender: 'Casey', text: 'EVERYTHING IS CONNECTED' },
    ],
    cooldown: 0,
  },

  // Heavy stimulant use
  {
    condition: (state) => (state.substances.stimulant || 0) >= 15,
    messages: [
      { sender: 'Taylor', text: 'yo when did you last sleep' },
      { sender: 'Taylor', text: 'this isn\'t a flex' },
    ],
    cooldown: 600,
  },

  // First empathogen
  {
    condition: (state) => (state.substances.empathogen || 0) === 1,
    messages: [
      { sender: 'Morgan', text: 'i love you so much' },
      { sender: 'Morgan', text: 'like genuinely you\'re such a good person' },
      { sender: 'Morgan', text: 'i don\'t say it enough but you really matter to me' },
    ],
    cooldown: 0,
  },

  // Multiple substances active
  {
    condition: (state) => Object.keys(state.substances).filter(id => state.substances[id] > 0).length >= 3,
    messages: [
      { sender: 'Riley', text: 'mixing that many things seems...' },
      { sender: 'Riley', text: 'ambitious' },
    ],
    cooldown: 900,
  },

  // High chaos
  {
    condition: (state) => state.chaos > 80,
    messages: [
      { sender: 'Avery', text: 'you texted me 47 times' },
      { sender: 'Avery', text: 'i was asleep for 3 hours' },
    ],
    cooldown: 1200,
  },

  // Low energy
  {
    condition: (state) => state.energy < 20,
    messages: [
      { sender: 'Quinn', text: 'take a nap challenge (impossible)' },
    ],
    cooldown: 800,
  },

  // First collapse
  {
    condition: (state) => state.hasCollapsed && state.nightsCompleted === 0,
    messages: [
      { sender: 'Blake', text: 'hey you okay?' },
      { sender: 'Blake', text: 'you stopped responding' },
    ],
    cooldown: 0,
  },

  // High confidence (delusional)
  {
    condition: (state) => state.confidence > 90,
    messages: [
      { sender: 'Alex', text: 'your last message was just "I\'VE FIGURED IT OUT"' },
      { sender: 'Alex', text: 'figured what out' },
      { sender: 'Alex', text: 'hello' },
    ],
    cooldown: 1000,
  },

  // Psychedelic use
  {
    condition: (state) => (state.substances.psychedelic || 0) >= 1,
    messages: [
      { sender: 'Jordan', text: 'how\'s the journey' },
      { sender: 'Jordan', text: 'remember: you took drugs' },
      { sender: 'Jordan', text: 'this is temporary' },
    ],
    cooldown: 0,
  },

  // Research chemicals
  {
    condition: (state) => (state.substances.research || 0) >= 1,
    messages: [
      { sender: 'Sam', text: 'did you at least test that' },
      { sender: 'Sam', text: 'no you didn\'t' },
      { sender: 'Sam', text: 'of course you didn\'t' },
    ],
    cooldown: 0,
  },

  // Late game absurdity
  {
    condition: (state) => (state.substances.forbidden || 0) >= 1,
    messages: [
      { sender: 'Casey', text: 'what the fuck is that' },
      { sender: 'Casey', text: 'where did you even GET that' },
      { sender: 'Taylor', text: 'guys i think we should call someone' },
      { sender: 'Morgan', text: 'call who' },
      { sender: 'Morgan', text: 'the substance police?' },
    ],
    cooldown: 0,
  },

  // Endgame
  {
    condition: (state) => state.totalVibesEarned > 1000000000,
    messages: [
      { sender: 'Riley', text: 'you\'ve been online for 8 hours' },
      { sender: 'Riley', text: 'what are you doing' },
      { sender: 'Morgan', text: 'optimizing' },
      { sender: 'Riley', text: 'optimizing what' },
      { sender: 'Morgan', text: 'everything' },
    ],
    cooldown: 3600,
  },
];

/**
 * Check triggers and generate new group chat messages
 */
export function checkGroupChatTriggers(state: GameState, deltaTime: number): GameState {
  // Feature locked until knowledge level 2
  if (state.knowledgeLevel < 2) return state;

  // Unlock feature
  if (!state.unlockedFeatures.includes('groupChat')) {
    state.unlockedFeatures.push('groupChat');
    state.log.push({
      timestamp: 3600 - state.timeRemaining,
      message: '📱 Group Chat unlocked! Your friends are checking in...',
      type: 'achievement',
    });
  }

  const currentTime = Date.now() / 1000;

  for (const trigger of CHAT_TRIGGERS) {
    // Check cooldown
    if (trigger.lastTriggered && (currentTime - trigger.lastTriggered) < trigger.cooldown) {
      continue;
    }

    // Check condition
    if (trigger.condition(state)) {
      // Add messages
      for (const msg of trigger.messages) {
        const newMessage: GroupChatMessage = {
          id: `msg-${messageIdCounter++}`,
          sender: msg.sender,
          message: msg.text,
          timestamp: currentTime,
          substance: msg.substance,
          read: false,
        };

        state.groupChatMessages.push(newMessage);
      }

      // Update last triggered
      trigger.lastTriggered = currentTime;

      // Only trigger one at a time
      break;
    }
  }

  // Keep only last 50 messages
  if (state.groupChatMessages.length > 50) {
    state.groupChatMessages = state.groupChatMessages.slice(-50);
  }

  return state;
}

/**
 * Mark all messages as read
 */
export function markMessagesAsRead(state: GameState): GameState {
  state.groupChatMessages.forEach(msg => msg.read = true);
  return state;
}

/**
 * Get unread message count
 */
export function getUnreadCount(state: GameState): number {
  return state.groupChatMessages.filter(msg => !msg.read).length;
}
