# Upgrade Compatibility Notes

## Known Issues with Current Game Mechanics

### 1. BROKEN: "Efficient Energy Use" (ID: `efficient-energy`)
**Location:** upgrades.ts line 29-37
**Issue:** This upgrade claims to reduce energy cost of clicks by 50%, but in the current hybrid energy model:
- Clicks GENERATE +0.5 energy (not cost energy)
- The `calculateEnergyCost()` function in upgradeEffects.ts is never called
- This upgrade has NO EFFECT on gameplay

**Fix Options:**
- A) Remove this upgrade entirely
- B) Repurpose it to increase energy generation from clicks
- C) Change description to match actual functionality (if any)

**Recommended:** REMOVE or REPURPOSE

### 2. INCOMPLETE: Synergy Upgrades
**Affected Upgrades:**
- `cocktail-theory` (line 733): "Cocktail Theory" - should boost alcohol + empathogen
- `speedball-dynamics` (line 746): "Speedball Dynamics" - should boost stimulant + sedative
- `candy-flip-protocol` (line 759): "Candy Flip Protocol" - should boost empathogen + psychedelic

**Issue:** These upgrades have `productionMultiplier` effects but NO `substanceId` field.
- Current behavior: Acts as global multiplier for ALL substances
- Intended behavior: Should boost BOTH substances in the combination

**Fix:** Synergy upgrades need special handling since they affect multiple substances. Options:
- A) Keep as global multipliers (simplest, but not thematic)
- B) Add special "synergy" effect type that boosts multiple substanceIds
- C) Create separate upgrade entries for each substance in the pair

**Recommended:** Keep as global multipliers for now (they work, just not thematically accurate)

### 3. FIXED: Stimulant Energy Flip Bug
**Issue:** Stimulants were flipping from +energy to -energy after just 30 seconds of gameplay
**Root Cause:** Code was using elapsed game time instead of cumulative time bonus from stimulants
**Fix Applied:** Now correctly uses `stimulantCount * 5` to track bonus time
**File:** tick.ts lines 42-45

### 4. PARTIALLY IMPLEMENTED: Combo Timer Extensions
**Affected Upgrades:**
- `combo-master` (line 873): "+1 second combo timer"
- `combo-god` (line 886): "+2 seconds combo timer"
- `eternal-combo` (line 900): "+5 seconds combo timer"

**Status:** Implementation EXISTS in upgradeEffects.ts (`calculateComboTimerExtension`)
**Verification Needed:** Check if combos.ts actually calls this function

### 5. VERIFIED WORKING: Auto-clicker Upgrades
**Status:** Properly implemented in upgradeEffects.ts and integrated into game loop
- auto-clicker-1: 1 cps ✓
- auto-clicker-2: 5 cps ✓
- auto-clicker-3: 20 cps ✓
- auto-clicker-4: 100 cps ✓

### 6. NEEDS VERIFICATION: Idle Bonus Upgrades
**Affected Upgrades:**
- `idle-bonus-1`, `idle-bonus-2`, `idle-bonus-3` (lines 694-728)

**Issue:** These use `globalProductionMultiplier` but should only apply when player is away
**Verification Needed:** Check if offline/idle system distinguishes between active and idle bonuses

## Summary

**Must Fix:**
- Efficient Energy Use (broken, unusable)

**Should Fix:**
- Synergy upgrades (working but not as intended)

**Already Fixed:**
- Stimulant energy flip
- Column border scrolling

**Verify:**
- Combo timer extensions (likely working)
- Idle bonus system (may need special handling)
