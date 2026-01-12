import { GameState } from '../game/types';
import { formatTime } from '../utils/formatter';

interface LogPanelProps {
  state: GameState;
}

export function LogPanel({ state }: LogPanelProps) {
  // Show most recent entries first (reverse chronological)
  const maxEntries = state.compactLog ? 8 : 15;
  const recentLogs = [...state.log].reverse().slice(0, maxEntries);

  const isCorruptionEnabled = !state.disableLogCorruption;

  return (
    <div className={`log-panel ${state.compactLog ? 'compact' : ''} ${state.showLogTimestamps ? '' : 'hide-time'}`}>
      <h3>📜 LOG</h3>
      <div className="log-entries">
        {recentLogs.map((entry, index) => {
          const timeDisplay = isCorruptionEnabled && (entry.corrupted || state.memoryIntegrity < 30)
            ? '~??:??'
            : formatTime(entry.timestamp);

          const messageDisplay = isCorruptionEnabled && (entry.corrupted || (state.memoryIntegrity < 50 && Math.random() > 0.7))
            ? '[CORRUPTED] ' + entry.message.substring(0, Math.floor(Math.random() * entry.message.length))
            : entry.message;

          return (
            <div
              key={`${entry.timestamp}-${index}`}
              className={`log-entry log-${entry.type} ${entry.corrupted ? 'corrupted' : ''}`}
            >
              {state.showLogTimestamps && <span className="log-time">{timeDisplay}</span>}
              <span className="log-message">{messageDisplay}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
