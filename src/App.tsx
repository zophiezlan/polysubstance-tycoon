import { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState } from './game/types';
import { createInitialState, startNewNight } from './game/state';
import { gameTick } from './game/tick';
import {
  validateSaveData,
  migrateSaveData,
  sanitizeGameState,
  createSaveData,
} from './utils/saveValidation';
import { getSubstance, getSubstanceCost } from './game/substances';
import { getAction } from './game/maintenance';
import { checkAchievements, getAchievement } from './game/achievements';
import { formatNumber } from './utils/formatter';
import { StatPanel } from './components/StatPanel';
import { MainButton } from './components/MainButton';
import { SubstanceShop } from './components/SubstanceShop';
import { UpgradeShop } from './components/UpgradeShop';
import { MaintenancePanel } from './components/MaintenancePanel';
import { HiddenMeters } from './components/HiddenMeters';
import { LogPanel } from './components/LogPanel';
import { DisclaimerModal } from './components/DisclaimerModal';
import { SettingsModal } from './components/SettingsModal';
import { FloatingNumber } from './components/FloatingNumber';
import { canPurchaseUpgrade, getUpgrade } from './game/upgrades';
import { calculateClickPower, calculateChaosDampening, calculateProductionMultiplier } from './game/upgradeEffects';
import { updateCombo, calculateComboMultiplier } from './game/combos';
// New progression system components
import { ProgressionStatus } from './components/ProgressionStatus';
import { OfflineProgressManager } from './components/OfflineProgress';
import { ActionPanels } from './components/ActionPanels';
import { GroupChatPanel } from './components/GroupChatPanel';
import { OrganComplaintsPanel } from './components/OrganComplaintsPanel';
import { StrategySelector } from './components/StrategySelector';
import { BuildManagerPanel } from './components/BuildManagerPanel';
import { isExtendedGameState, ExtendedGameState } from './game/progressionTypes';
import { useEnergyBooster as applyEnergyBooster, switchEnergyMode } from './game/energyManagement';
import { useChaosAction as applyChaosAction, switchChaosStrategy } from './game/chaosStrategy';
import {
  saveBuild,
  swapToBuild,
  deleteBuild,
  overwriteBuild,
  updateBuildName,
  importBuild,
  loadStarterBuild,
} from './game/buildManager';
import { claimOfflineProgress } from './game/progressionIntegration';
import { checkMilestones } from './game/milestones';
import { markMessagesAsRead } from './game/groupChat';
import './App.css';

const STORAGE_KEY = 'polysubstance-tycoon-save';
const TICK_INTERVAL = 1000; // 1 second

function App() {
  const [state, setState] = useState<GameState>(() => {
    // Try to load from localStorage with validation and migration
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        // Validate and migrate save data
        if (validateSaveData(parsed)) {
          const migratedState = migrateSaveData(parsed);
          const sanitizedState = sanitizeGameState(migratedState);

          // If there's a saved active night, create new night with persistent data
          if (sanitizedState.isNightActive === false) {
            return startNewNight(sanitizedState);
          }

          // Reset runtime timestamps
          sanitizedState.lastTickTime = Date.now();
          sanitizedState.nightStartTime = Date.now();

          console.log('Successfully loaded save data');
          return sanitizedState;
        } else {
          console.warn('Save data validation failed, attempting migration');
          // Try to migrate legacy format
          const migratedState = migrateSaveData(parsed);
          const sanitizedState = sanitizeGameState(migratedState);
          return sanitizedState;
        }
      } catch (e) {
        console.error('Failed to parse save:', e);
        console.log('Starting fresh game');
      }
    }
    return createInitialState();
  });

  const [floatingNumbers, setFloatingNumbers] = useState<Array<{ id: string; value: number; x: number; y: number }>>([]);

  // Save to localStorage whenever state changes (debounced for performance)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        // Create versioned save data
        const saveData = createSaveData(state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
        // If quota exceeded, try to save critical data only
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          try {
            const criticalState = {
              version: 1,
              timestamp: Date.now(),
              state: {
                vibes: state.vibes,
                experience: state.experience,
                knowledgeLevel: state.knowledgeLevel,
                substances: state.substances,
                upgrades: state.upgrades,
                achievements: state.achievements,
              },
            };
            localStorage.setItem(STORAGE_KEY + '_backup', JSON.stringify(criticalState));
            console.warn('Saved backup due to quota exceeded');
          } catch (backupError) {
            console.error('Failed to save backup:', backupError);
          }
        }
      }
    }, 1000); // Debounce: save 1 second after last state change

    return () => clearTimeout(timeoutId);
  }, [state]);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prevState => {
        const now = Date.now();
        const rawDelta = now - prevState.lastTickTime;
        const safeDelta = Math.max(0, rawDelta);
        const deltaTime = Math.min(safeDelta, TICK_INTERVAL);
        let newState = gameTick(prevState, deltaTime);
        newState.lastTickTime = now;

        // Check for new achievements and log them
        const newAchievements = checkAchievements(newState, prevState.achievements);
        if (newAchievements.length > 0) {
          const previouslyUnlocked = new Set(prevState.achievements);
          const achievementsToAdd = newAchievements.filter(achId => !previouslyUnlocked.has(achId));

          if (achievementsToAdd.length > 0) {
            newState.achievements = [...prevState.achievements, ...achievementsToAdd];

            // Log achievements (notifications removed - redundant with log)
            achievementsToAdd.forEach(achId => {
              const ach = getAchievement(achId);
              if (ach) {
                newState.log.push({
                  timestamp: 3600 - newState.timeRemaining,
                  message: `🏆 ${ach.name}`,
                  type: 'achievement',
                });
              }
            });
          }
        }

        // Check for new milestones and log them (notifications removed)
        if (isExtendedGameState(newState)) {
          const completedMilestones = checkMilestones(newState as ExtendedGameState);
          if (completedMilestones.length > 0) {
            completedMilestones.forEach(milestone => {
              newState.log.push({
                timestamp: 3600 - newState.timeRemaining,
                message: `⭐ Milestone: ${milestone.name}`,
                type: 'achievement',
              });
            });
          }
        }

        return newState;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleFloatingNumberComplete = useCallback((id: string) => {
    setFloatingNumbers(prev => prev.filter(fn => fn.id !== id));
  }, []);

  const handleMainClick = useCallback((event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    setState(prevState => {
      let newState = { ...prevState };

      // COOKIE CLICKER MODE: Update combo system
      newState = updateCombo(newState);
      const comboMultiplier = calculateComboMultiplier(newState.comboCount);

      const baseClickPower = calculateClickPower(prevState);

      // COOKIE CLICKER MODE: Clicks NEVER cost energy!
      // Energy provides a scaling bonus multiplier (0-100 → 1.0x-1.2x)
      // This makes energy a pure positive mechanic
      const energyBonus = 1 + (newState.energy / 500); // 0 energy = 1x, 100 energy = 1.2x

      // Apply combo multiplier!
      let vibesGained = Math.floor(baseClickPower * energyBonus * comboMultiplier);
      vibesGained = Math.max(1, vibesGained); // Minimum 1 vibe per click

      newState.vibes += vibesGained;
      newState.totalVibesEarned += vibesGained;
      newState.totalClicks += 1;

      // Minimal chaos increase - make it VERY easy to manage
      const chaosIncrease = Math.random() * 1.5 * (1 - calculateChaosDampening(prevState));
      newState.chaos = Math.min(100, newState.chaos + chaosIncrease);

      // Lore-appropriate messages based on state
      let message = 'Running the night.';
      const energyLevel = newState.energy;
      if (energyLevel > 80) {
        message = 'Vibing hard.';
      } else if (energyLevel < 30) {
        message = 'Coasting on fumes.';
      }
      if (newState.chaos > 80) {
        message = 'Everything is fine.';
      }
      if (newState.comboCount > 100) {
        message = `${newState.comboCount}x COMBO!!!`;
      }

      // Only log occasionally to reduce spam
      if (Math.random() < 0.15) {
        const bonusText = energyLevel > 50 ? ` (⚡${(energyBonus * 100).toFixed(0)}%)` : '';
        const comboText = newState.comboCount > 25 ? ` 🔥${newState.comboCount}x` : '';
        newState.log.push({
          timestamp: 3600 - newState.timeRemaining,
          message: `${message} Vibes +${vibesGained}${bonusText}${comboText}`,
          type: 'info',
        });
      }

      // Create floating number
      if (prevState.showFloatingNumbers) {
        setFloatingNumbers(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          value: vibesGained,
          x: clientX,
          y: clientY,
        }]);
      }

      return newState;
    });
  }, []);

  const handlePurchase = useCallback((substanceId: string) => {
    setState(prevState => {
      const substance = getSubstance(substanceId);
      if (!substance) return prevState;

      const owned = prevState.substances[substanceId] || 0;
      const cost = getSubstanceCost(substance, owned);

      if (prevState.vibes < cost) return prevState;

      const newState = { ...prevState };
      newState.vibes -= cost;
      newState.substances[substanceId] = owned + 1;

      // Apply time extension immediately
      if (substance.timeExtension) {
        newState.timeRemaining += substance.timeExtension;
      }

      newState.log.push({
        timestamp: 3600 - newState.timeRemaining,
        message: `Purchased ${substance.name} (x${owned + 1})`,
        type: 'info',
      });

      return newState;
    });
  }, []);

  const handlePurchaseUpgrade = useCallback((upgradeId: string) => {
    setState(prevState => {
      const upgrade = getUpgrade(upgradeId);
      if (!upgrade) return prevState;

      if (!canPurchaseUpgrade(upgrade, prevState)) return prevState;

      const newState = { ...prevState };
      newState.vibes -= upgrade.cost;
      newState.upgrades.push(upgradeId);

      newState.log.push({
        timestamp: 3600 - newState.timeRemaining,
        message: `🔬 Unlocked: ${upgrade.name}`,
        type: 'info',
      });

      return newState;
    });
  }, []);

  const handleMaintenance = useCallback((actionId: string) => {
    setState(prevState => {
      const action = getAction(actionId);
      if (!action) return prevState;

      const cooldownRemaining = prevState.actionCooldowns[actionId] || 0;
      if (cooldownRemaining > 0 || prevState.vibes < action.cost) return prevState;

      const newState = { ...prevState };
      newState.vibes -= action.cost;
      newState.actionCooldowns[actionId] = action.cooldown;

      // Apply effects
      if (action.effects.energyRestore) {
        newState.energy = Math.min(100, newState.energy + action.effects.energyRestore);
      }
      if (action.effects.chaosReduction) {
        newState.chaos = Math.max(0, newState.chaos - action.effects.chaosReduction);
      }
      if (action.effects.strainReduction) {
        newState.strain = Math.max(0, newState.strain - action.effects.strainReduction);
      }
      if (action.effects.hydrationRestore) {
        newState.hydrationDebt = Math.max(0, newState.hydrationDebt - action.effects.hydrationRestore);
      }
      if (action.effects.memoryRestore) {
        newState.memoryIntegrity = Math.min(100, newState.memoryIntegrity + action.effects.memoryRestore);
      }
      if (action.effects.timeBonus) {
        newState.timeRemaining += action.effects.timeBonus;
      }
      // COOKIE CLICKER MODE: Sleep debt recovery
      if (action.effects.sleepDebtReduction) {
        newState.sleepDebt = Math.max(0, newState.sleepDebt - action.effects.sleepDebtReduction);
      }

      newState.log.push({
        timestamp: 3600 - newState.timeRemaining,
        message: `Used: ${action.name}`,
        type: 'info',
      });

      return newState;
    });
  }, []);

  const handleDisclaimerAccept = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      hasSeenDisclaimer: true,
    }));
  }, []);

  const handleToggleSettings = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      showSettings: !prevState.showSettings,
    }));
  }, []);

  const handleToggleDistortion = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      disableDistortion: !prevState.disableDistortion,
    }));
  }, []);

  const handleToggleMotion = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      reducedMotion: !prevState.reducedMotion,
    }));
  }, []);

  const handleToggleNotifications = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      muteNotifications: !prevState.muteNotifications,
    }));
  }, []);

  const handleToggleFloatingNumbers = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      showFloatingNumbers: !prevState.showFloatingNumbers,
    }));
  }, []);

  const handleToggleCompactLog = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      compactLog: !prevState.compactLog,
    }));
  }, []);

  const handleToggleLogTimestamps = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      showLogTimestamps: !prevState.showLogTimestamps,
    }));
  }, []);

  const handleToggleLogCorruption = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      disableLogCorruption: !prevState.disableLogCorruption,
    }));
  }, []);

  const handleChangeFontSize = useCallback((size: 'small' | 'default' | 'large') => {
    setState(prevState => ({
      ...prevState,
      fontSize: size,
    }));
  }, []);

  const handleReset = useCallback(() => {
    if (confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setState(createInitialState());
    }
  }, []);

  // New progression system handlers
  const handleUseEnergyBooster = useCallback((boosterId: string) => {
    setState(prevState => {
      if (!isExtendedGameState(prevState)) return prevState;
      const extendedState = { ...prevState } as ExtendedGameState;
      applyEnergyBooster(extendedState, boosterId);
      return extendedState;
    });
  }, []);

  const handleUseChaosAction = useCallback((actionId: string) => {
    setState(prevState => {
      if (!isExtendedGameState(prevState)) return prevState;
      const extendedState = { ...prevState } as ExtendedGameState;
      applyChaosAction(extendedState, actionId);
      return extendedState;
    });
  }, []);

  const handleClaimOfflineProgress = useCallback(() => {
    setState(prevState => {
      if (!isExtendedGameState(prevState)) return prevState;
      const extendedState = prevState as ExtendedGameState;
      claimOfflineProgress(extendedState);
      return { ...extendedState };
    });
  }, []);

  const handleMarkMessagesAsRead = useCallback(() => {
    setState(prevState => {
      return markMessagesAsRead(prevState);
    });
  }, []);

  const handleSwitchEnergyMode = useCallback((modeId: string) => {
    setState(prevState => {
      if (!isExtendedGameState(prevState)) return prevState;
      const extendedState = { ...prevState } as ExtendedGameState;
      switchEnergyMode(extendedState, modeId);
      return extendedState;
    });
  }, []);

  const handleSwitchChaosStrategy = useCallback((strategyId: string) => {
    setState(prevState => {
      if (!isExtendedGameState(prevState)) return prevState;
      const extendedState = { ...prevState } as ExtendedGameState;
      switchChaosStrategy(extendedState, strategyId);
      return extendedState;
    });
  }, []);

  const handleSaveBuild = useCallback((name: string, notes?: string) => {
    setState(prevState => {
      if (!isExtendedGameState(prevState)) return prevState;
      const extendedState = { ...prevState } as ExtendedGameState;
      saveBuild(extendedState, name, notes);
      return extendedState;
    });
  }, []);

  const handleSwapBuild = useCallback((buildIndex: number) => {
    setState(prevState => {
      if (!isExtendedGameState(prevState)) return prevState;
      const extendedState = { ...prevState } as ExtendedGameState;
      swapToBuild(extendedState, buildIndex);
      return extendedState;
    });
  }, []);

  const handleDeleteBuild = useCallback((buildId: string) => {
    setState(prevState => {
      if (!isExtendedGameState(prevState)) return prevState;
      const extendedState = { ...prevState } as ExtendedGameState;
      deleteBuild(extendedState, buildId);
      return extendedState;
    });
  }, []);

  const handleOverwriteBuild = useCallback((buildIndex: number) => {
    setState(prevState => {
      if (!isExtendedGameState(prevState)) return prevState;
      const extendedState = { ...prevState } as ExtendedGameState;
      overwriteBuild(extendedState, buildIndex);
      return extendedState;
    });
  }, []);

  const handleUpdateBuildName = useCallback((buildId: string, newName: string) => {
    setState(prevState => {
      if (!isExtendedGameState(prevState)) return prevState;
      const extendedState = { ...prevState } as ExtendedGameState;
      updateBuildName(extendedState, buildId, newName);
      return extendedState;
    });
  }, []);

  const handleImportBuild = useCallback((buildJson: string) => {
    setState(prevState => {
      if (!isExtendedGameState(prevState)) return prevState;
      const extendedState = { ...prevState } as ExtendedGameState;
      importBuild(extendedState, buildJson);
      return extendedState;
    });
  }, []);

  const handleLoadStarterBuild = useCallback((presetId: string) => {
    setState(prevState => {
      if (!isExtendedGameState(prevState)) return prevState;
      const extendedState = { ...prevState } as ExtendedGameState;
      loadStarterBuild(extendedState, presetId);
      return extendedState;
    });
  }, []);

  // Memoize vibes per second calculation for performance
  const vibesPerSecond = useMemo(() => {
    return Object.entries(state.substances).reduce((total: number, [id, count]: [string, number]) => {
      const substance = getSubstance(id);
      if (!substance) return total;
      const multiplier = calculateProductionMultiplier(state, id);
      return total + (substance.baseVibes * count * multiplier);
    }, 0);
  }, [state.substances, state.upgrades, state.insightPoints]);

  return (
    <div className={`app font-${state.fontSize} ${state.reducedMotion ? 'reduced-motion' : ''} distortion-${state.distortionLevel}`}>
      <header className="app-header">
        <h1>🌙 THE NIGHT MANAGER™</h1>

        {/* Compact Stats in Header */}
        <div className="header-stats">
          <div className="header-stat">
            <span className="header-stat-label">VIBES</span>
            <span className="header-stat-value vibes">{formatNumber(state.vibes)}</span>
          </div>
          <div className="header-stat">
            <span className="header-stat-label">per/sec</span>
            <span className="header-stat-value">{formatNumber(vibesPerSecond, 1)}</span>
          </div>
          <div className="header-stat">
            <span className="header-stat-label">Time</span>
            <span className="header-stat-value time">{Math.floor(state.timeRemaining / 60)}:{(state.timeRemaining % 60).toString().padStart(2, '0')}</span>
          </div>
          <StatPanel state={state} compact={true} />
        </div>

        <button className="settings-button" onClick={handleToggleSettings}>
          ⚙️ Settings
        </button>
      </header>

      <main className="app-main four-column-layout">
        {/* Column 1 - Shops & Upgrades */}
        <div className="column column-left scrollable">
          <section className="shop-section">
            <SubstanceShop state={state} onPurchase={handlePurchase} />
          </section>

          <section className="upgrade-section">
            <UpgradeShop state={state} onPurchase={handlePurchaseUpgrade} />
          </section>
        </div>

        {/* Column 2 - Central TSP Button - ALWAYS VISIBLE */}
        <div className="column column-center">
          <div className="tsp-button-container">
            <MainButton
              onClick={handleMainClick}
              disabled={false}
              distortionLevel={state.distortionLevel}
            />
            <div className="button-combo-display">
              {state.comboCount > 5 && (
                <div className="combo-indicator">
                  🔥 {state.comboCount}x COMBO
                </div>
              )}
              {state.autoClickerLevel > 0 && (
                <span className="auto-clicker-badge" title={`Auto-clicker active (Tier ${state.autoClickerLevel})`}>
                  🤖 AUTO
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Column 3 - Actions & Management */}
        <div className="column column-middle scrollable">
          <section className="maintenance-section">
            <MaintenancePanel state={state} onAction={handleMaintenance} />
          </section>

          {/* New Action Panels */}
          {isExtendedGameState(state) && (
            <section className="action-panels-section">
              <ActionPanels
                gameState={state as ExtendedGameState}
                onUseEnergyBooster={handleUseEnergyBooster}
                onUseChaosAction={handleUseChaosAction}
              />
            </section>
          )}

          {/* Strategy Selector - Energy Modes & Chaos Strategies */}
          {isExtendedGameState(state) && (
            <section className="strategy-selector-section">
              <StrategySelector
                gameState={state as ExtendedGameState}
                onSwitchEnergyMode={handleSwitchEnergyMode}
                onSwitchChaosStrategy={handleSwitchChaosStrategy}
              />
            </section>
          )}

          {/* Build Manager - Save/Load Configurations */}
          {isExtendedGameState(state) && (
            <section className="build-manager-section">
              <BuildManagerPanel
                gameState={state as ExtendedGameState}
                onSaveBuild={handleSaveBuild}
                onSwapBuild={handleSwapBuild}
                onDeleteBuild={handleDeleteBuild}
                onOverwriteBuild={handleOverwriteBuild}
                onUpdateBuildName={handleUpdateBuildName}
                onImportBuild={handleImportBuild}
                onLoadStarterBuild={handleLoadStarterBuild}
              />
            </section>
          )}
        </div>

        {/* Column 4 - Social & Log */}
        <div className="column column-right scrollable">
          {/* Group Chat & Organ Complaints - Social Feedback */}
          <section className="social-feedback-section">
            <GroupChatPanel
              state={state}
              onMarkAsRead={handleMarkMessagesAsRead}
            />
            <OrganComplaintsPanel state={state} />
          </section>

          <section className="log-section">
            <LogPanel state={state} />
          </section>

          {/* Hidden Meters & Progression Status */}
          <section className="meters-section">
            <HiddenMeters state={state} />
            {isExtendedGameState(state) && <ProgressionStatus gameState={state} />}
          </section>
        </div>
      </main>

      {/* Floating numbers on click */}
      {floatingNumbers.map(fn => (
        <FloatingNumber
          key={fn.id}
          id={fn.id}
          value={fn.value}
          x={fn.x}
          y={fn.y}
          onComplete={handleFloatingNumberComplete}
        />
      ))}

      {/* Offline Progress Welcome */}
      {isExtendedGameState(state) && (
        <OfflineProgressManager
          gameState={state as ExtendedGameState}
          onClaimOfflineProgress={handleClaimOfflineProgress}
        />
      )}

      {!state.hasSeenDisclaimer && <DisclaimerModal onAccept={handleDisclaimerAccept} />}

      {state.showSettings && (
        <SettingsModal
          state={state}
          onClose={handleToggleSettings}
          onToggleDistortion={handleToggleDistortion}
          onToggleMotion={handleToggleMotion}
          onToggleNotifications={handleToggleNotifications}
          onToggleFloatingNumbers={handleToggleFloatingNumbers}
          onToggleCompactLog={handleToggleCompactLog}
          onToggleLogTimestamps={handleToggleLogTimestamps}
          onToggleLogCorruption={handleToggleLogCorruption}
          onChangeFontSize={handleChangeFontSize}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;
