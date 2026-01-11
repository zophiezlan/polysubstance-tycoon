import { GameState } from '../game/types';
import { hasUnlock } from '../game/prestige';
import { getBarFill } from '../utils/formatter';

interface HiddenMetersProps {
  state: GameState;
}

export function HiddenMeters({ state }: HiddenMetersProps) {
  const showHydration = hasUnlock(state.knowledgeLevel, 'hydrationDebt');
  const showSleepDebt = hasUnlock(state.knowledgeLevel, 'sleepDebt');
  const showStrain = hasUnlock(state.knowledgeLevel, 'strain');
  const showMemory = hasUnlock(state.knowledgeLevel, 'memoryIntegrity');

  const anyVisible = showHydration || showSleepDebt || showStrain || showMemory;

  if (!anyVisible) return null;

  return (
    <div className="hidden-meters">
      <h3>📊 INTELLIGENCE</h3>

      {showHydration && (
        <div className="stat-row">
          <div className="stat-bar-container">
            <div className="stat-bar-label">
              <span>💧 Hydration Debt</span>
              <span>{Math.floor(state.hydrationDebt)}</span>
            </div>
            <div className="stat-bar">
              <div
                className={`stat-bar-fill ${state.hydrationDebt > 70 ? 'danger' : state.hydrationDebt > 40 ? 'warning' : 'normal'}`}
                style={{ width: `${getBarFill(state.hydrationDebt, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {showSleepDebt && (
        <div className="stat-row">
          <div className="stat-bar-container">
            <div className="stat-bar-label">
              <span>😴 Sleep Debt</span>
              <span>{Math.floor(state.sleepDebt)}</span>
            </div>
            <div className="stat-bar">
              <div
                className={`stat-bar-fill ${state.sleepDebt > 70 ? 'danger' : state.sleepDebt > 40 ? 'warning' : 'normal'}`}
                style={{ width: `${getBarFill(state.sleepDebt, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {showStrain && (
        <div className="stat-row">
          <div className="stat-bar-container">
            <div className="stat-bar-label">
              <span>⚠️ Strain</span>
              <span>{Math.floor(state.strain)}/100</span>
            </div>
            <div className="stat-bar">
              <div
                className={`stat-bar-fill ${state.strain > 80 ? 'danger' : state.strain > 60 ? 'warning' : 'normal'}`}
                style={{ width: `${getBarFill(state.strain, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {showMemory && (
        <div className="stat-row">
          <div className="stat-bar-container">
            <div className="stat-bar-label">
              <span>🧠 Memory Integrity</span>
              <span>{Math.floor(state.memoryIntegrity)}/100</span>
            </div>
            <div className="stat-bar">
              <div
                className={`stat-bar-fill ${state.memoryIntegrity < 20 ? 'danger' : state.memoryIntegrity < 50 ? 'warning' : 'normal'}`}
                style={{ width: `${getBarFill(state.memoryIntegrity, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
