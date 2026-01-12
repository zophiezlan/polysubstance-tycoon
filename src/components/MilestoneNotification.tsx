import { useState, useEffect } from 'react';
import { Milestone } from '../game/progressionTypes';
import './MilestoneNotification.css';

interface MilestoneNotificationProps {
  milestone: Milestone;
  onDismiss: () => void;
}

export function MilestoneNotification({ milestone, onDismiss }: MilestoneNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50);

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for fade out
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleClick = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`milestone-notification ${isVisible ? 'visible' : ''}`}
      onClick={handleClick}
    >
      <div className="milestone-content">
        <div className="milestone-icon">🏆</div>
        <div className="milestone-info">
          <div className="milestone-name">{milestone.name}</div>
          <div className="milestone-description">{milestone.description}</div>
          {milestone.reward && (
            <div className="milestone-rewards">
              {milestone.reward.permanentProductionBonus && (
                <span className="reward-item">
                  +{milestone.reward.permanentProductionBonus}% production forever!
                </span>
              )}
              {milestone.reward.permanentClickBonus && (
                <span className="reward-item">
                  +{milestone.reward.permanentClickBonus}% click power forever!
                </span>
              )}
              {milestone.reward.temporaryBonus && (
                <span className="reward-item">
                  {milestone.reward.temporaryBonus.productionMultiplier &&
                    `${milestone.reward.temporaryBonus.productionMultiplier}x production`}
                  {milestone.reward.temporaryBonus.clickMultiplier &&
                    `${milestone.reward.temporaryBonus.clickMultiplier}x clicks`}
                  {' '}for {milestone.reward.temporaryBonus.duration}s
                </span>
              )}
              {milestone.reward.insightPoints && (
                <span className="reward-item insight">
                  +{milestone.reward.insightPoints} Insight Points!
                </span>
              )}
              {milestone.reward.unlockFeature && (
                <span className="reward-item unlock">
                  Unlocked: {milestone.reward.unlockFeature.replace(/_/g, ' ')}!
                </span>
              )}
            </div>
          )}
        </div>
        <div className="milestone-dismiss">✕</div>
      </div>
    </div>
  );
}

interface MilestoneManagerProps {
  milestones: Milestone[];
  onClearMilestones: () => void;
}

export function MilestoneManager({ milestones, onClearMilestones }: MilestoneManagerProps) {
  const [visibleMilestones, setVisibleMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (milestones.length > 0) {
      // Limit to max 3 visible notifications to prevent UI clogging
      setVisibleMilestones((prev) => {
        const combined = [...prev, ...milestones];
        // Keep only the most recent 3
        return combined.slice(-3);
      });
      onClearMilestones();
    }
  }, [milestones, onClearMilestones]);

  const handleDismiss = (index: number) => {
    setVisibleMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="milestone-manager">
      {visibleMilestones.map((milestone, index) => (
        <MilestoneNotification
          key={`${milestone.id}-${index}`}
          milestone={milestone}
          onDismiss={() => handleDismiss(index)}
        />
      ))}
    </div>
  );
}
