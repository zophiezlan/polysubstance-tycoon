import { GameState } from '../game/types';
import { UPGRADES, canPurchaseUpgrade } from '../game/upgrades';
import { formatNumber } from '../utils/formatter';
import { getSubstance } from '../game/substances';

interface UpgradeShopProps {
  state: GameState;
  onPurchase: (upgradeId: string) => void;
}

export function UpgradeShop({ state, onPurchase }: UpgradeShopProps) {
  // Filter to show only available and affordable upgrades
  const availableUpgrades = UPGRADES.filter(upgrade => {
    if (state.upgrades.includes(upgrade.id)) return false;

    // Check requirements (but don't check cost for display)
    if (upgrade.requirement) {
      const req = upgrade.requirement;

      if (req.substanceOwned) {
        const owned = state.substances[req.substanceOwned.id] || 0;
        if (owned < req.substanceOwned.count) return false;
      }

      if (req.totalVibes && state.totalVibesEarned < req.totalVibes) {
        return false;
      }

      if (req.nightsCompleted && state.nightsCompleted < req.nightsCompleted) {
        return false;
      }

      if (req.upgradeOwned && !state.upgrades.includes(req.upgradeOwned)) {
        return false;
      }
    }

    return true;
  });

  if (availableUpgrades.length === 0) {
    return (
      <div className="upgrade-shop">
        <h3>🔬 UPGRADES</h3>
        <div className="no-upgrades">
          <p>No upgrades available. Purchase more substances to unlock upgrades!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="upgrade-shop">
      <h3>🔬 UPGRADES</h3>
      <div className="upgrade-list">
        {availableUpgrades.slice(0, 8).map(upgrade => {
          const isPurchasable = canPurchaseUpgrade(upgrade, state);

          // Check if this is a synergy upgrade and if the synergy is active
          const isSynergyUpgrade = upgrade.synergySubstances && upgrade.synergySubstances.length > 0;
          const synergyActive = isSynergyUpgrade && upgrade.synergySubstances!.every(
            sId => (state.substances[sId] || 0) > 0
          );

          return (
            <div key={upgrade.id} className="upgrade-item">
              <div className="upgrade-header">
                <div className="upgrade-name">
                  <strong>{upgrade.name}</strong>
                  <span className="upgrade-tier"> [T{upgrade.tier}]</span>
                  {upgrade.category === 'synergy' && (
                    <span className={`synergy-badge ${synergyActive ? 'active' : 'inactive'}`} title={synergyActive ? 'Synergy active!' : 'Need all substances'}>
                      ⚗️
                    </span>
                  )}
                </div>
                <button
                  className="buy-button"
                  onClick={() => onPurchase(upgrade.id)}
                  disabled={!isPurchasable}
                >
                  Buy ({formatNumber(upgrade.cost)} V)
                </button>
              </div>
              <div className="upgrade-description">{upgrade.description}</div>

              {/* Show synergy requirements */}
              {isSynergyUpgrade && (
                <div className="synergy-requirements">
                  <span className="synergy-label">Synergy:</span>
                  {upgrade.synergySubstances!.map((sId, idx) => {
                    const substance = getSubstance(sId);
                    const owned = (state.substances[sId] || 0) > 0;
                    return (
                      <span key={sId} className={`synergy-substance ${owned ? 'owned' : 'missing'}`}>
                        {idx > 0 && ' + '}
                        {substance?.name || sId}
                        {owned ? ' ✓' : ' ✗'}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="upgrade-effects">
                {upgrade.effects.clickPower && (
                  <span className="effect-positive">+{upgrade.effects.clickPower} click power</span>
                )}
                {upgrade.effects.clickMultiplier && (
                  <span className="effect-positive">x{upgrade.effects.clickMultiplier} click power</span>
                )}
                {upgrade.effects.productionMultiplier && (
                  <span className="effect-positive">x{upgrade.effects.productionMultiplier} production</span>
                )}
                {upgrade.effects.globalProductionMultiplier && (
                  <span className="effect-positive">x{upgrade.effects.globalProductionMultiplier} all production</span>
                )}
                {upgrade.effects.energyCostReduction && (
                  <span className="effect-info">-{upgrade.effects.energyCostReduction * 100}% energy cost</span>
                )}
                {upgrade.effects.chaosDampening && (
                  <span className="effect-positive">-{upgrade.effects.chaosDampening * 100}% chaos</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {availableUpgrades.length > 8 && (
        <div className="more-upgrades">
          +{availableUpgrades.length - 8} more upgrades available...
        </div>
      )}
    </div>
  );
}
