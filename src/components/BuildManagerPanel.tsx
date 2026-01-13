import { useState } from 'react';
import { ExtendedGameState, SavedBuild } from '../game/progressionTypes';
import {
  canSaveBuild,
  canSwapToBuild,
  getActiveBuild,
  compareBuildToCurrentState,
  exportBuild,
  STARTER_BUILDS,
} from '../game/buildManager';
import { getSubstance } from '../game/substances';
import '../styles/BuildManagerPanel.css';

interface BuildManagerPanelProps {
  gameState: ExtendedGameState;
  onSaveBuild: (name: string, notes?: string) => void;
  onSwapBuild: (buildIndex: number) => void;
  onDeleteBuild: (buildId: string) => void;
  onOverwriteBuild: (buildIndex: number) => void;
  onUpdateBuildName: (buildId: string, newName: string) => void;
  onImportBuild: (buildJson: string) => void;
  onLoadStarterBuild: (presetId: string) => void;
}

export function BuildManagerPanel({
  gameState,
  onSaveBuild,
  onSwapBuild,
  onDeleteBuild,
  onOverwriteBuild,
  onUpdateBuildName,
  onImportBuild,
  onLoadStarterBuild,
}: BuildManagerPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showStarterBuilds, setShowStarterBuilds] = useState(false);
  const [newBuildName, setNewBuildName] = useState('');
  const [newBuildNotes, setNewBuildNotes] = useState('');
  const [importJson, setImportJson] = useState('');
  const [editingBuildId, setEditingBuildId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  const activeBuild = getActiveBuild(gameState);
  const canSave = canSaveBuild(gameState);

  const handleSave = () => {
    if (newBuildName.trim()) {
      onSaveBuild(newBuildName.trim(), newBuildNotes.trim() || undefined);
      setNewBuildName('');
      setNewBuildNotes('');
      setShowSaveDialog(false);
    }
  };

  const handleImport = () => {
    if (importJson.trim()) {
      onImportBuild(importJson.trim());
      setImportJson('');
      setShowImportDialog(false);
    }
  };

  const handleExport = (build: SavedBuild) => {
    const json = exportBuild(build);
    navigator.clipboard.writeText(json);
    // Could show a toast notification here
    alert('Build exported to clipboard!');
  };

  const handleRename = (buildId: string) => {
    if (editedName.trim()) {
      onUpdateBuildName(buildId, editedName.trim());
      setEditingBuildId(null);
      setEditedName('');
    }
  };

  const startEdit = (build: SavedBuild) => {
    setEditingBuildId(build.id);
    setEditedName(build.name);
  };

  // Don't show if no builds and no unlocked slots
  if (gameState.savedBuilds.length === 0 && gameState.maxBuildSlots === 0) {
    return null;
  }

  return (
    <div className={`build-manager-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="build-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-content">
          <span className="build-icon">💾</span>
          <div className="build-info">
            <div className="build-label">Build Manager</div>
            <div className="build-status">
              {activeBuild ? `Active: ${activeBuild.name}` : `${gameState.savedBuilds.length}/${gameState.maxBuildSlots} builds saved`}
            </div>
          </div>
        </div>
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="build-content">
          {/* Action Buttons */}
          <div className="build-actions">
            <button
              className="action-btn save-btn"
              onClick={() => setShowSaveDialog(true)}
              disabled={!canSave}
              title={!canSave ? `Build slots full (${gameState.maxBuildSlots} max)` : 'Save current configuration'}
            >
              💾 Save Current
            </button>
            <button
              className="action-btn import-btn"
              onClick={() => setShowImportDialog(true)}
              disabled={!canSave}
              title="Import build from clipboard"
            >
              📥 Import
            </button>
            <button
              className="action-btn starter-btn"
              onClick={() => setShowStarterBuilds(!showStarterBuilds)}
              title="Load starter build templates"
            >
              📦 Starter Builds
            </button>
          </div>

          {/* Cooldown Warning */}
          {gameState.buildSwapCooldown > 0 && (
            <div className="cooldown-warning">
              ⏳ Build swap cooldown: {Math.ceil(gameState.buildSwapCooldown)}s
            </div>
          )}

          {/* Starter Builds */}
          {showStarterBuilds && (
            <div className="starter-builds-section">
              <h4>📦 Starter Build Templates</h4>
              {STARTER_BUILDS.map(preset => (
                <div key={preset.id} className="starter-build-card">
                  <div className="build-card-header">
                    <span className="build-name">{preset.name}</span>
                  </div>
                  <div className="build-notes">{preset.notes}</div>
                  <div className="build-substances">
                    {Object.entries(preset.substances).map(([id, count]) => {
                      const substance = getSubstance(id);
                      return substance ? (
                        <span key={id} className="substance-tag">
                          {substance.name}: {count}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <button
                    className="load-starter-btn"
                    onClick={() => {
                      onLoadStarterBuild(preset.id);
                      setShowStarterBuilds(false);
                    }}
                    disabled={!canSave}
                  >
                    Load Template
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Saved Builds List */}
          {gameState.savedBuilds.length > 0 ? (
            <div className="builds-list">
              {gameState.savedBuilds.map((build, index) => {
                const isActive = gameState.activeBuildIndex === index;
                const canSwap = canSwapToBuild(gameState, index);
                const comparison = compareBuildToCurrentState(gameState, build);

                return (
                  <div
                    key={build.id}
                    className={`build-card ${isActive ? 'active-build' : ''}`}
                  >
                    <div className="build-card-header">
                      {editingBuildId === build.id ? (
                        <div className="edit-name-container">
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="name-edit-input"
                            autoFocus
                          />
                          <button onClick={() => handleRename(build.id)} className="save-name-btn">✓</button>
                          <button onClick={() => setEditingBuildId(null)} className="cancel-name-btn">✗</button>
                        </div>
                      ) : (
                        <>
                          <span className="build-name" onClick={() => startEdit(build)}>
                            {build.name}
                            {isActive && <span className="active-badge">ACTIVE</span>}
                          </span>
                          <span className="build-timestamp">
                            {new Date(build.timestamp).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    {build.notes && <div className="build-notes">{build.notes}</div>}

                    {/* Strategy Info */}
                    <div className="build-strategy">
                      <span>⚡ {build.energyMode}</span>
                      <span>🌀 {build.chaosStrategy}</span>
                    </div>

                    {/* Substances */}
                    <div className="build-substances">
                      {Object.entries(build.substances).map(([id, count]) => {
                        const substance = getSubstance(id);
                        return substance ? (
                          <span key={id} className="substance-tag">
                            {substance.name}: {count}
                          </span>
                        ) : null;
                      })}
                    </div>

                    {/* Differences from current */}
                    {comparison.substanceDifferences.length > 0 && !isActive && (
                      <details className="build-diff">
                        <summary>Changes from current ({comparison.substanceDifferences.length})</summary>
                        <div className="diff-list">
                          {comparison.substanceDifferences.map(diff => {
                            const substance = getSubstance(diff.substanceId);
                            return substance ? (
                              <div key={diff.substanceId} className="diff-item">
                                <span>{substance.name}:</span>
                                <span className={diff.diff > 0 ? 'positive' : 'negative'}>
                                  {diff.current} → {diff.target} ({diff.diff > 0 ? '+' : ''}{diff.diff})
                                </span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </details>
                    )}

                    {/* Actions */}
                    <div className="build-card-actions">
                      <button
                        className="swap-btn"
                        onClick={() => onSwapBuild(index)}
                        disabled={!canSwap || isActive}
                        title={!canSwap && gameState.buildSwapCooldown > 0 ? 'Swap on cooldown' : 'Switch to this build'}
                      >
                        {isActive ? '✓ Active' : '🔄 Load'}
                      </button>
                      <button
                        className="overwrite-btn"
                        onClick={() => {
                          if (confirm(`Overwrite "${build.name}" with current configuration?`)) {
                            onOverwriteBuild(index);
                          }
                        }}
                        title="Update this build with current configuration"
                      >
                        💾 Update
                      </button>
                      <button
                        className="export-btn"
                        onClick={() => handleExport(build)}
                        title="Copy build to clipboard"
                      >
                        📋 Copy
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          if (confirm(`Delete build "${build.name}"?`)) {
                            onDeleteBuild(build.id);
                          }
                        }}
                        title="Delete this build"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-builds">
              <p>No builds saved yet.</p>
              <p>Save your current substance configuration to quickly switch between strategies!</p>
            </div>
          )}

          {/* Save Dialog */}
          {showSaveDialog && (
            <div className="modal-overlay" onClick={() => setShowSaveDialog(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>💾 Save Current Build</h3>
                <input
                  type="text"
                  placeholder="Build name..."
                  value={newBuildName}
                  onChange={(e) => setNewBuildName(e.target.value)}
                  className="build-name-input"
                  maxLength={50}
                />
                <textarea
                  placeholder="Notes (optional)..."
                  value={newBuildNotes}
                  onChange={(e) => setNewBuildNotes(e.target.value)}
                  className="build-notes-input"
                  rows={3}
                  maxLength={200}
                />
                <div className="build-preview">
                  <div><strong>Substances:</strong></div>
                  {Object.entries(gameState.substances).filter(([_, count]) => count > 0).map(([id, count]) => {
                    const substance = getSubstance(id);
                    return substance ? (
                      <div key={id}>• {substance.name}: {count}</div>
                    ) : null;
                  })}
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Energy Mode:</strong> {gameState.activeEnergyMode}
                  </div>
                  <div>
                    <strong>Chaos Strategy:</strong> {gameState.activeChaosStrategy}
                  </div>
                </div>
                <div className="modal-actions">
                  <button onClick={handleSave} className="confirm-btn" disabled={!newBuildName.trim()}>
                    💾 Save
                  </button>
                  <button onClick={() => setShowSaveDialog(false)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Import Dialog */}
          {showImportDialog && (
            <div className="modal-overlay" onClick={() => setShowImportDialog(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>📥 Import Build</h3>
                <p>Paste build JSON from clipboard:</p>
                <textarea
                  placeholder='{"id": "...", "name": "...", ...}'
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  className="import-textarea"
                  rows={10}
                />
                <div className="modal-actions">
                  <button onClick={handleImport} className="confirm-btn" disabled={!importJson.trim()}>
                    📥 Import
                  </button>
                  <button onClick={() => setShowImportDialog(false)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
