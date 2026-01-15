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

  // Helper function to format action effects
  const formatEffects = (action: typeof MAINTENANCE_ACTIONS[0]) => {
    const effects = [];
    if (action.effects.energyRestore) effects.push(`⚡ +${action.effects.energyRestore} Energy`);
    if (action.effects.chaosReduction) effects.push(`🌪️ -${action.effects.chaosReduction} Chaos`);
    if (action.effects.strainReduction) effects.push(`💪 -${action.effects.strainReduction} Strain`);
    if (action.effects.hydrationRestore) effects.push(`💧 -${action.effects.hydrationRestore} Dehydration`);
    if (action.effects.memoryRestore) effects.push(`🧠 +${action.effects.memoryRestore} Memory`);
    if (action.effects.timeBonus) effects.push(`⏱️ +${action.effects.timeBonus}s Time`);
    if (action.effects.sleepDebtReduction) effects.push(`😴 -${action.effects.sleepDebtReduction} Sleep Debt`);
    return effects;
  };

  return (
    <div className="maintenance-panel">
      <h3>🔧 MAINTENANCE ACTIONS</h3>
      <p className="maintenance-description">Keep yourself running throughout the night</p>
      <div className="maintenance-actions">
        {MAINTENANCE_ACTIONS.map(action => {
          const available = isActionAvailable(action, state.knowledgeLevel, state.substances);
          if (!available) return null;

          const cooldownRemaining = state.actionCooldowns[action.id] || 0;
          const onCooldown = cooldownRemaining > 0;
          const canAfford = state.vibes >= action.cost;
          const disabled = onCooldown || !canAfford;
          const effects = formatEffects(action);

          // Distort button text when highly confident
          let displayName = action.name;
          if (state.distortionLevel >= 2 && suppressWarnings) {
            const skipMessages = ['Skip', 'Not needed', 'Waste of time', 'Unnecessary'];
            if (Math.random() > 0.8) {
              displayName = skipMessages[Math.floor(Math.random() * skipMessages.length)];
            }
          }

          return (
            <div key={action.id} className={`maintenance-action ${disabled ? 'disabled' : 'available'}`}>
              <button
                className="maintenance-button"
                onClick={() => onAction(action.id)}
                disabled={disabled}
              >
                <div className="button-header">
                  <span className="button-name">{displayName}</span>
                  <span className="button-cost">
                    {action.cost > 0 ? `${formatNumber(action.cost)} V` : 'FREE'}
                  </span>
                </div>
                {onCooldown && (
                  <div className="cooldown-bar-container">
                    <div
                      className="cooldown-bar-fill"
                      style={{ width: `${(cooldownRemaining / action.cooldown) * 100}%` }}
                    />
                  </div>
                )}
              </button>
              <div className="action-details">
                <div className="action-description">{action.description}</div>
                {effects.length > 0 && (
                  <div className="action-effects">
                    {effects.map((effect, idx) => (
                      <span key={idx} className="effect-badge">{effect}</span>
                    ))}
                  </div>
                )}
                {onCooldown && (
                  <div className="cooldown-text">Cooldown: {Math.ceil(cooldownRemaining)}s</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
