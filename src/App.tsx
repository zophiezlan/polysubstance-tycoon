import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { GameState } from "./game/types";
import { createInitialState, startNewNight } from "./game/state";
import { gameTick } from "./game/tick";
import {
  createSaveData,
  loadSaveData,
  SaveLoadNotice,
} from "./utils/saveValidation";
import {
  getSubstance,
  getSubstanceCost,
  getSubstanceEnergyCost,
} from "./game/substances";
import { getAction } from "./game/maintenance";
import { checkAchievements, getAchievement } from "./game/achievements";
import { formatNumber, formatTime } from "./utils/formatter";
import { MainButton } from "./components/MainButton";
import { SubstanceShop } from "./components/SubstanceShop";
import { UpgradeShop } from "./components/UpgradeShop";
import { MaintenancePanel } from "./components/MaintenancePanel";
import { HiddenMeters } from "./components/HiddenMeters";
import { LogPanel } from "./components/LogPanel";
import { DisclaimerModal } from "./components/DisclaimerModal";
import { SettingsModal } from "./components/SettingsModal";
import { FloatingNumber } from "./components/FloatingNumber";
import { canPurchaseUpgrade, getUpgrade } from "./game/upgrades";
import { canPrestige, getPrestigeInfo, performPrestige } from "./game/prestige";
import {
  calculateClickPower,
  calculateChaosDampening,
  calculateProductionMultiplier,
  getAutoClickerTier,
} from "./game/upgradeEffects";
import { updateCombo, calculateComboMultiplier } from "./game/combos";
import { OfflineProgressManager } from "./components/OfflineProgress";
import { GroupChatPanel } from "./components/GroupChatPanel";
import { OrganComplaintsPanel } from "./components/OrganComplaintsPanel";
import {
  checkOfflineProgress,
  claimOfflineProgress,
} from "./game/offlineProgress";
import { markMessagesAsRead } from "./game/groupChat";
// Random Events (Golden Cookie equivalent)
import { RandomEventManager } from "./game/randomEvents";
import { RandomEventPopup } from "./components/RandomEventPopup";
import "./App.css";

const STORAGE_KEY = "polysubstance-tycoon-save";
const TICK_INTERVAL = 1000; // 1 second

type SaveStatus = "idle" | "saved" | "failed";
type PurchaseToast = {
  id: string;
  message: string;
  amount?: string;
  variant?: "success" | "warning" | "flash";
};

function App() {
  const initialLoad = useRef<{ notice: SaveLoadNotice }>({ notice: null });
  const [state, setState] = useState<GameState>(() => {
    const outcome = loadSaveData(STORAGE_KEY);
    initialLoad.current.notice = outcome.notice;
    let baseState = outcome.state;
    if (baseState.isNightActive === false) {
      baseState = startNewNight(baseState);
    }

    // Compute offline progress before resetting timestamps (uses lastActiveTime)
    const withOffline = checkOfflineProgress(baseState);
    withOffline.lastTickTime = Date.now();
    withOffline.nightStartTime = Date.now();
    withOffline.lastActiveTime = Date.now();
    return withOffline;
  });

  const [saveNotice, setSaveNotice] = useState<SaveLoadNotice>(
    initialLoad.current.notice,
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveStatusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [achievementQueue, setAchievementQueue] = useState<string[]>([]);
  const [floatingNumbers, setFloatingNumbers] = useState<
    Array<{ id: string; value: number; x: number; y: number }>
  >([]);
  const [purchaseToasts, setPurchaseToasts] = useState<PurchaseToast[]>([]);

  // A short clock that ticks every 250ms so flash-sale countdowns stay live
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const flashSaleRemainingMs = Math.max(
    0,
    state.flashSaleDiscountUntil - now,
  );
  const flashSaleActive = flashSaleRemainingMs > 0;

  // Random Event Manager (Golden Cookie equivalent)
  const randomEventManager = useRef<RandomEventManager>(
    new RandomEventManager(),
  );
  const [activeRandomEvent, setActiveRandomEvent] = useState<{
    event: any;
    timeRemaining: number;
  } | null>(null);

  // Initialize RandomEventManager from saved state
  useEffect(() => {
    if (state.randomEventData) {
      randomEventManager.current.deserialize(state.randomEventData);
    }
  }, []); // Only run on mount

  const saveWriteCount = useRef(0);
  const isFirstSave = useRef(true);

  const enqueueToast = useCallback((toast: Omit<PurchaseToast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setPurchaseToasts((prev) => [...prev, { ...toast, id }].slice(-5));
    setTimeout(() => {
      setPurchaseToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  // Save to localStorage whenever state changes (debounced for performance)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const saveData = createSaveData(state);
        const serialized = JSON.stringify(saveData);
        localStorage.setItem(STORAGE_KEY, serialized);

        // Rotate backup slot every 10 writes so a very recent corruption
        // doesn't clobber a known-good fallback.
        saveWriteCount.current += 1;
        if (saveWriteCount.current % 10 === 1) {
          localStorage.setItem(STORAGE_KEY + "_backup", serialized);
        }

        // Skip the indicator on first save (mount) — too noisy
        if (!isFirstSave.current) {
          setSaveStatus("saved");
          if (saveStatusTimer.current) clearTimeout(saveStatusTimer.current);
          saveStatusTimer.current = setTimeout(
            () => setSaveStatus("idle"),
            1200,
          );
        }
        isFirstSave.current = false;
      } catch (error) {
        console.error("Failed to save to localStorage:", error);
        setSaveStatus("failed");
      }
    }, 1000); // Debounce: save 1 second after last state change

    return () => clearTimeout(timeoutId);
  }, [state]);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prevState) => {
        const now = Date.now();
        const rawDelta = now - prevState.lastTickTime;
        const safeDelta = Math.max(0, rawDelta);
        const deltaTime = Math.min(safeDelta, TICK_INTERVAL);
        let newState = gameTick(prevState, deltaTime);
        newState.lastTickTime = now;

        // Update random events
        randomEventManager.current.update(newState, now / 1000); // Convert to seconds
        const activeEvent = randomEventManager.current.getActiveEvent();
        setActiveRandomEvent(activeEvent);

        // Save random event state
        newState.randomEventData = randomEventManager.current.serialize();

        // Check for new achievements
        const newAchievements = checkAchievements(
          newState,
          prevState.achievements,
        );
        if (newAchievements.length > 0) {
          const previouslyUnlocked = new Set(prevState.achievements);
          const achievementsToAdd = newAchievements.filter(
            (achId) => !previouslyUnlocked.has(achId),
          );

          if (achievementsToAdd.length > 0) {
            newState.achievements = [
              ...prevState.achievements,
              ...achievementsToAdd,
            ];

            if (!newState.muteNotifications) {
              setAchievementQueue((prev) => {
                const queued = new Set(prev);
                const additions = achievementsToAdd.filter(
                  (achId) => !queued.has(achId),
                );
                return additions.length > 0 ? [...prev, ...additions] : prev;
              });
            }

            // Log achievements
            achievementsToAdd.forEach((achId) => {
              const ach = getAchievement(achId);
              if (ach) {
                newState.log.push({
                  timestamp: 3600 - newState.timeRemaining,
                  message: `🏆 ${ach.name}`,
                  type: "achievement",
                });
              }
            });
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
        setAchievementQueue((prev) => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [achievementQueue]);

  const handleFloatingNumberComplete = useCallback((id: string) => {
    setFloatingNumbers((prev) => prev.filter((fn) => fn.id !== id));
  }, []);

  const handleMainClick = useCallback(
    (event: { clientX: number; clientY: number }) => {
      const { clientX, clientY } = event;
      setState((prevState) => {
        let newState = { ...prevState };

        // HYBRID MODEL: Clicking GENERATES energy (+0.5 per click)
        newState.energy = Math.min(100, newState.energy + 0.5);
        newState.totalEnergyGenerated += 0.5; // Track energy generation

        // COOKIE CLICKER MODE: Update combo system
        newState = updateCombo(newState);
        const comboMultiplier = calculateComboMultiplier(newState.comboCount);

        const baseClickPower = calculateClickPower(prevState);

        // Energy provides a scaling bonus multiplier (0-100 → 1.0x-2.0x)
        const energyBonus = 1 + newState.energy / 100; // 0 energy = 1x, 100 energy = 2x

        // Apply combo multiplier!
        let vibesGained = Math.floor(
          baseClickPower * energyBonus * comboMultiplier,
        );
        vibesGained = Math.max(1, vibesGained); // Minimum 1 vibe per click

        newState.vibes += vibesGained;
        newState.totalVibesEarned += vibesGained;
        newState.totalClicks += 1;

        // Track highest single click
        if (vibesGained > newState.highestSingleClick) {
          newState.highestSingleClick = vibesGained;
        }

        // Minimal chaos increase - make it VERY easy to manage
        const chaosIncrease =
          Math.random() * 1.5 * (1 - calculateChaosDampening(prevState));
        newState.chaos = Math.min(100, newState.chaos + chaosIncrease);

        // Lore-appropriate messages based on state
        let message = "Running the night.";
        const energyLevel = newState.energy;
        if (energyLevel > 80) {
          message = "Vibing hard.";
        } else if (energyLevel < 30) {
          message = "Coasting on fumes.";
        }
        if (newState.chaos > 80) {
          message = "Everything is fine.";
        }
        if (newState.comboCount > 100) {
          message = `${newState.comboCount}x COMBO!!!`;
        }

        // Only log occasionally to reduce spam
        if (Math.random() < 0.15) {
          const bonusText =
            energyLevel > 50 ? ` (⚡${(energyBonus * 100).toFixed(0)}%)` : "";
          const comboText =
            newState.comboCount > 25 ? ` 🔥${newState.comboCount}x` : "";
          newState.log.push({
            timestamp: 3600 - newState.timeRemaining,
            message: `${message} Vibes +${vibesGained}${bonusText}${comboText}`,
            type: "info",
          });
        }

        // Create floating number
        if (prevState.showFloatingNumbers) {
          setFloatingNumbers((prev) => [
            ...prev,
            {
              id: Date.now().toString() + Math.random(),
              value: vibesGained,
              x: clientX,
              y: clientY,
            },
          ]);
        }

        return newState;
      });
    },
    [],
  );

  const handlePurchase = useCallback(
    (substanceId: string) => {
      let toastQueued = false;
      setState((prevState) => {
        const substance = getSubstance(substanceId);
        if (!substance) return prevState;

        const owned = prevState.substances[substanceId] || 0;
        const baseVibesCost = getSubstanceCost(substance, owned);
        const energyCost = getSubstanceEnergyCost(substance);

        const now = Date.now();
        const flashSaleActive = prevState.flashSaleDiscountUntil > now;
        const vibesCost = flashSaleActive
          ? Math.ceil(baseVibesCost * 0.5)
          : baseVibesCost;

        // Check both vibes and energy
        if (prevState.vibes < vibesCost || prevState.energy < energyCost)
          return prevState;

        const newState = { ...prevState };
        newState.vibes -= vibesCost;
        newState.energy = Math.max(0, newState.energy - energyCost);
        newState.substances[substanceId] = owned + 1;

        // Track statistics
        newState.totalSubstancesPurchased += 1;

        // Apply time extension immediately
        if (substance.timeExtension) {
          newState.timeRemaining += substance.timeExtension;
        }

        // Flash sale is consumed on a single purchase
        if (flashSaleActive) {
          newState.flashSaleDiscountUntil = 0;
        }

        // Bad batch: next substance purchase applies chaos/strain spike, then clears
        let badBatch = false;
        if (prevState.badBatchDebuffUntil > now) {
          newState.chaos = Math.min(100, newState.chaos + 20);
          newState.strain += 10;
          newState.badBatchDebuffUntil = 0;
          badBatch = true;
          newState.log.push({
            timestamp: 3600 - newState.timeRemaining,
            message: `⚠️ Bad batch! Chaos +20, strain +10.`,
            type: "warning",
          });
        }

        newState.log.push({
          timestamp: 3600 - newState.timeRemaining,
          message: flashSaleActive
            ? `💸 Purchased ${substance.name} (x${owned + 1}) [50% off!]`
            : `Purchased ${substance.name} (x${owned + 1}) [-${energyCost} energy]`,
          type: "info",
        });

        if (!toastQueued && !newState.muteNotifications) {
          toastQueued = true;
          if (badBatch) {
            enqueueToast({
              message: `⚠️ Bad batch on ${substance.name}!`,
              amount: "+20 chaos / +10 strain",
              variant: "warning",
            });
          } else {
            enqueueToast({
              message: `✓ ${substance.name} x${owned + 1}`,
              amount: `-${formatNumber(vibesCost)} V`,
              variant: flashSaleActive ? "flash" : "success",
            });
          }
        }

        return newState;
      });
    },
    [enqueueToast],
  );

  const handlePurchaseUpgrade = useCallback(
    (upgradeId: string) => {
      let toastQueued = false;
      setState((prevState) => {
        const upgrade = getUpgrade(upgradeId);
        if (!upgrade) return prevState;

        const now = Date.now();
        const flashSaleActive = prevState.flashSaleDiscountUntil > now;
        const cost = flashSaleActive
          ? Math.ceil(upgrade.cost * 0.5)
          : upgrade.cost;

        // canPurchaseUpgrade checks cost against upgrade.cost; re-check with discount.
        if (prevState.vibes < cost) return prevState;
        if (!canPurchaseUpgrade({ ...upgrade, cost }, prevState))
          return prevState;

        const newState = { ...prevState };
        newState.vibes -= cost;
        newState.upgrades.push(upgradeId);

        // Track statistics
        newState.totalUpgradesPurchased += 1;

        if (flashSaleActive) {
          newState.flashSaleDiscountUntil = 0;
        }

        newState.log.push({
          timestamp: 3600 - newState.timeRemaining,
          message: flashSaleActive
            ? `🔬 Unlocked: ${upgrade.name} [50% off!]`
            : `🔬 Unlocked: ${upgrade.name}`,
          type: "info",
        });

        if (!toastQueued && !newState.muteNotifications) {
          toastQueued = true;
          enqueueToast({
            message: `🔬 ${upgrade.name}`,
            amount: `-${formatNumber(cost)} V`,
            variant: flashSaleActive ? "flash" : "success",
          });
        }

        return newState;
      });
    },
    [enqueueToast],
  );

  const handleMaintenance = useCallback((actionId: string) => {
    setState((prevState) => {
      const action = getAction(actionId);
      if (!action) return prevState;

      const cooldownRemaining = prevState.actionCooldowns[actionId] || 0;
      if (cooldownRemaining > 0 || prevState.vibes < action.cost)
        return prevState;

      const newState = { ...prevState };
      newState.vibes -= action.cost;
      newState.actionCooldowns[actionId] = action.cooldown;

      // Track statistics
      newState.totalMaintenanceActionsUsed += 1;

      // Apply effects
      if (action.effects.energyRestore) {
        newState.energy = Math.min(
          100,
          newState.energy + action.effects.energyRestore,
        );
      }
      if (action.effects.chaosReduction) {
        newState.chaos = Math.max(
          0,
          newState.chaos - action.effects.chaosReduction,
        );
      }
      if (action.effects.strainReduction) {
        newState.strain = Math.max(
          0,
          newState.strain - action.effects.strainReduction,
        );
      }
      if (action.effects.hydrationRestore) {
        newState.hydrationDebt = Math.max(
          0,
          newState.hydrationDebt - action.effects.hydrationRestore,
        );
      }
      if (action.effects.memoryRestore) {
        newState.memoryIntegrity = Math.min(
          100,
          newState.memoryIntegrity + action.effects.memoryRestore,
        );
      }
      if (action.effects.timeBonus) {
        newState.timeRemaining += action.effects.timeBonus;
      }
      // COOKIE CLICKER MODE: Sleep debt recovery
      if (action.effects.sleepDebtReduction) {
        newState.sleepDebt = Math.max(
          0,
          newState.sleepDebt - action.effects.sleepDebtReduction,
        );
      }

      newState.log.push({
        timestamp: 3600 - newState.timeRemaining,
        message: `Used: ${action.name}`,
        type: "info",
      });

      return newState;
    });
  }, []);

  const handleDisclaimerAccept = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      hasSeenDisclaimer: true,
    }));
  }, []);

  const handleToggleSettings = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      showSettings: !prevState.showSettings,
    }));
  }, []);

  const handleToggleDistortion = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      disableDistortion: !prevState.disableDistortion,
    }));
  }, []);

  const handleToggleMotion = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      reducedMotion: !prevState.reducedMotion,
    }));
  }, []);

  const handleToggleNotifications = useCallback(() => {
    setState((prevState) => {
      const nextMute = !prevState.muteNotifications;
      if (nextMute) {
        setAchievementQueue([]);
      }
      return {
        ...prevState,
        muteNotifications: nextMute,
      };
    });
  }, []);

  const handleToggleFloatingNumbers = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      showFloatingNumbers: !prevState.showFloatingNumbers,
    }));
  }, []);

  const handleToggleCompactLog = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      compactLog: !prevState.compactLog,
    }));
  }, []);

  const handleToggleLogTimestamps = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      showLogTimestamps: !prevState.showLogTimestamps,
    }));
  }, []);

  const handleToggleLogCorruption = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      disableLogCorruption: !prevState.disableLogCorruption,
    }));
  }, []);

  const handleChangeFontSize = useCallback(
    (size: "small" | "default" | "large") => {
      setState((prevState) => ({
        ...prevState,
        fontSize: size,
      }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to reset ALL progress? This cannot be undone.",
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY + "_backup");
      setState(createInitialState());
    }
  }, []);

  const handlePrestige = useCallback(() => {
    setState((prevState) => {
      const info = getPrestigeInfo(prevState);
      if (info.pointsToGain <= 0) return prevState;
      const ok = confirm(
        `Prestige now? You'll gain ${info.pointsToGain} Insight Point${info.pointsToGain === 1 ? "" : "s"} ` +
          `(total ${info.potentialPoints}, +${Math.round((info.nextMultiplier - 1) * 100)}% to all production). ` +
          `Your current run resets — vibes, substances, and meters wipe. Upgrades and achievements stay.`,
      );
      if (!ok) return prevState;
      const next = performPrestige(prevState);
      enqueueToast({
        message: `✨ Prestiged for ${info.pointsToGain} Insight Point${info.pointsToGain === 1 ? "" : "s"}`,
        variant: "success",
      });
      return next;
    });
  }, [enqueueToast]);

  const handleDismissSaveNotice = useCallback(() => {
    setSaveNotice(null);
  }, []);

  const handleClaimOfflineProgress = useCallback(() => {
    setState((prevState) => claimOfflineProgress(prevState));
  }, []);

  const handleMarkMessagesAsRead = useCallback(() => {
    setState((prevState) => {
      return markMessagesAsRead(prevState);
    });
  }, []);

  const handleActivateRandomEvent = useCallback(() => {
    setState((prevState) => {
      const result = randomEventManager.current.activateEvent(prevState);
      if (result.success) {
        // Clear the active event display
        setActiveRandomEvent(null);

        // Track statistics
        const newState = { ...prevState };
        newState.totalRandomEventsClicked += 1;

        // Show success message in log
        if (result.message) {
          newState.log.push({
            timestamp: 3600 - newState.timeRemaining,
            message: result.message,
            type: "achievement",
          });
        }

        return newState;
      }
      return prevState;
    });
  }, []);

  // Memoize vibes per second calculation for performance
  const vibesPerSecond = useMemo(() => {
    let total = Object.entries(state.substances).reduce(
      (acc: number, [id, count]: [string, number]) => {
        const substance = getSubstance(id);
        if (!substance) return acc;
        const multiplier = calculateProductionMultiplier(state, id);
        return acc + substance.baseVibes * count * multiplier;
      },
      0,
    );
    if (
      state.productionBoostUntil > Date.now() &&
      state.productionBoostMultiplier > 1
    ) {
      total *= state.productionBoostMultiplier;
    }
    return total;
  }, [
    state.substances,
    state.upgrades,
    state.insightPoints,
    state.energy,
    state.chaos,
    state.productionBoostUntil,
    state.productionBoostMultiplier,
  ]);

  const autoClickerTier = getAutoClickerTier(state);

  // Modal priority: Disclaimer > OfflineProgress > Settings.
  // RandomEventPopup, save notice, achievement toasts, and purchase toasts are
  // non-modal and may coexist with whichever modal is open.
  const showDisclaimer = !state.hasSeenDisclaimer;
  const showOfflineProgress =
    !showDisclaimer &&
    !!state.offlineProgressPending &&
    !state.offlineProgressPending.claimed;
  const showSettings =
    !showDisclaimer && !showOfflineProgress && state.showSettings;

  // Zero-state hint shows for new players with nothing purchased and few clicks
  const showZeroStateHint =
    state.totalClicks < 5 &&
    Object.keys(state.substances).length === 0 &&
    !showDisclaimer;

  const exactVibes = Math.floor(state.vibes).toLocaleString();
  const exactPerSecond = vibesPerSecond.toFixed(2);

  const visibleAchievements = achievementQueue.slice(0, 3);
  const hiddenAchievementCount = Math.max(0, achievementQueue.length - 3);

  return (
    <div
      className={`app font-${state.fontSize} ${state.reducedMotion ? "reduced-motion" : ""} ${state.disableDistortion ? "disable-distortion" : ""} distortion-${state.distortionLevel}`}
    >
      <header className="app-header">
        <div className="header-left">
          <h1>🌙 THE NIGHT MANAGER™</h1>
        </div>

        <div className="header-stats">
          <div className="header-stat">
            <span className="header-stat-label">Vibes:</span>
            <span
              className="header-stat-value vibes"
              title={`Exact: ${exactVibes}`}
              aria-live="polite"
              aria-atomic="true"
            >
              {formatNumber(state.vibes)}
            </span>
          </div>
          <div className="header-stat-bar">
            <div className="header-stat-label-small">
              Energy {Math.floor(state.energy)}
            </div>
            <div
              className="header-bar"
              role="progressbar"
              aria-label="Energy"
              aria-valuenow={Math.floor(state.energy)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`header-bar-fill ${state.energy < 20 ? "danger" : state.energy < 50 ? "warning" : "normal"}`}
                style={{ width: `${state.energy}%` }}
              />
            </div>
          </div>
          <div className="header-stat-bar">
            <div className="header-stat-label-small">
              Chaos {Math.floor(state.chaos)}
            </div>
            <div
              className="header-bar"
              role="progressbar"
              aria-label="Chaos"
              aria-valuenow={Math.floor(state.chaos)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`header-bar-fill ${state.chaos > 70 ? "danger" : state.chaos < 30 ? "low" : "normal"}`}
                style={{ width: `${state.chaos}%` }}
              />
            </div>
          </div>
          <div className="header-stat">
            <span className="header-stat-label" aria-hidden="true">
              ⏱
            </span>
            <span
              className="header-stat-value time"
              aria-label="Time remaining"
            >
              {formatTime(state.timeRemaining)}
            </span>
          </div>
        </div>

        <div className="header-right">
          <span
            className={`save-indicator ${saveStatus !== "idle" ? "visible" : ""} ${saveStatus === "failed" ? "failed" : ""}`}
            role="status"
            aria-live="polite"
          >
            {saveStatus === "failed" ? "⚠ Save failed" : "💾 Saved"}
          </span>
          <button
            type="button"
            className="settings-button"
            onClick={handleToggleSettings}
            aria-label="Open settings"
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      {flashSaleActive && (
        <div className="flash-sale-banner" role="status" aria-live="polite">
          <span>💸 FLASH SALE — 50% off your next purchase!</span>
          <span className="flash-sale-countdown">
            {Math.ceil(flashSaleRemainingMs / 1000)}s
          </span>
        </div>
      )}

      <main className="app-main">
        {/* Column 1: Vibes - Big Clicker */}
        <div className="game-column column-vibes">
          <div className="vibes-display">
            <div className="vibes-label">VIBES</div>
            <div
              className="vibes-value"
              title={`Exact: ${exactVibes}`}
              aria-live="polite"
              aria-atomic="true"
            >
              {formatNumber(state.vibes)}
            </div>
            <div
              className="vibes-per-second"
              title={`${exactPerSecond} vibes per second`}
            >
              per second: {formatNumber(vibesPerSecond, 1)}
              {autoClickerTier > 0 && (
                <span
                  className="auto-clicker-badge"
                  title={`Auto-clicker active (Tier ${autoClickerTier})`}
                >
                  🤖 AUTO
                </span>
              )}
            </div>
          </div>

          {showZeroStateHint && (
            <div className="zero-state-hint" role="note">
              👇 Click the button to earn vibes. Buy a substance to start
              passive production.
            </div>
          )}

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
          </div>
        </div>

        {/* Column 2: Acquisitions */}
        <div className="game-column column-acquisitions">
          <SubstanceShop
            state={state}
            onPurchase={handlePurchase}
            flashSaleActive={flashSaleActive}
          />
        </div>

        {/* Column 3: Upgrades */}
        <div className="game-column column-upgrades">
          <UpgradeShop
            state={state}
            onPurchase={handlePurchaseUpgrade}
            flashSaleActive={flashSaleActive}
          />
        </div>

        {/* Column 4: Everything Else */}
        <div className="game-column column-everything-else">
          {/* Prestige — only surfaces once eligible */}
          {canPrestige(state) && (() => {
            const info = getPrestigeInfo(state);
            const gainPercent = Math.round((info.nextMultiplier - info.currentMultiplier) * 100);
            return (
              <section className="section-card prestige-card">
                <h3>✨ ASCENSION AVAILABLE</h3>
                <p className="prestige-blurb">
                  You've earned enough vibes to transcend this run. Reset for{" "}
                  <strong>{info.pointsToGain} Insight Point{info.pointsToGain === 1 ? "" : "s"}</strong>{" "}
                  (+{gainPercent}% to all production, forever).
                </p>
                <p className="prestige-blurb prestige-warning">
                  Wipes: vibes, substances, meters. Keeps: upgrades, achievements, knowledge.
                </p>
                <button
                  className="prestige-button"
                  onClick={handlePrestige}
                  aria-label={`Prestige for ${info.pointsToGain} insight points`}
                >
                  Ascend ({info.pointsToGain} IP)
                </button>
              </section>
            );
          })()}

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
          <span className="footer-stat">
            Nights Completed: {state.nightsCompleted || 0}
          </span>
          <span
            className="footer-stat"
            title={`Exact: ${Math.floor(state.totalVibesEarned).toLocaleString()}`}
          >
            Total Vibes Earned: {formatNumber(state.totalVibesEarned)}
          </span>
          <span
            className="footer-stat"
            title={`Exact: ${state.totalClicks.toLocaleString()}`}
          >
            Total Clicks: {formatNumber(state.totalClicks)}
          </span>
          {state.achievements && state.achievements.length > 0 && (
            <span className="footer-stat">
              Achievements: {state.achievements.length}
            </span>
          )}
        </div>
      </footer>

      {!state.muteNotifications && achievementQueue.length > 0 && (
        <div
          className="achievement-toast"
          role="status"
          aria-live="polite"
          aria-label={`${achievementQueue.length} achievement${achievementQueue.length > 1 ? "s" : ""} unlocked`}
        >
          {visibleAchievements.map((achId, index) => {
            const ach = getAchievement(achId);
            return ach ? (
              <div
                key={achId}
                className="achievement-item"
                style={{ opacity: 1 - index * 0.3 }}
              >
                🏆 <strong>{ach.name}</strong>
                <div className="achievement-description">{ach.description}</div>
              </div>
            ) : null;
          })}
          {hiddenAchievementCount > 0 && (
            <div className="achievement-overflow">
              +{hiddenAchievementCount} more queued
            </div>
          )}
        </div>
      )}

      {/* Floating numbers on click */}
      {floatingNumbers.map((fn) => (
        <FloatingNumber
          key={fn.id}
          id={fn.id}
          value={fn.value}
          x={fn.x}
          y={fn.y}
          onComplete={handleFloatingNumberComplete}
        />
      ))}

      {/* Purchase toast container */}
      {purchaseToasts.length > 0 && (
        <div
          className="purchase-toast-container"
          role="status"
          aria-live="polite"
        >
          {purchaseToasts.map((toast) => (
            <div
              key={toast.id}
              className={`purchase-toast toast-${toast.variant ?? "success"}`}
            >
              {toast.message}
              {toast.amount && (
                <span className="toast-amount">{toast.amount}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Random Event Popup (Golden Cookie equivalent) */}
      {activeRandomEvent && (
        <RandomEventPopup
          event={activeRandomEvent.event}
          timeRemaining={activeRandomEvent.timeRemaining}
          onActivate={handleActivateRandomEvent}
        />
      )}

      {saveNotice && (
        <div
          className={`save-notice save-notice-${saveNotice}`}
          role="status"
        >
          <span className="save-notice-text">
            {saveNotice === "restored-from-backup"
              ? "⚠️ Save file was unreadable. Restored from an earlier backup — you may have lost a few minutes of progress."
              : "⚠️ Save file was unrecoverable. Starting fresh."}
          </span>
          <button
            type="button"
            className="save-notice-dismiss"
            onClick={handleDismissSaveNotice}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Modals — priority order, only one rendered at a time */}
      {showDisclaimer && <DisclaimerModal onAccept={handleDisclaimerAccept} />}

      {showOfflineProgress && (
        <OfflineProgressManager
          gameState={state}
          onClaimOfflineProgress={handleClaimOfflineProgress}
        />
      )}

      {showSettings && (
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
