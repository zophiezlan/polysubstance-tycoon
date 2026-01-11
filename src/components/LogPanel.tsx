import { GameState } from '../game/types';
import { formatTime } from '../utils/formatter';

interface LogPanelProps {
  state: GameState;
}

export function LogPanel({ state }: LogPanelProps) {
  // Show most recent entries first (reverse chronological)
  const recentLogs = [...state.log].reverse().slice(0, 15);

  return (
    <div className="log-panel">
      <h3>📜 LOG</h3>
      <div className="log-entries">
        {recentLogs.map((entry, index) => {
          const timeDisplay = entry.corrupted || state.memoryIntegrity < 30
            ? '~??:??'
            : formatTime(entry.timestamp);

          const messageDisplay = entry.corrupted || (state.memoryIntegrity < 50 && Math.random() > 0.7)
            ? '[CORRUPTED] ' + entry.message.substring(0, Math.floor(Math.random() * entry.message.length))
            : entry.message;

          return (
            <div
              key={`${entry.timestamp}-${index}`}
              className={`log-entry log-${entry.type} ${entry.corrupted ? 'corrupted' : ''}`}
            >
              <span className="log-time">{timeDisplay}</span>
              <span className="log-message">{messageDisplay}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
