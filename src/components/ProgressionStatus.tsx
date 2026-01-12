import { GameState } from '../game/types';
import { ExtendedGameState, isExtendedGameState } from '../game/progressionTypes';
import { getActiveEnergyMode } from '../game/energyManagement';
import { getCurrentChaosThreshold, getActiveChaosStrategy } from '../game/chaosStrategy';
import './ProgressionStatus.css';

interface ProgressionStatusProps {
  gameState: GameState;
}

export function ProgressionStatus({ gameState }: ProgressionStatusProps) {
  if (!isExtendedGameState(gameState)) {
    return null; // Not using extended features yet
  }

  const extendedState = gameState as ExtendedGameState;
  const energyMode = getActiveEnergyMode(extendedState);
  const chaosThreshold = getCurrentChaosThreshold(extendedState.chaos);
  const chaosStrategy = getActiveChaosStrategy(extendedState);

  // Calculate active bonuses summary
  const activeBonuses = extendedState.activeBonuses.filter(
    (bonus) => bonus.expiresAt > Date.now()
  );

  return (
    <div className="progression-status">
      {/* Energy Mode Display */}
      <div className="status-section energy-mode">
        <div className="status-label">⚡ Energy Mode</div>
        <div className="status-value">{energyMode.name}</div>
        <div className="status-description">{energyMode.description}</div>
      </div>

      {/* Chaos Threshold Display */}
      <div className="status-section chaos-threshold">
        <div className="status-label">🌪️ Chaos State</div>
        <div className="status-value">{chaosThreshold.name}</div>
        <div className="status-description">{chaosThreshold.description}</div>
        <div className="status-effects">
          <span className="effect-item">
            Prod: {((chaosThreshold.effects.productionMultiplier - 1) * 100).toFixed(0)}%
          </span>
          {chaosThreshold.effects.clickPowerMultiplier !== 1 && (
            <span className="effect-item">
              Click: {((chaosThreshold.effects.clickPowerMultiplier - 1) * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      {/* Chaos Strategy Display */}
      {chaosStrategy.id !== 'none' && (
        <div className="status-section chaos-strategy">
          <div className="status-label">🎯 Strategy</div>
          <div className="status-value">{chaosStrategy.name}</div>
        </div>
      )}

      {/* Active Bonuses Display */}
      {activeBonuses.length > 0 && (
        <div className="status-section active-bonuses">
          <div className="status-label">✨ Active Bonuses</div>
          {activeBonuses.map((bonus) => {
            const timeLeft = Math.ceil((bonus.expiresAt - Date.now()) / 1000);
            return (
              <div key={bonus.id} className="bonus-item">
                <span className="bonus-name">{bonus.name}</span>
                {bonus.productionMultiplier && bonus.productionMultiplier !== 1 && (
                  <span className="bonus-effect">
                    {bonus.productionMultiplier.toFixed(1)}x prod
                  </span>
                )}
                {bonus.clickMultiplier && bonus.clickMultiplier !== 1 && (
                  <span className="bonus-effect">
                    {bonus.clickMultiplier.toFixed(1)}x click
                  </span>
                )}
                <span className="bonus-timer">{timeLeft}s</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Next Milestone Preview */}
      <div className="status-section next-milestone">
        <div className="status-label">🎯 Next Milestone</div>
        <div className="milestone-progress">
          {getNextMilestoneDisplay(extendedState)}
        </div>
      </div>
    </div>
  );
}

function getNextMilestoneDisplay(state: ExtendedGameState): string {
  // Find next vibe milestone
  const vibeThresholds = [
    10000, 100000, 500000, 1000000, 10000000, 100000000, 1000000000,
  ];

  for (const threshold of vibeThresholds) {
    if (state.totalVibesEarned < threshold) {
      const progress = (state.totalVibesEarned / threshold) * 100;
      return `${threshold.toLocaleString()} vibes (${progress.toFixed(1)}%)`;
    }
  }

  // Check repeating milestone
  if (state.lastMilestoneVibes > 0) {
    const nextThreshold = getNextRepeatThreshold(state.lastMilestoneVibes);
    const progress = (state.totalVibesEarned / nextThreshold) * 100;
    return `${nextThreshold.toLocaleString()} vibes (${progress.toFixed(1)}%)`;
  }

  return 'All milestones complete!';
}

function getNextRepeatThreshold(current: number): number {
  if (current < 10000) return current + 1000;
  if (current < 100000) return current + 10000;
  if (current < 1000000) return current + 100000;
  return current + 1000000;
}
