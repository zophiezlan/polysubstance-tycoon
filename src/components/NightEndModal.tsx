import { GameState } from '../game/types';
import { formatNumber } from '../utils/formatter';
import { calculateExperience, getKnowledgeLevel, getNextLevelInfo } from '../game/prestige';

interface NightEndModalProps {
  state: GameState;
  onNewNight: () => void;
}

export function NightEndModal({ state, onNewNight }: NightEndModalProps) {
  const xpGained = calculateExperience(state, state.hasCollapsed);
  const newTotalXP = state.experience + xpGained;
  const newLevel = getKnowledgeLevel(newTotalXP);
  const leveledUp = newLevel > state.knowledgeLevel;
  const nextLevel = getNextLevelInfo(newLevel);

  const canRemember = state.memoryIntegrity > 10;

  return (
    <div className="modal-overlay">
      <div className="modal night-end-modal">
        <h2>{state.hasCollapsed ? '💀 COLLAPSE' : '🌙 NIGHT COMPLETE'}</h2>

        {canRemember ? (
          <div className="modal-content">
            <div className="summary-stat">
              <span>Final Vibes:</span>
              <span className="stat-value">{formatNumber(state.vibes)}</span>
            </div>

            {state.hasCollapsed && (
              <div className="collapse-message">
                The Night has ended you. Strain exceeded tolerance.
              </div>
            )}

            <div className="summary-stat">
              <span>Experience Gained:</span>
              <span className="stat-value">+{xpGained} XP</span>
            </div>

            {leveledUp && (
              <div className="level-up-message">
                🎉 KNOWLEDGE LEVEL UP! Now Level {newLevel}
              </div>
            )}

            <div className="summary-stat">
              <span>Total Experience:</span>
              <span className="stat-value">{newTotalXP} XP</span>
            </div>

            {nextLevel && (
              <div className="next-level-info">
                <div>Next unlock: {nextLevel.name}</div>
                <div className="xp-progress">
                  {newTotalXP} / {nextLevel.xpRequired} XP
                </div>
              </div>
            )}

            <div className="night-stats">
              <div>Nights completed: {state.nightsCompleted + 1}</div>
              <div>Achievements unlocked: {state.achievements.length}</div>
            </div>
          </div>
        ) : (
          <div className="modal-content">
            <div className="memory-loss-message">
              Your memory is too damaged to recall the details.
              <br />
              You think something happened?
              <br />
              The data is... mostly gone.
            </div>
            <div className="summary-stat">
              <span>Experience Gained:</span>
              <span className="stat-value">+{Math.floor(xpGained * 0.5)} XP (reduced due to memory loss)</span>
            </div>
          </div>
        )}

        <button className="modal-button primary" onClick={onNewNight}>
          Start a New Night
        </button>
      </div>
    </div>
  );
}
