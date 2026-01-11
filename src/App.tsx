import { useState, useEffect, useCallback } from 'react';
import { GameState } from './game/types';
import { createInitialState, startNewNight } from './game/state';
import { gameTick } from './game/tick';
import { getSubstance, getSubstanceCost } from './game/substances';
import { getAction } from './game/maintenance';
import { checkAchievements, getAchievement } from './game/achievements';
import { calculateExperience, getKnowledgeLevel } from './game/prestige';
import { formatNumber } from './utils/formatter';
import { StatPanel } from './components/StatPanel';
import { MainButton } from './components/MainButton';
import { SubstanceShop } from './components/SubstanceShop';
import { MaintenancePanel } from './components/MaintenancePanel';
import { HiddenMeters } from './components/HiddenMeters';
import { LogPanel } from './components/LogPanel';
import { DisclaimerModal } from './components/DisclaimerModal';
import { NightEndModal } from './components/NightEndModal';
import { SettingsModal } from './components/SettingsModal';
import { FloatingNumber } from './components/FloatingNumber';
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
        return parsed;
      } catch (e) {
        console.error('Failed to parse save:', e);
      }
    }
    return createInitialState();
  });

  const [showNightEnd, setShowNightEnd] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState<string[]>([]);
  const [floatingNumbers, setFloatingNumbers] = useState<Array<{ id: string; value: number; x: number; y: number }>>([]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Game loop
  useEffect(() => {
    if (!state.isNightActive) {
      if (!showNightEnd) {
        setShowNightEnd(true);
      }
      return;
    }

    const interval = setInterval(() => {
      setState(prevState => {
        const now = Date.now();
        const deltaTime = now - prevState.lastTickTime;
        const newState = gameTick(prevState, deltaTime);
        newState.lastTickTime = now;

        // Check for new achievements
        const newAchievements = checkAchievements(newState, prevState.achievements);
        if (newAchievements.length > 0) {
          newState.achievements = [...newState.achievements, ...newAchievements];
          setAchievementQueue(prev => [...prev, ...newAchievements]);

          // Log achievements
          newAchievements.forEach(achId => {
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

        return newState;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [state.isNightActive, showNightEnd]);

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
    setState(prevState => {
      if (!prevState.isNightActive || prevState.energy < 5) return prevState;

      const newState = { ...prevState };
      const vibesGained = 10;
      newState.vibes += vibesGained;
      newState.energy -= 5;
      newState.chaos += Math.random() * 3;

      newState.log.push({
        timestamp: 3600 - newState.timeRemaining,
        message: 'Running the night. Vibes +10',
        type: 'info',
      });

      // Create floating number
      setFloatingNumbers(prev => [...prev, {
        id: Date.now().toString() + Math.random(),
        value: vibesGained,
        x: event.clientX,
        y: event.clientY,
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

      newState.log.push({
        timestamp: 3600 - newState.timeRemaining,
        message: `Used: ${action.name}`,
        type: 'info',
      });

      return newState;
    });
  }, []);

  const handleNewNight = useCallback(() => {
    setState(prevState => {
      const xpGained = calculateExperience(prevState, prevState.hasCollapsed);
      const newTotalXP = prevState.experience + xpGained;
      const newLevel = getKnowledgeLevel(newTotalXP);

      const persistentData = {
        experience: newTotalXP,
        knowledgeLevel: newLevel,
        nightsCompleted: prevState.nightsCompleted + 1,
        achievements: prevState.achievements,
        hasSeenDisclaimer: prevState.hasSeenDisclaimer,
        disableDistortion: prevState.disableDistortion,
        reducedMotion: prevState.reducedMotion,
        fontSize: prevState.fontSize,
        sleepDebt: prevState.sleepDebt,
      };

      return startNewNight(persistentData);
    });
    setShowNightEnd(false);
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
      setShowNightEnd(false);
    }
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
                return total + (substance ? substance.baseVibes * count : 0);
              }, 0), 1)}
            </div>
          </div>

          <div className="main-action-container">
            <MainButton
              onClick={handleMainClick}
              disabled={!state.isNightActive || state.energy < 5}
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
          </section>

          {/* Scrollable Content Area */}
          <div className="scrollable-content">
            <section className="shop-section">
              <SubstanceShop state={state} onPurchase={handlePurchase} />
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

      {!state.hasSeenDisclaimer && <DisclaimerModal onAccept={handleDisclaimerAccept} />}

      {showNightEnd && !state.hasSeenDisclaimer && (
        <NightEndModal state={state} onNewNight={handleNewNight} />
      )}

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
