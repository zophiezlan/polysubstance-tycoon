import { GameState } from '../game/types';

interface SettingsModalProps {
  state: GameState;
  onClose: () => void;
  onToggleDistortion: () => void;
  onToggleMotion: () => void;
  onChangeFontSize: (size: 'small' | 'default' | 'large') => void;
  onReset: () => void;
}

export function SettingsModal({
  state,
  onClose,
  onToggleDistortion,
  onToggleMotion,
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
        </div>

        <button className="modal-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
