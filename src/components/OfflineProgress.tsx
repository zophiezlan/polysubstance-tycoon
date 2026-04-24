import { GameState } from "../game/types";
import "./OfflineProgress.css";

interface OfflineProgressProps {
  offlineData: {
    vibesGained: number;
    timeAway: number;
  };
  onClaim: () => void;
}

export function OfflineProgress({
  offlineData,
  onClaim,
}: OfflineProgressProps) {
  const { vibesGained, timeAway } = offlineData;

  // Format time away
  const hours = Math.floor(timeAway / 3600);
  const minutes = Math.floor((timeAway % 3600) / 60);

  let timeAwayText = "";
  if (hours > 0) {
    timeAwayText = `${hours}h ${minutes}m`;
  } else {
    timeAwayText = `${minutes}m`;
  }

  return (
    <div className="offline-progress-overlay" onClick={onClaim}>
      <div
        className="offline-progress-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="offline-header">
          <div className="offline-icon">💤</div>
          <h2>Welcome Back!</h2>
        </div>

        <div className="offline-content">
          <p className="offline-message">
            You were away for <strong>{timeAwayText}</strong>
          </p>

          <div className="offline-rewards">
            <div className="reward-big">
              <div className="reward-label">Vibes Earned</div>
              <div className="reward-value">
                +{Math.floor(vibesGained).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="offline-footer">
            <p className="offline-tip">
              💡 Offline earnings are capped at 4 hours and pay 50% of live rate.
            </p>
          </div>
        </div>

        <button className="offline-claim-button" onClick={onClaim}>
          Claim Rewards
        </button>
      </div>
    </div>
  );
}

interface OfflineProgressManagerProps {
  gameState: GameState;
  onClaimOfflineProgress: () => void;
}

export function OfflineProgressManager({
  gameState,
  onClaimOfflineProgress,
}: OfflineProgressManagerProps) {
  if (
    !gameState.offlineProgressPending ||
    gameState.offlineProgressPending.claimed
  ) {
    return null;
  }

  return (
    <OfflineProgress
      offlineData={{
        vibesGained: gameState.offlineProgressPending.vibesGained,
        timeAway: gameState.offlineProgressPending.timeAway,
      }}
      onClaim={onClaimOfflineProgress}
    />
  );
}
