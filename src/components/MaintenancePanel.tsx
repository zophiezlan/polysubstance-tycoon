import { GameState } from '../game/types';
import { MAINTENANCE_ACTIONS, isActionAvailable } from '../game/maintenance';
import { formatNumber } from '../utils/formatter';

interface MaintenancePanelProps {
  state: GameState;
  onAction: (actionId: string) => void;
}

export function MaintenancePanel({ state, onAction }: MaintenancePanelProps) {
  // Suppress warnings when confidence is high or sedatives are active
  const suppressWarnings = state.confidence > 70 || (state.substances.sedative || 0) >= 3;

  return (
    <div className="maintenance-panel">
      <h3>🔧 MAINTENANCE</h3>
      <div className="maintenance-actions">
        {MAINTENANCE_ACTIONS.map(action => {
          const available = isActionAvailable(action, state.knowledgeLevel, state.substances);
          if (!available) return null;

          const cooldownRemaining = state.actionCooldowns[action.id] || 0;
          const onCooldown = cooldownRemaining > 0;
          const canAfford = state.vibes >= action.cost;
          const disabled = onCooldown || !canAfford;

          // Distort button text when highly confident
          let displayName = action.name;
          if (state.distortionLevel >= 2 && suppressWarnings) {
            const skipMessages = ['Skip', 'Not needed', 'Waste of time', 'Unnecessary'];
            if (Math.random() > 0.8) {
              displayName = skipMessages[Math.floor(Math.random() * skipMessages.length)];
            }
          }

          return (
            <div key={action.id} className="maintenance-action">
              <button
                className="maintenance-button"
                onClick={() => onAction(action.id)}
                disabled={disabled}
              >
                {displayName}
                {action.cost > 0 && ` (${formatNumber(action.cost)} V)`}
                {onCooldown && ` [${Math.ceil(cooldownRemaining)}s]`}
              </button>
              <div className="action-description">{action.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
