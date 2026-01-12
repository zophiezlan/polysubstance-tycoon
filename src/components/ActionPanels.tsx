import { ExtendedGameState } from '../game/progressionTypes';
import { ENERGY_BOOSTERS, canUseEnergyBooster } from '../game/energyManagement';
import { CHAOS_ACTIONS, canUseChaosAction } from '../game/chaosStrategy';
import './ActionPanels.css';

interface ActionPanelsProps {
  gameState: ExtendedGameState;
  onUseEnergyBooster: (boosterId: string) => void;
  onUseChaosAction: (actionId: string) => void;
}

export function ActionPanels({
  gameState,
  onUseEnergyBooster,
  onUseChaosAction,
}: ActionPanelsProps) {
  // Get available energy boosters
  const availableBoosters = Object.values(ENERGY_BOOSTERS).filter((booster) =>
    booster.unlockCondition(gameState)
  );

  // Get available chaos actions
  const availableActions = Object.values(CHAOS_ACTIONS).filter((action) =>
    action.unlockCondition(gameState)
  );

  if (availableBoosters.length === 0 && availableActions.length === 0) {
    return null; // Nothing to show yet
  }

  return (
    <div className="action-panels">
      {/* Energy Boosters Panel */}
      {availableBoosters.length > 0 && (
        <div className="action-panel energy-boosters-panel">
          <h3 className="panel-title">⚡ Energy Boosters</h3>
          <div className="action-grid">
            {availableBoosters.map((booster) => {
              const canUse = canUseEnergyBooster(gameState, booster.id);
              const cooldownRemaining =
                gameState.energyBoosterCooldowns[booster.id] || 0;
              const cooldownPercent =
                (cooldownRemaining / booster.cooldown) * 100;

              return (
                <button
                  key={booster.id}
                  className={`action-button energy-booster ${!canUse ? 'disabled' : ''}`}
                  onClick={() => canUse && onUseEnergyBooster(booster.id)}
                  disabled={!canUse}
                  title={booster.description}
                >
                  <div className="button-content">
                    <div className="button-name">{booster.name}</div>
                    <div className="button-description">{booster.description}</div>
                    {cooldownRemaining > 0 && (
                      <div className="cooldown-info">
                        <div className="cooldown-text">
                          {Math.ceil(cooldownRemaining)}s
                        </div>
                        <div
                          className="cooldown-bar"
                          style={{ width: `${cooldownPercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chaos Actions Panel */}
      {availableActions.length > 0 && (
        <div className="action-panel chaos-actions-panel">
          <h3 className="panel-title">🌪️ Chaos Actions</h3>
          <div className="action-grid">
            {availableActions.map((action) => {
              const canUse = canUseChaosAction(gameState, action.id);
              const cooldownRemaining =
                gameState.chaosActionCooldowns[action.id] || 0;
              const cooldownPercent = (cooldownRemaining / action.cooldown) * 100;

              // Check if can afford chaos cost
              const chaosCost = action.chaosCost || 0;
              const canAfford = gameState.chaos >= chaosCost;

              return (
                <button
                  key={action.id}
                  className={`action-button chaos-action ${!canUse ? 'disabled' : ''}`}
                  onClick={() => canUse && onUseChaosAction(action.id)}
                  disabled={!canUse}
                  title={action.description}
                >
                  <div className="button-content">
                    <div className="button-name">{action.name}</div>
                    <div className="button-description">{action.description}</div>
                    {chaosCost > 0 && (
                      <div className={`cost-info ${!canAfford ? 'cant-afford' : ''}`}>
                        Cost: {chaosCost} chaos
                      </div>
                    )}
                    {cooldownRemaining > 0 && (
                      <div className="cooldown-info">
                        <div className="cooldown-text">
                          {Math.ceil(cooldownRemaining)}s
                        </div>
                        <div
                          className="cooldown-bar"
                          style={{ width: `${cooldownPercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
