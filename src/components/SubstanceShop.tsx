import { GameState } from '../game/types';
import { SUBSTANCES, getSubstanceCost } from '../game/substances';
import { formatNumber } from '../utils/formatter';
import { hasUnlock } from '../game/prestige';

interface SubstanceShopProps {
  state: GameState;
  onPurchase: (substanceId: string) => void;
}

export function SubstanceShop({ state, onPurchase }: SubstanceShopProps) {
  const showDetailed = hasUnlock(state.knowledgeLevel, 'detailedInteractions');

  return (
    <div className="substance-shop">
      <h3>🏪 ACQUISITIONS</h3>
      <div className="substance-list">
        {SUBSTANCES.map(substance => {
          const owned = state.substances[substance.id] || 0;
          const cost = getSubstanceCost(substance, owned);
          const canAfford = state.vibes >= cost;

          return (
            <div key={substance.id} className="substance-item">
              <div className="substance-header">
                <div className="substance-name">
                  <strong>{substance.name}</strong>
                  {owned > 0 && <span className="owned-count"> x{owned}</span>}
                </div>
                <button
                  className="buy-button"
                  onClick={() => onPurchase(substance.id)}
                  disabled={!canAfford}
                >
                  Buy ({formatNumber(cost)} V)
                </button>
              </div>
              <div className="substance-tagline">{substance.tagline}</div>
              <div className="substance-effects">
                <span className="effect-positive">+{substance.baseVibes}/s Vibes</span>
                {substance.energyMod !== 0 && (
                  <span className={substance.energyMod > 0 ? 'effect-positive' : 'effect-negative'}>
                    {substance.energyMod > 0 ? '+' : ''}{substance.energyMod}/s Energy
                  </span>
                )}
                {substance.chaosMod !== 0 && (
                  <span className={substance.chaosMod > 0 ? 'effect-warning' : 'effect-positive'}>
                    {substance.chaosMod > 0 ? '+' : ''}{substance.chaosMod} Chaos
                  </span>
                )}
                {substance.timeExtension && (
                  <span className="effect-info">+{substance.timeExtension}s time</span>
                )}
              </div>
              {showDetailed && (
                <div className="substance-hidden-effects">
                  {substance.strainMod > 0 && <span className="hidden-effect">⚠ +{substance.strainMod}/s Strain</span>}
                  {substance.hydrationMod > 0 && <span className="hidden-effect">💧 +{substance.hydrationMod}/s Hydration Debt</span>}
                  {substance.memoryMod < 0 && <span className="hidden-effect">🧠 {substance.memoryMod}/s Memory</span>}
                  {substance.confidenceMod > 0 && <span className="hidden-effect">😊 +{substance.confidenceMod} Confidence</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
