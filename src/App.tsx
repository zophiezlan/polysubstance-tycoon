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
import { getSubstance, getSubstanceCost, getSubstanceEnergyCost } from './game/substances';
import { getAction } from './game/maintenance';
import { checkAchievements, getAchievement } from './game/achievements';
import { formatNumber, formatTime } from './utils/formatter';
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
// import { MilestoneManager } from './components/MilestoneNotification'; // Disabled - redundant with Active Bonuses
import { OfflineProgressManager } from './components/OfflineProgress';
import { ActionPanels } from './components/ActionPanels';
import { GroupChatPanel } from './components/GroupChatPanel';
import { OrganComplaintsPanel } from './components/OrganComplaintsPanel';
// import { StrategySelector } from './components/StrategySelector'; // DISABLED FOR HYBRID MODEL TESTING
import { isExtendedGameState, ExtendedGameState } from './game/progressionTypes';
import { useEnergyBooster as applyEnergyBooster } from './game/energyManagement';
import { useChaosAction as applyChaosAction } from './game/chaosStrategy';
import { claimOfflineProgress } from './game/progressionIntegration';
// import { checkMilestones } from './game/milestones'; // Disabled - redundant with Active Bonuses
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

  const [achievementQueue, setAchievementQueue] = useState<string[]>([]);
  const [floatingNumbers, setFloatingNumbers] = useState<Array<{ id: string; value: number; x: number; y: number }>>([]);
  // const [milestoneQueue, setMilestoneQueue] = useState<Milestone[]>([]); // Disabled - redundant with Active Bonuses

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

        // Check for new achievements
        const newAchievements = checkAchievements(newState, prevState.achievements);
        if (newAchievements.length > 0) {
          const previouslyUnlocked = new Set(prevState.achievements);
          const achievementsToAdd = newAchievements.filter(achId => !previouslyUnlocked.has(achId));

          if (achievementsToAdd.length > 0) {
            newState.achievements = [...prevState.achievements, ...achievementsToAdd];

            if (!newState.muteNotifications) {
              setAchievementQueue(prev => {
                const queued = new Set(prev);
                const additions = achievementsToAdd.filter(achId => !queued.has(achId));
                return additions.length > 0 ? [...prev, ...additions] : prev;
              });
            }

            // Log achievements
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

        // Check for new milestones (if using extended state)
        // Milestone notifications disabled - redundant with Active Bonuses section
        // if (isExtendedGameState(newState)) {
        //   const completedMilestones = checkMilestones(newState as ExtendedGameState);
        //   if (completedMilestones.length > 0 && !newState.muteNotifications) {
        //     setMilestoneQueue(prev => [...prev, ...completedMilestones]);
        //   }
        // }

        return newState;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Clear achievement notifications after a delay
  useEffect(() => {
    if (achievementQueue.length > 0) {
      const timeout = setTimeout(() => {
        setAchievementQueue(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [achievementQueue]);

  const handleFloatingNumberComplete = useCallback((id: string) => {
    setFloatingNumbers(prev => prev.filter(fn => fn.id !== id));
  }, []);

  const handleMainClick = useCallback((event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    setState(prevState => {
      let newState = { ...prevState };

      // HYBRID MODEL: Clicking GENERATES energy (+0.5 per click)
      newState.energy = Math.min(100, newState.energy + 0.5);

      // COOKIE CLICKER MODE: Update combo system
      newState = updateCombo(newState);
      const comboMultiplier = calculateComboMultiplier(newState.comboCount);

      const baseClickPower = calculateClickPower(prevState);

      // Energy provides a scaling bonus multiplier (0-100 → 1.0x-2.0x)
      const energyBonus = 1 + (newState.energy / 100); // 0 energy = 1x, 100 energy = 2x

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
      const vibesCost = getSubstanceCost(substance, owned);
      const energyCost = getSubstanceEnergyCost(substance);

      // Check both vibes and energy
      if (prevState.vibes < vibesCost || prevState.energy < energyCost) return prevState;

      const newState = { ...prevState };
      newState.vibes -= vibesCost;
      newState.energy = Math.max(0, newState.energy - energyCost);
      newState.substances[substanceId] = owned + 1;

      // Apply time extension immediately
      if (substance.timeExtension) {
        newState.timeRemaining += substance.timeExtension;
      }

      newState.log.push({
        timestamp: 3600 - newState.timeRemaining,
        message: `Purchased ${substance.name} (x${owned + 1}) [-${energyCost} energy]`,
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
    setState(prevState => {
      const nextMute = !prevState.muteNotifications;
      if (nextMute) {
        setAchievementQueue([]);
        // setMilestoneQueue([]); // Disabled - redundant with Active Bonuses
      }
      return {
        ...prevState,
        muteNotifications: nextMute,
      };
    });
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

  // Disabled - redundant with Active Bonuses section
  // const handleClearMilestones = useCallback(() => {
  //   setMilestoneQueue([]);
  // }, []);

  const handleMarkMessagesAsRead = useCallback(() => {
    setState(prevState => {
      return markMessagesAsRead(prevState);
    });
  }, []);

  // DISABLED FOR HYBRID MODEL TESTING - Strategy selector is commented out
  // const handleSwitchEnergyMode = useCallback((modeId: string) => {
  //   setState(prevState => {
  //     if (!isExtendedGameState(prevState)) return prevState;
  //     const extendedState = { ...prevState } as ExtendedGameState;
  //     switchEnergyMode(extendedState, modeId);
  //     return extendedState;
  //   });
  // }, []);

  // const handleSwitchChaosStrategy = useCallback((strategyId: string) => {
  //   setState(prevState => {
  //     if (!isExtendedGameState(prevState)) return prevState;
  //     const extendedState = { ...prevState } as ExtendedGameState;
  //     switchChaosStrategy(extendedState, strategyId);
  //     return extendedState;
  //   });
  // }, []);

  // Memoize vibes per second calculation for performance
  const vibesPerSecond = useMemo(() => {
    return Object.entries(state.substances).reduce((total: number, [id, count]: [string, number]) => {
      const substance = getSubstance(id);
      if (!substance) return total;
      const multiplier = calculateProductionMultiplier(state, id);
      return total + (substance.baseVibes * count * multiplier);
    }, 0);
  }, [state.substances, state.upgrades, state.insightPoints, state.energy, state.chaos]);

  return (
    <div className={`app font-${state.fontSize} ${state.reducedMotion ? 'reduced-motion' : ''} distortion-${state.distortionLevel}`}>
      <header className="app-header">
        <div className="header-left">
          <h1>🌙 THE NIGHT MANAGER™</h1>
        </div>

        <div className="header-stats">
          <div className="header-stat">
            <span className="header-stat-label">Vibes:</span>
            <span className="header-stat-value vibes">{formatNumber(state.vibes)}</span>
          </div>
          <div className="header-stat-bar">
            <div className="header-stat-label-small">Energy {Math.floor(state.energy)}</div>
            <div className="header-bar">
              <div className={`header-bar-fill ${state.energy < 20 ? 'danger' : state.energy < 50 ? 'warning' : 'normal'}`}
                   style={{ width: `${state.energy}%` }} />
            </div>
          </div>
          <div className="header-stat-bar">
            <div className="header-stat-label-small">Chaos {Math.floor(state.chaos)}</div>
            <div className="header-bar">
              <div className={`header-bar-fill ${state.chaos > 70 ? 'danger' : state.chaos < 30 ? 'low' : 'normal'}`}
                   style={{ width: `${state.chaos}%` }} />
            </div>
          </div>
          <div className="header-stat">
            <span className="header-stat-label">⏱</span>
            <span className="header-stat-value time">{formatTime(state.timeRemaining)}</span>
          </div>
        </div>

        <div className="header-right">
          <button className="settings-button" onClick={handleToggleSettings}>
            ⚙️ Settings
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Column 1: Vibes - Big Clicker */}
        <div className="game-column column-vibes">
          <div className="vibes-display">
            <div className="vibes-label">VIBES</div>
            <div className="vibes-value">{formatNumber(state.vibes)}</div>
            <div className="vibes-per-second">
              per second: {formatNumber(vibesPerSecond, 1)}
              {state.autoClickerLevel > 0 && (
                <span className="auto-clicker-badge" title={`Auto-clicker active (Tier ${state.autoClickerLevel})`}>
                  🤖 AUTO
                </span>
              )}
            </div>
          </div>

          <div className="main-action-container">
            <MainButton
              onClick={handleMainClick}
              disabled={false}
              distortionLevel={state.distortionLevel}
            />
          </div>

          {/* Hidden Meters */}
          <div className="left-panel-meters">
            <HiddenMeters state={state} />
            {isExtendedGameState(state) && <ProgressionStatus gameState={state} />}
          </div>
        </div>

        {/* Column 2: Acquisitions */}
        <div className="game-column column-acquisitions">
          <SubstanceShop state={state} onPurchase={handlePurchase} />
        </div>

        {/* Column 3: Upgrades */}
        <div className="game-column column-upgrades">
          <UpgradeShop state={state} onPurchase={handlePurchaseUpgrade} />
        </div>

        {/* Column 4: Everything Else */}
        <div className="game-column column-everything-else">
          {/* Energy Boosters & Chaos Actions */}
          {isExtendedGameState(state) && (
            <section className="section-card">
              <ActionPanels
                gameState={state as ExtendedGameState}
                onUseEnergyBooster={handleUseEnergyBooster}
                onUseChaosAction={handleUseChaosAction}
              />
            </section>
          )}

          {/* Maintenance Actions */}
          <section className="section-card">
            <MaintenancePanel state={state} onAction={handleMaintenance} />
          </section>

          {/* Group Chat & Organ Complaints */}
          <section className="section-card">
            <GroupChatPanel
              state={state}
              onMarkAsRead={handleMarkMessagesAsRead}
            />
          </section>

          <section className="section-card">
            <OrganComplaintsPanel state={state} />
          </section>

          {/* Log */}
          <section className="section-card">
            <LogPanel state={state} />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <span className="footer-stat">Nights Completed: {state.nightsCompleted || 0}</span>
          <span className="footer-stat">Total Vibes Earned: {formatNumber(state.totalVibesEarned)}</span>
          <span className="footer-stat">Total Clicks: {formatNumber(state.totalClicks)}</span>
          {state.achievements && state.achievements.length > 0 && (
            <span className="footer-stat">Achievements: {state.achievements.length}</span>
          )}
        </div>
      </footer>

      {!state.muteNotifications && achievementQueue.length > 0 && (
        <div className="achievement-toast">
          {achievementQueue.slice(0, 3).map((achId, index) => {
            const ach = getAchievement(achId);
            return ach ? (
              <div key={achId} className="achievement-item" style={{ opacity: 1 - index * 0.3 }}>
                🏆 <strong>{ach.name}</strong>
                <div className="achievement-description">{ach.description}</div>
              </div>
            ) : null;
          })}
        </div>
      )}

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

      {/* Milestone Notifications - Disabled (redundant with Active Bonuses section) */}
      {/* {!state.muteNotifications && (
        <MilestoneManager
          milestones={milestoneQueue}
          onClearMilestones={handleClearMilestones}
        />
      )} */}

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
