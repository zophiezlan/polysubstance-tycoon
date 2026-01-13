import { GameState, OrganComplaint } from '../game/types';
import { getOrganEmoji, getSeverityColor } from '../game/organCommentary';
import { useState } from 'react';
import '../styles/OrganComplaintsPanel.css';

interface OrganComplaintsPanelProps {
  state: GameState;
}

export function OrganComplaintsPanel({ state }: OrganComplaintsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Feature not unlocked yet
  if (!state.unlockedFeatures.includes('organCommentary')) {
    return null;
  }

  // No complaints yet
  if (state.organComplaints.length === 0) {
    return (
      <div className="organ-complaints-panel collapsed">
        <div className="complaints-header" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="complaints-title">🫀 Organ Status</span>
          <span className="status-indicator all-clear">All systems nominal</span>
        </div>
      </div>
    );
  }

  // Get latest complaint for each organ
  const latestComplaints = new Map<string, OrganComplaint>();
  state.organComplaints.forEach(complaint => {
    const existing = latestComplaints.get(complaint.organ);
    if (!existing || complaint.timestamp > existing.timestamp) {
      latestComplaints.set(complaint.organ, complaint);
    }
  });

  // Count severity levels
  const criticalCount = Array.from(latestComplaints.values()).filter(c => c.severity === 'critical').length;
  const concerningCount = Array.from(latestComplaints.values()).filter(c => c.severity === 'concerning').length;

  return (
    <div className={`organ-complaints-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="complaints-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="complaints-title">🫀 Organ Status</span>
        <span className="status-summary">
          {criticalCount > 0 && <span className="critical-count">⚠️ {criticalCount} critical</span>}
          {concerningCount > 0 && <span className="concerning-count">⚡ {concerningCount} concerning</span>}
          {criticalCount === 0 && concerningCount === 0 && <span className="mild-count">Minor complaints</span>}
        </span>
        <span className="expand-icon">{isExpanded ? '▼' : '▲'}</span>
      </div>

      {isExpanded && (
        <div className="complaints-list">
          {Array.from(latestComplaints.values())
            .sort((a, b) => {
              // Sort by severity first (critical > concerning > mild)
              const severityOrder = { critical: 3, concerning: 2, mild: 1 };
              const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
              if (severityDiff !== 0) return severityDiff;
              // Then by timestamp (newest first)
              return b.timestamp - a.timestamp;
            })
            .map(complaint => (
              <div
                key={complaint.id}
                className={`complaint-item severity-${complaint.severity}`}
                style={{ borderLeftColor: getSeverityColor(complaint.severity) }}
              >
                <div className="complaint-header">
                  <span className="organ-name">
                    {getOrganEmoji(complaint.organ)} {complaint.organ}
                  </span>
                  <span className={`severity-badge ${complaint.severity}`}>
                    {complaint.severity}
                  </span>
                </div>
                <div className="complaint-message">{complaint.message}</div>
              </div>
            ))}

          {/* Show complaint history if there are more than the unique organs */}
          {state.organComplaints.length > latestComplaints.size && (
            <details className="complaint-history">
              <summary>View complaint history ({state.organComplaints.length} total)</summary>
              <div className="history-list">
                {state.organComplaints
                  .slice()
                  .reverse()
                  .map(complaint => (
                    <div key={complaint.id} className="history-item">
                      <span className="history-organ">{getOrganEmoji(complaint.organ)}</span>
                      <span className="history-message">{complaint.message}</span>
                    </div>
                  ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
