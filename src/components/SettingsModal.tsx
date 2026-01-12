import { GameState } from '../game/types';
import { formatNumber, formatTime } from '../utils/formatter';

interface SettingsModalProps {
  state: GameState;
  onClose: () => void;
  onToggleDistortion: () => void;
  onToggleMotion: () => void;
  onToggleNotifications: () => void;
  onToggleFloatingNumbers: () => void;
  onToggleCompactLog: () => void;
  onToggleLogTimestamps: () => void;
  onToggleLogCorruption: () => void;
  onChangeFontSize: (size: 'small' | 'default' | 'large') => void;
  onReset: () => void;
}

export function SettingsModal({
  state,
  onClose,
  onToggleDistortion,
  onToggleMotion,
  onToggleNotifications,
  onToggleFloatingNumbers,
  onToggleCompactLog,
  onToggleLogTimestamps,
  onToggleLogCorruption,
  onChangeFontSize,
  onReset,
}: SettingsModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal settings-modal">
        <h2>⚙️ SETTINGS</h2>

        <div className="modal-content">
          <div className="settings-section">
            <h3>Accessibility</h3>

            <label className="setting-item">
              <input
                type="checkbox"
                checked={state.disableDistortion}
                onChange={onToggleDistortion}
              />
              <span>Disable UI Distortion Effects</span>
            </label>

            <label className="setting-item">
              <input
                type="checkbox"
                checked={state.reducedMotion}
                onChange={onToggleMotion}
              />
              <span>Reduced Motion</span>
            </label>

            <div className="setting-item">
              <span>Font Size:</span>
              <div className="font-size-buttons">
                <button
                  className={state.fontSize === 'small' ? 'active' : ''}
                  onClick={() => onChangeFontSize('small')}
                >
                  Small
                </button>
                <button
                  className={state.fontSize === 'default' ? 'active' : ''}
                  onClick={() => onChangeFontSize('default')}
                >
                  Default
                </button>
                <button
                  className={state.fontSize === 'large' ? 'active' : ''}
                  onClick={() => onChangeFontSize('large')}
                >
                  Large
                </button>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Notifications & UI</h3>

            <label className="setting-item">
              <input
                type="checkbox"
                checked={state.muteNotifications}
                onChange={onToggleNotifications}
              />
              <span>Mute Pop-up Notifications</span>
            </label>
            <div className="setting-description">
              Hide achievement toasts and milestone pop-ups.
            </div>

            <label className="setting-item">
              <input
                type="checkbox"
                checked={state.showFloatingNumbers}
                onChange={onToggleFloatingNumbers}
              />
              <span>Show Floating Click Numbers</span>
            </label>
            <div className="setting-description">
              Toggle the on-click vibe number bursts.
            </div>

            <label className="setting-item">
              <input
                type="checkbox"
                checked={state.compactLog}
                onChange={onToggleCompactLog}
              />
              <span>Compact Log View</span>
            </label>
            <div className="setting-description">
              Tighter spacing and fewer entries for quick scanning.
            </div>

            <label className="setting-item">
              <input
                type="checkbox"
                checked={state.showLogTimestamps}
                onChange={onToggleLogTimestamps}
              />
              <span>Show Log Timestamps</span>
            </label>
            <div className="setting-description">
              Toggle the time column in the log panel.
            </div>

            <label className="setting-item">
              <input
                type="checkbox"
                checked={state.disableLogCorruption}
                onChange={onToggleLogCorruption}
              />
              <span>Stabilize Log Readability</span>
            </label>
            <div className="setting-description">
              Prevent memory corruption effects in log entries.
            </div>
          </div>

          <div className="settings-section">
            <h3>Resources</h3>
            <p className="resource-text">
              <strong>National Alcohol and Other Drug Hotline</strong>
              <br />
              📞 1800 250 015
            </p>
            <p className="disclaimer-text">
              This is satirical systems fiction. It cannot tell you what's safe.
              Real life has no save states.
            </p>
          </div>

          <div className="settings-section">
            <h3>Progress</h3>
            <p>
              Level: {state.knowledgeLevel}<br />
              Total XP: {state.experience}<br />
              Nights: {state.nightsCompleted}<br />
              Achievements: {state.achievements.length}
            </p>
            <button className="danger-button" onClick={onReset}>
              Reset All Progress
            </button>
          </div>

          <div className="settings-section">
            <h3>Statistics</h3>
            <p>
              Total Clicks: {formatNumber(state.totalClicks)}<br />
              Total Vibes Earned: {formatNumber(state.totalVibesEarned)}<br />
              Time Played: {formatTime(state.timePlayed)}<br />
              Highest Vibes/Second: {formatNumber(state.highestVibesPerSecond, 2)}
            </p>
          </div>
        </div>

        <button className="modal-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
