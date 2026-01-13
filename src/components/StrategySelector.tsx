import { useState } from 'react';
import { ExtendedGameState } from '../game/progressionTypes';
import {
  getAvailableEnergyModes,
  getActiveEnergyMode,
} from '../game/energyManagement';
import {
  getAvailableChaosStrategies,
  getActiveChaosStrategy,
  getCurrentChaosThreshold,
} from '../game/chaosStrategy';
import '../styles/StrategySelector.css';

interface StrategySelectorProps {
  gameState: ExtendedGameState;
  onSwitchEnergyMode: (modeId: string) => void;
  onSwitchChaosStrategy: (strategyId: string) => void;
}

export function StrategySelector({
  gameState,
  onSwitchEnergyMode,
  onSwitchChaosStrategy,
}: StrategySelectorProps) {
  const [showEnergyModes, setShowEnergyModes] = useState(false);
  const [showChaosStrategies, setShowChaosStrategies] = useState(false);

  const availableEnergyModes = getAvailableEnergyModes(gameState);
  const availableChaosStrategies = getAvailableChaosStrategies(gameState);
  const activeEnergyMode = getActiveEnergyMode(gameState);
  const activeChaosStrategy = getActiveChaosStrategy(gameState);
  const currentChaosThreshold = getCurrentChaosThreshold(gameState.chaos);

  // Don't show if only default options available
  if (availableEnergyModes.length <= 1 && availableChaosStrategies.length <= 1) {
    return null;
  }

  return (
    <div className="strategy-selector-panel">
      {/* Energy Mode Selector */}
      {availableEnergyModes.length > 1 && (
        <div className="strategy-section">
          <div
            className="strategy-header energy-header"
            onClick={() => setShowEnergyModes(!showEnergyModes)}
          >
            <div className="header-content">
              <span className="strategy-icon">⚡</span>
              <div className="strategy-info">
                <div className="strategy-label">Energy Mode</div>
                <div className="strategy-current">{activeEnergyMode.name}</div>
              </div>
            </div>
            <span className="expand-icon">{showEnergyModes ? '▼' : '▶'}</span>
          </div>

          {showEnergyModes && (
            <div className="strategy-options">
              {availableEnergyModes.map(mode => {
                const isActive = mode.id === gameState.activeEnergyMode;
                const isLocked = !mode.unlockCondition(gameState);

                return (
                  <button
                    key={mode.id}
                    className={`strategy-option ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                    onClick={() => !isLocked && onSwitchEnergyMode(mode.id)}
                    disabled={isActive || isLocked}
                  >
                    <div className="option-header">
                      <span className="option-name">{mode.name}</span>
                      {isActive && <span className="active-badge">ACTIVE</span>}
                      {isLocked && <span className="locked-badge">🔒 LOCKED</span>}
                    </div>
                    <div className="option-description">{mode.description}</div>
                    <div className="option-effects">
                      {mode.effects.energyRegenMultiplier !== 1.0 && (
                        <span className={mode.effects.energyRegenMultiplier > 1 ? 'positive' : 'negative'}>
                          Energy Regen: {(mode.effects.energyRegenMultiplier * 100).toFixed(0)}%
                        </span>
                      )}
                      {mode.effects.clickPowerMultiplier !== 1.0 && (
                        <span className={mode.effects.clickPowerMultiplier > 1 ? 'positive' : 'negative'}>
                          Click Power: {(mode.effects.clickPowerMultiplier * 100).toFixed(0)}%
                        </span>
                      )}
                      {mode.effects.productionMultiplier && mode.effects.productionMultiplier !== 1.0 && (
                        <span className={mode.effects.productionMultiplier > 1 ? 'positive' : 'negative'}>
                          Production: {(mode.effects.productionMultiplier * 100).toFixed(0)}%
                        </span>
                      )}
                      {mode.effects.autoClickerSpeedMultiplier && (
                        <span className="positive">
                          Auto-Clicker: {(mode.effects.autoClickerSpeedMultiplier * 100).toFixed(0)}%
                        </span>
                      )}
                      {mode.effects.energyHarvestRate && (
                        <span className="special">
                          Energy Harvest: {mode.effects.energyHarvestRate}× at {mode.effects.energyHarvestThreshold}+ energy
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Chaos Strategy Selector */}
      {availableChaosStrategies.length > 1 && (
        <div className="strategy-section">
          <div
            className="strategy-header chaos-header"
            onClick={() => setShowChaosStrategies(!showChaosStrategies)}
          >
            <div className="header-content">
              <span className="strategy-icon">🌀</span>
              <div className="strategy-info">
                <div className="strategy-label">Chaos Strategy</div>
                <div className="strategy-current">
                  {activeChaosStrategy.name} • {currentChaosThreshold.name}
                </div>
              </div>
            </div>
            <span className="expand-icon">{showChaosStrategies ? '▼' : '▶'}</span>
          </div>

          {showChaosStrategies && (
            <div className="strategy-options">
              <div className="chaos-threshold-info">
                <div className="threshold-name">{currentChaosThreshold.name}</div>
                <div className="threshold-description">{currentChaosThreshold.description}</div>
              </div>

              {availableChaosStrategies.map(strategy => {
                const isActive = strategy.id === gameState.activeChaosStrategy;
                const isLocked = !strategy.unlockCondition(gameState);

                return (
                  <button
                    key={strategy.id}
                    className={`strategy-option ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                    onClick={() => !isLocked && onSwitchChaosStrategy(strategy.id)}
                    disabled={isActive || isLocked}
                  >
                    <div className="option-header">
                      <span className="option-name">{strategy.name}</span>
                      {isActive && <span className="active-badge">ACTIVE</span>}
                      {isLocked && <span className="locked-badge">🔒 LOCKED</span>}
                    </div>
                    <div className="option-description">{strategy.description}</div>
                    <div className="option-effects">
                      {strategy.effects.chaosThresholdMultiplier !== 1.0 && (
                        <span className={strategy.effects.chaosThresholdMultiplier > 1 ? 'positive' : 'negative'}>
                          Threshold Bonus: {(strategy.effects.chaosThresholdMultiplier * 100).toFixed(0)}%
                        </span>
                      )}
                      {strategy.effects.chaosDecayMultiplier !== 1.0 && (
                        <span className={strategy.effects.chaosDecayMultiplier < 1 ? 'positive' : 'negative'}>
                          Decay Rate: {(strategy.effects.chaosDecayMultiplier * 100).toFixed(0)}%
                        </span>
                      )}
                      {strategy.effects.chaosGenerationMultiplier !== 1.0 && (
                        <span className={strategy.effects.chaosGenerationMultiplier > 1 ? 'warning' : 'positive'}>
                          Generation: {(strategy.effects.chaosGenerationMultiplier * 100).toFixed(0)}%
                        </span>
                      )}
                      {strategy.effects.chaosCapOverride && (
                        <span className="special">
                          Cap: {strategy.effects.chaosCapOverride}
                        </span>
                      )}
                      {strategy.effects.chaosFloorOverride && (
                        <span className="special">
                          Floor: {strategy.effects.chaosFloorOverride}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
