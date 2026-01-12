import { GameState, OrganComplaint } from './types';

// CURSED FEATURE: Your organs file formal complaints
// Unlocks at knowledge level 3

let complaintIdCounter = 0;

const ORGAN_COOLDOWNS: Record<string, number> = {
  liver: 300,    // 5 minutes
  brain: 400,    // 6.7 minutes
  kidneys: 350,  // 5.8 minutes
  heart: 450,    // 7.5 minutes
  lungs: 380,    // 6.3 minutes
};

/**
 * Generate organ complaints based on game state
 */
export function checkOrganComplaints(state: GameState, _deltaTime: number): GameState {
  // Feature locked until knowledge level 3
  if (state.knowledgeLevel < 3) return state;

  // Unlock feature
  if (!state.unlockedFeatures.includes('organCommentary')) {
    state.unlockedFeatures.push('organCommentary');
    state.log.push({
      timestamp: 3600 - state.timeRemaining,
      message: '🫀 Your organs have unionized. They will now file complaints.',
      type: 'warning',
    });
  }

  const currentTime = Date.now() / 1000;

  // Check each organ
  checkLiverComplaint(state, currentTime);
  checkBrainComplaint(state, currentTime);
  checkKidneysComplaint(state, currentTime);
  checkHeartComplaint(state, currentTime);
  checkLungsComplaint(state, currentTime);

  // Keep only last 20 complaints
  if (state.organComplaints.length > 20) {
    state.organComplaints = state.organComplaints.slice(-20);
  }

  return state;
}

function addComplaint(
  state: GameState,
  organ: string,
  message: string,
  severity: 'mild' | 'concerning' | 'critical'
): void {
  const complaint: OrganComplaint = {
    id: `complaint-${complaintIdCounter++}`,
    organ,
    message,
    severity,
    timestamp: Date.now() / 1000,
  };

  state.organComplaints.push(complaint);
}

function checkLiverComplaint(state: GameState, currentTime: number): void {
  const alcoholCount = state.substances.alcohol || 0;
  const lastComplaint = state.organComplaints.filter(c => c.organ === 'liver').slice(-1)[0];
  const lastTime = lastComplaint ? lastComplaint.timestamp : 0;

  if (currentTime - lastTime < ORGAN_COOLDOWNS.liver) return;

  // Mild: 5+ alcohol
  if (alcoholCount >= 5 && alcoholCount < 15) {
    addComplaint(state, 'liver', 'I mean, I\'ll process it, but I\'m keeping a log.', 'mild');
  }
  // Concerning: 15+ alcohol
  else if (alcoholCount >= 15 && alcoholCount < 30) {
    addComplaint(state, 'liver', 'This is officially a hostile work environment.', 'concerning');
  }
  // Critical: 30+ alcohol
  else if (alcoholCount >= 30) {
    addComplaint(state, 'liver', 'I\'m filing for workers\' compensation. See you in court.', 'critical');
  }
}

function checkBrainComplaint(state: GameState, currentTime: number): void {
  const lastComplaint = state.organComplaints.filter(c => c.organ === 'brain').slice(-1)[0];
  const lastTime = lastComplaint ? lastComplaint.timestamp : 0;

  if (currentTime - lastTime < ORGAN_COOLDOWNS.brain) return;

  // Memory damage
  if (state.memoryIntegrity < 30) {
    addComplaint(state, 'brain', 'I\'ve forgotten what we\'re supposed to be remembering.', 'critical');
  }
  else if (state.memoryIntegrity < 60) {
    addComplaint(state, 'brain', 'Some files may have been corrupted. Just FYI.', 'concerning');
  }

  // High stimulant use
  const stimCount = state.substances.stimulant || 0;
  if (stimCount >= 20) {
    addComplaint(state, 'brain', 'We haven\'t slept in what feels like forever because it HAS been forever.', 'critical');
  }
  else if (stimCount >= 10) {
    addComplaint(state, 'brain', 'The neurons are forming a picket line. They demand rest.', 'concerning');
  }

  // Psychedelic use
  const psychCount = state.substances.psychedelic || 0;
  if (psychCount >= 3) {
    addComplaint(state, 'brain', 'Reality settings have been permanently altered. No rollback available.', 'concerning');
  }
  else if (psychCount >= 1) {
    addComplaint(state, 'brain', 'I\'m experiencing new colors. I didn\'t know we could DO that.', 'mild');
  }
}

function checkKidneysComplaint(state: GameState, currentTime: number): void {
  const lastComplaint = state.organComplaints.filter(c => c.organ === 'kidneys').slice(-1)[0];
  const lastTime = lastComplaint ? lastComplaint.timestamp : 0;

  if (currentTime - lastTime < ORGAN_COOLDOWNS.kidneys) return;

  // Hydration debt
  if (state.hydrationDebt > 80) {
    addComplaint(state, 'kidneys', 'WATER. NOW. This is not a negotiation.', 'critical');
  }
  else if (state.hydrationDebt > 50) {
    addComplaint(state, 'kidneys', 'We\'re filtering dust at this point. Literally dust.', 'concerning');
  }
  else if (state.hydrationDebt > 30) {
    addComplaint(state, 'kidneys', 'A glass of water would be nice. Just saying.', 'mild');
  }

  // Heavy substance use
  const totalSubstances = Object.values(state.substances).reduce((sum, count) => sum + count, 0);
  if (totalSubstances > 50) {
    addComplaint(state, 'kidneys', 'We didn\'t sign up for THIS much overtime.', 'critical');
  }
}

function checkHeartComplaint(state: GameState, currentTime: number): void {
  const lastComplaint = state.organComplaints.filter(c => c.organ === 'heart').slice(-1)[0];
  const lastTime = lastComplaint ? lastComplaint.timestamp : 0;

  if (currentTime - lastTime < ORGAN_COOLDOWNS.heart) return;

  // High stimulant use
  const stimCount = state.substances.stimulant || 0;
  if (stimCount >= 25) {
    addComplaint(state, 'heart', 'MY BPM IS A CRY FOR HELP', 'critical');
  }
  else if (stimCount >= 15) {
    addComplaint(state, 'heart', 'I\'m beating SO fast. Is this what anxiety feels like?', 'concerning');
  }
  else if (stimCount >= 5) {
    addComplaint(state, 'heart', 'This pace is... energetic. Concerningly energetic.', 'mild');
  }

  // Strain
  if (state.strain > 120) {
    addComplaint(state, 'heart', 'Load-bearing capacity exceeded. Please advise.', 'critical');
  }
}

function checkLungsComplaint(state: GameState, currentTime: number): void {
  const lastComplaint = state.organComplaints.filter(c => c.organ === 'lungs').slice(-1)[0];
  const lastTime = lastComplaint ? lastComplaint.timestamp : 0;

  if (currentTime - lastTime < ORGAN_COOLDOWNS.lungs) return;

  // General chaos
  if (state.chaos > 85) {
    addComplaint(state, 'lungs', 'Remembering to breathe is now a MANUAL process. Great.', 'concerning');
  }

  // Sedative use
  const sedCount = state.substances.sedative || 0;
  if (sedCount >= 10) {
    addComplaint(state, 'lungs', 'Breathing depth: minimal. Breathing enthusiasm: also minimal.', 'critical');
  }
  else if (sedCount >= 5) {
    addComplaint(state, 'lungs', 'We\'re operating at reduced capacity. Very reduced.', 'concerning');
  }
}

/**
 * Get organ health emoji
 */
export function getOrganEmoji(organ: string): string {
  const emojiMap: Record<string, string> = {
    liver: '🫘',
    brain: '🧠',
    kidneys: '🫘',
    heart: '🫀',
    lungs: '🫁',
  };
  return emojiMap[organ] || '🏥';
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: 'mild' | 'concerning' | 'critical'): string {
  switch (severity) {
    case 'mild': return '#ffeb3b';
    case 'concerning': return '#ff9800';
    case 'critical': return '#f44336';
  }
}
