import { GameState } from '../game/types';
import { formatNumber, formatTime, getBarFill, getConfidenceEmoji, getConfidenceLabel } from '../utils/formatter';

interface StatPanelProps {
  state: GameState;
  compact?: boolean;
}

export function StatPanel({ state, compact = false }: StatPanelProps) {
  const distorted = state.distortionLevel >= 2;
  const maybeWrong = distorted && Math.random() > 0.7;

  const displayedEnergy = maybeWrong ? state.energy * (0.9 + Math.random() * 0.2) : state.energy;
  const displayedChaos = maybeWrong ? state.chaos * (0.9 + Math.random() * 0.2) : state.chaos;

  if (compact) {
    // Compact mode for header - just show bars horizontally
    return (
      <div className="stat-panel-compact">
        <div className="header-stat">
          <span className="header-stat-label">Energy</span>
          <div className="compact-stat-bar">
            <div
              className={`stat-bar-fill ${displayedEnergy < 20 ? 'danger' : displayedEnergy < 50 ? 'warning' : 'normal'}`}
              style={{ width: `${getBarFill(displayedEnergy, 100)}%` }}
            />
          </div>
          <span className="header-stat-value">{Math.floor(displayedEnergy)}</span>
        </div>

        <div className="header-stat">
          <span className="header-stat-label">Chaos</span>
          <div className="compact-stat-bar">
            <div
              className={`stat-bar-fill ${displayedChaos > 70 ? 'danger' : displayedChaos < 30 ? 'low' : 'normal'}`}
              style={{ width: `${getBarFill(displayedChaos, 100)}%` }}
            />
          </div>
          <span className="header-stat-value">{Math.floor(displayedChaos)}</span>
        </div>

        <div className="header-stat">
          <span className="header-stat-label">{getConfidenceEmoji(state.confidence)} Conf</span>
          <span className="header-stat-value">{Math.floor(state.confidence)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-panel">
      <div className="stat-row">
        <span className="stat-label">Vibes:</span>
        <span className="stat-value vibes">{formatNumber(state.vibes)}</span>
      </div>

      <div className="stat-row">
        <div className="stat-bar-container">
          <div className="stat-bar-label">
            <span>Energy</span>
            <span>{Math.floor(displayedEnergy)}/100</span>
          </div>
          <div className="stat-bar">
            <div
              className={`stat-bar-fill ${displayedEnergy < 20 ? 'danger' : displayedEnergy < 50 ? 'warning' : 'normal'}`}
              style={{ width: `${getBarFill(displayedEnergy, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-bar-container">
          <div className="stat-bar-label">
            <span>Chaos</span>
            <span>{Math.floor(displayedChaos)}/100</span>
          </div>
          <div className="stat-bar">
            <div
              className={`stat-bar-fill ${displayedChaos > 70 ? 'danger' : displayedChaos < 30 ? 'low' : 'normal'}`}
              style={{ width: `${getBarFill(displayedChaos, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="stat-row confidence-row">
        <span className="stat-label">
          {getConfidenceEmoji(state.confidence)} Confidence:
        </span>
        <span className="stat-value">{Math.floor(state.confidence)}</span>
        <span className="confidence-label">{getConfidenceLabel(state.confidence)}</span>
      </div>

      <div className="stat-row time-row">
        <span className="stat-label">⏱ Time Remaining:</span>
        <span className="stat-value time">{formatTime(state.timeRemaining)}</span>
      </div>
    </div>
  );
}
