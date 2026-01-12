import { useState, useEffect, useCallback } from 'react';
import { GameState } from './game/types';
import { createInitialState, startNewNight } from './game/state';
import { gameTick } from './game/tick';
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
import { MilestoneManager } from './components/MilestoneNotification';
import { OfflineProgressManager } from './components/OfflineProgress';
import { ActionPanels } from './components/ActionPanels';
import { isExtendedGameState, ExtendedGameState, Milestone } from './game/progressionTypes';
import { useEnergyBooster as applyEnergyBooster } from './game/energyManagement';
import { useChaosAction as applyChaosAction } from './game/chaosStrategy';
import { claimOfflineProgress } from './game/progressionIntegration';
import { checkMilestones } from './game/milestones';
import './App.css';

const STORAGE_KEY = 'polysubstance-tycoon-save';
const TICK_INTERVAL = 1000; // 1 second

function App() {
  const [state, setState] = useState<GameState>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If there's a saved active night, create new night with persistent data
        if (parsed.isNightActive === false) {
          return startNewNight(parsed);
        }
        const baseState = createInitialState();
        return {
          ...baseState,
          ...parsed,
          substances: parsed.substances || {},
          upgrades: parsed.upgrades || [],
          achievements: parsed.achievements || [],
          actionCooldowns: parsed.actionCooldowns || {},
          log: parsed.log || baseState.log,
          lastTickTime: Date.now(),
          nightStartTime: Date.now(),
        };
      } catch (e) {
        console.error('Failed to parse save:', e);
      }
    }
    return createInitialState();
  });

  const [achievementQueue, setAchievementQueue] = useState<string[]>([]);
  const [floatingNumbers, setFloatingNumbers] = useState<Array<{ id: string; value: number; x: number; y: number }>>([]);
  const [milestoneQueue, setMilestoneQueue] = useState<Milestone[]>([]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

            setAchievementQueue(prev => {
              const queued = new Set(prev);
              const additions = achievementsToAdd.filter(achId => !queued.has(achId));
              return additions.length > 0 ? [...prev, ...additions] : prev;
            });

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
        if (isExtendedGameState(newState)) {
          const completedMilestones = checkMilestones(newState as ExtendedGameState);
          if (completedMilestones.length > 0) {
            setMilestoneQueue(prev => [...prev, ...completedMilestones]);
          }
        }

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

      // COOKIE CLICKER MODE: Update combo system
      newState = updateCombo(newState);
      const comboMultiplier = calculateComboMultiplier(newState.comboCount);

      const baseClickPower = calculateClickPower(prevState);

      // COOKIE CLICKER MODE: Clicks NEVER cost energy!
      // Energy provides a scaling bonus multiplier (0-100 → 1.0x-2.0x)
      // This makes energy a pure positive mechanic
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
      if (newState.comboCount > 50) {
        message = `${newState.comboCount}x COMBO!!!`;
      }

      // Only log occasionally to reduce spam
      if (Math.random() < 0.15) {
        const bonusText = energyLevel > 50 ? ` (⚡${(energyBonus * 100).toFixed(0)}%)` : '';
        const comboText = newState.comboCount > 5 ? ` 🔥${newState.comboCount}x` : '';
        newState.log.push({
          timestamp: 3600 - newState.timeRemaining,
          message: `${message} Vibes +${vibesGained}${bonusText}${comboText}`,
          type: 'info',
        });
      }

      // Create floating number
      setFloatingNumbers(prev => [...prev, {
        id: Date.now().toString() + Math.random(),
        value: vibesGained,
        x: clientX,
        y: clientY,
      }]);

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

  const handleClearMilestones = useCallback(() => {
    setMilestoneQueue([]);
  }, []);

  return (
    <div className={`app font-${state.fontSize} ${state.reducedMotion ? 'reduced-motion' : ''} distortion-${state.distortionLevel}`}>
      <header className="app-header">
        <h1>🌙 THE NIGHT MANAGER™</h1>
        <button className="settings-button" onClick={handleToggleSettings}>
          ⚙️ Settings
        </button>
      </header>

      <main className="app-main">
        {/* Left Panel - Big Clicker & Vibes */}
        <div className="left-panel">
          <div className="vibes-display">
            <div className="vibes-label">VIBES</div>
            <div className="vibes-value">{formatNumber(state.vibes)}</div>
            <div className="vibes-per-second">
              per second: {formatNumber(Object.entries(state.substances).reduce((total, [id, count]) => {
                const substance = getSubstance(id);
                if (!substance) return total;
                const multiplier = calculateProductionMultiplier(state, id);
                return total + (substance.baseVibes * count * multiplier);
              }, 0), 1)}
            </div>
          </div>

          <div className="main-action-container">
            <MainButton
              onClick={handleMainClick}
              disabled={false}
              distortionLevel={state.distortionLevel}
            />
          </div>
        </div>

        {/* Right Panel - Stats & Scrollable Content */}
        <div className="right-panel">
          {/* Fixed Stats at Top */}
          <section className="stats-section">
            <StatPanel state={state} />
            <HiddenMeters state={state} />
            {/* New Progression Status */}
            {isExtendedGameState(state) && <ProgressionStatus gameState={state} />}
          </section>

          {/* Scrollable Content Area */}
          <div className="scrollable-content">
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

            <section className="shop-section">
              <SubstanceShop state={state} onPurchase={handlePurchase} />
            </section>

            <section className="upgrade-section">
              <UpgradeShop state={state} onPurchase={handlePurchaseUpgrade} />
            </section>

            <section className="maintenance-section">
              <MaintenancePanel state={state} onAction={handleMaintenance} />
            </section>

            <section className="log-section">
              <LogPanel state={state} />
            </section>
          </div>
        </div>
      </main>

      {achievementQueue.length > 0 && (
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

      {/* Milestone Notifications */}
      <MilestoneManager
        milestones={milestoneQueue}
        onClearMilestones={handleClearMilestones}
      />

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
          onChangeFontSize={handleChangeFontSize}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;
