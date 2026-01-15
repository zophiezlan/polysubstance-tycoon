# Upgrade Management System

## Overview

The upgrade management system provides structured categorization and querying capabilities for all game upgrades. This system helps identify patterns, incompatibilities, and makes the codebase more maintainable.

## Categories

All upgrades are now categorized into 8 types:

### 1. **Global** (`'global'`)
Affects all production, clicking, or game mechanics universally.

**Examples:**
- Better Technique (+5 click power)
- Practiced Hands (x2 click multiplier)
- Tolerance Management (+10% all production)
- Quantum Vibe Superposition (x2.5 all production)

**Characteristics:**
- Has `globalProductionMultiplier`, `clickPower`, or `clickMultiplier` effects
- No `substanceId` specified
- Benefits all gameplay styles

### 2. **Substance-Specific** (`'substance-specific'`)
Boosts a single substance's production.

**Examples:**
- Plastic Bottles (Alcohol LLC x2)
- Bulk Discount (Stimulant Startups x2)
- Test Kits (Empathogen Corp x2)

**Characteristics:**
- Has `substanceId` field pointing to specific substance
- Has `productionMultiplier` effect
- Requires owning that substance

### 3. **Synergy** (`'synergy'`)
Boosts combinations of substances working together.

**Examples:**
- Cocktail Theory (Alcohol + Empathogen +30%)
- Speedball Dynamics (Stimulant + Sedative +40%)
- Candy Flip Protocol (Empathogen + Psychedelic +50%)
- Jedi Flip Mastery (3-way combo +100%)

**Characteristics:**
- Has `synergySubstances` array listing 2+ substances
- Has `productionMultiplier` effect
- Thematically represents drug combinations

**Implementation Notes:**
The upgrade manager's `getSubstanceMultipliers()` function properly applies synergy bonuses to all substances in the array, not just globally.

### 4. **Automation** (`'automation'`)
Idle and auto-clicking mechanics.

**Examples:**
- Autoclicker Script (1 cps)
- Macro Optimization (5 cps)
- Neural Interface (20 cps)
- Quantum Clicking (100 cps)
- Passive Income (+50% idle)
- Time Dilation (+300% idle)

**Characteristics:**
- IDs start with `auto-clicker-` or `idle-bonus-`
- Provides passive vibe generation
- Enables idle gameplay

### 5. **Combo** (`'combo'`)
Enhances the click combo system.

**Examples:**
- Combo Mastery (+1s combo timer)
- Combo Deity (+2s combo timer)
- Eternal Combo (+5s combo timer)

**Characteristics:**
- IDs contain `combo`
- Extends combo duration or rewards
- Encourages active clicking

### 6. **Harm Reduction** (`'harm-reduction'`)
Reduces negative effects (chaos, strain, etc.).

**Examples:**
- Test Kit Pro (Strain +30% slower)
- Supplement Regimen (Strain +40% slower)
- Medical Supervision (Strain +50% slower)
- Controlled Chaos (-30% chaos generation)

**Characteristics:**
- Has `chaosDampening` effect
- Related to risk management
- Enables safer high-tier substance use

### 7. **Progression Gate** (`'progression-gate'`)
Required purchases to unlock higher-tier content.

**Examples:**
- Advanced Procurement License (Unlocks Research Chemicals+)
- Underground Network Access (Unlocks Experimental+)
- Forbidden Knowledge (Unlocks Forbidden+)
- Reality Breach Protocol (Unlocks Eldritch & Void)

**Characteristics:**
- IDs contain `tier-`, `license`, `clearance`, or `transcendence`
- No gameplay effects (empty `effects` object)
- Required by substance unlock conditions
- Very expensive relative to tier

### 8. **Special** (`'special'`)
Unique mechanics that don't fit other categories.

**Examples:**
- Selective Memory Suppression (Forget bad parts)
- Reality Distortion Field (Confidence = vibes)
- Industrial Denial Mechanism (Ignore chaos)
- Perspective Hacking (It's not addiction, it's passion)

**Characteristics:**
- Unusual or "cursed" mechanics
- Narrative/thematic effects
- May have psychological implications

## Usage

### Basic Queries

```typescript
import { getUpgradesByCategory, getOwnedUpgradesByCategory } from './game/upgradeManager';

// Get all global upgrades
const globalUpgrades = getUpgradesByCategory('global');

// Get player's synergy upgrades
const ownedSynergies = getOwnedUpgradesByCategory(gameState, 'synergy');
```

### Validation

```typescript
import { validateUpgrade, getUpgradeStats } from './game/upgradeManager';

// Check if an upgrade works correctly
const error = validateUpgrade('efficient-energy');
// Returns: "BROKEN: energyCostReduction is incompatible with current energy system"

// Get system-wide statistics
const stats = getUpgradeStats();
console.log(stats.broken);    // List of non-functioning upgrades
console.log(stats.incomplete); // List of upgrades missing proper configuration
```

### Substance Multiplier Calculation

```typescript
import { getSubstanceMultipliers } from './game/upgradeManager';

const multipliers = getSubstanceMultipliers(gameState, 'alcohol');
// Returns:
// {
//   specific: 3.0,    // From substance-specific upgrades (2x * 1.5x)
//   synergy: 1.3,     // From synergy upgrades (Cocktail Theory)
//   global: 2.2       // From global multipliers (Tolerance + Polypharmacy)
// }
// Total: 3.0 * 1.3 * 2.2 = 8.58x
```

### Player Recommendations

```typescript
import { getSuggestedUpgrades } from './game/upgradeManager';

// Get 3 recommended upgrades based on owned substances
const suggestions = getSuggestedUpgrades(gameState, 3);
```

### Progress Tracking

```typescript
import { getCategoryCompletion, hasCompletedCategory } from './game/upgradeManager';

const completion = getCategoryCompletion(gameState, 'automation');
// Returns: 75 (player has 3 out of 4 automation upgrades)

const hasAll = hasCompletedCategory(gameState, 'combo');
// Returns: true if player owns all combo upgrades
```

## Adding New Upgrades

When adding a new upgrade to `upgrades.ts`, include the `category` field:

```typescript
{
  id: 'new-upgrade',
  name: 'New Upgrade Name',
  description: 'What it does',
  cost: 1000,
  tier: 2,
  category: 'global', // REQUIRED: Choose appropriate category
  effects: {
    globalProductionMultiplier: 1.1,
  },
}
```

For **synergy upgrades**, also include `synergySubstances`:

```typescript
{
  id: 'nexus-flip',
  name: 'Nexus Flip',
  description: 'Psychedelic + dissociative = void comprehension. Both +60%.',
  cost: 5000000,
  tier: 5,
  category: 'synergy',
  synergySubstances: ['psychedelic', 'dissociative'],
  effects: {
    productionMultiplier: 1.6,
  },
}
```

## Auto-Categorization Script

Use the helper script to automatically categorize upgrades based on patterns:

```bash
npx ts-node scripts/categorize-upgrades.ts
```

The script uses priority-based rules to determine categories:
1. Progression gates (highest priority)
2. Automation upgrades
3. Combo upgrades
4. Synergy upgrades
5. Harm reduction
6. Special mechanics
7. Substance-specific (checks for `substanceId`)
8. Global (default fallback)

## Known Issues

### BROKEN Upgrades

**Efficient Energy Use** (`efficient-energy`)
- **Issue:** Uses `energyCostReduction` effect, but clicks GENERATE energy (not cost it)
- **Current Effect:** None (broken)
- **Fix:** Remove or repurpose to increase energy generation from clicks

### INCOMPLETE Upgrades

**Synergy Upgrades** (prior to this system)
- **Issue:** Missing `synergySubstances` arrays
- **Workaround:** Currently act as global multipliers
- **Fix:** Added `synergySubstances` arrays to properly identify which substances benefit

## Future Improvements

1. **Dynamic Synergy Detection:** Auto-detect substance combinations and suggest relevant synergy upgrades
2. **Smart Pricing:** Adjust upgrade costs based on player's production rate
3. **Achievement Integration:** Track category completion for achievements
4. **UI Filtering:** Allow players to filter upgrade shop by category
5. **Tutorial System:** Highlight category-appropriate upgrades for new players
6. **Balance Tools:** Generate reports on category power levels and cost efficiency

## Testing

The validation system will catch:
- Missing required fields (`substanceId` for substance-specific)
- Incompatible mechanics (`energyCostReduction` in hybrid energy model)
- Broken progression chains (auto-clicker tiers without requirements)
- Empty synergy arrays

Run validation on all upgrades:

```typescript
import { getUpgradeStats } from './game/upgradeManager';

const stats = getUpgradeStats();
console.log(`Total upgrades: ${stats.total}`);
console.log(`By category:`, stats.byCategory);
console.log(`Broken:`, stats.broken);
console.log(`Incomplete:`, stats.incomplete);
```
