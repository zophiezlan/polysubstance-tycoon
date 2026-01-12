#!/usr/bin/env python3
"""
Long-term gameplay balance analysis for Polysubstance Tycoon
Analyzes substance cost efficiency, upgrade progression, and prestige curves
"""

import math

# Substance definitions from substances.ts
SUBSTANCES = [
    {"id": "alcohol", "baseCost": 10, "costMult": 1.15, "baseVibes": 0.5},
    {"id": "stimulant", "baseCost": 25, "costMult": 1.2, "baseVibes": 1.5},
    {"id": "empathogen", "baseCost": 50, "costMult": 1.25, "baseVibes": 3},
    {"id": "dissociative", "baseCost": 40, "costMult": 1.18, "baseVibes": 1},
    {"id": "sedative", "baseCost": 35, "costMult": 1.2, "baseVibes": 0.8},
    {"id": "nootropic", "baseCost": 100, "costMult": 1.15, "baseVibes": 2.5},
    {"id": "deliriant", "baseCost": 250, "costMult": 1.18, "baseVibes": 4.5},
    {"id": "psychedelic", "baseCost": 750, "costMult": 1.22, "baseVibes": 8},
    {"id": "synthetic", "baseCost": 2500, "costMult": 1.25, "baseVibes": 15},
    {"id": "research", "baseCost": 10000, "costMult": 1.3, "baseVibes": 30},
    {"id": "exotic", "baseCost": 50000, "costMult": 1.35, "baseVibes": 60},
    {"id": "experimental", "baseCost": 250000, "costMult": 1.4, "baseVibes": 125},
    {"id": "forbidden", "baseCost": 1000000, "costMult": 1.45, "baseVibes": 250},
    {"id": "eldritch", "baseCost": 10000000, "costMult": 1.5, "baseVibes": 500},
    {"id": "void", "baseCost": 100000000, "costMult": 1.55, "baseVibes": 1000},
]

def calculate_cost(substance, count):
    """Calculate cost of purchasing nth unit of a substance"""
    return math.floor(substance["baseCost"] * (substance["costMult"] ** count))

def calculate_total_cost(substance, count):
    """Calculate total cost to buy 'count' units from 0"""
    total = 0
    for i in range(count):
        total += calculate_cost(substance, i)
    return total

def calculate_vibes_per_second(substance, count):
    """Calculate vibes/sec from 'count' units (before multipliers)"""
    return substance["baseVibes"] * count

def calculate_roi(substance, count):
    """Calculate vibes/sec per vibe invested"""
    total_cost = calculate_total_cost(substance, count)
    vibes_per_sec = calculate_vibes_per_second(substance, count)
    if total_cost == 0:
        return 0
    return vibes_per_sec / total_cost

def prestige_insight_points(total_vibes):
    """Calculate insight points from prestige (sqrt formula)"""
    return math.floor(math.sqrt(total_vibes / 1000000))

def vibes_for_next_insight(current_points):
    """Calculate vibes needed for next insight point"""
    next_points = current_points + 1
    return (next_points ** 2) * 1000000

print("=" * 80)
print("POLYSUBSTANCE TYCOON - LONG-TERM BALANCE ANALYSIS")
print("=" * 80)

# Analysis 1: Substance Cost Efficiency at Different Quantities
print("\n[1] SUBSTANCE COST EFFICIENCY - First 10 Units")
print("-" * 80)
print(f"{'Substance':<15} {'Cost/Unit 1':<15} {'Cost/Unit 10':<15} {'Total Cost (10)':<20} {'ROI (10 units)'}")
print("-" * 80)
for sub in SUBSTANCES:
    cost_1 = calculate_cost(sub, 0)
    cost_10 = calculate_cost(sub, 9)
    total_cost = calculate_total_cost(sub, 10)
    roi = calculate_roi(sub, 10)
    print(f"{sub['id']:<15} {cost_1:<15,} {cost_10:<15,} {total_cost:<20,} {roi:.6f}")

# Analysis 2: Which substance is most efficient at different budget levels?
print("\n[2] MOST EFFICIENT SUBSTANCE AT DIFFERENT BUDGETS")
print("-" * 80)
budgets = [100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000]
for budget in budgets:
    best_sub = None
    best_roi = 0
    for sub in SUBSTANCES:
        # Binary search to find max affordable units
        low, high = 0, 1000
        while low < high:
            mid = (low + high + 1) // 2
            if calculate_total_cost(sub, mid) <= budget:
                low = mid
            else:
                high = mid - 1

        affordable_count = low
        if affordable_count > 0:
            roi = calculate_roi(sub, affordable_count)
            if roi > best_roi:
                best_roi = roi
                best_sub = (sub['id'], affordable_count, roi)

    if best_sub:
        print(f"Budget {budget:>15,}: {best_sub[0]:<15} x{best_sub[1]:<5} (ROI: {best_sub[2]:.8f})")

# Analysis 3: Prestige Curve Analysis
print("\n[3] PRESTIGE CURVE - Insight Point Requirements")
print("-" * 80)
print(f"{'Insight Points':<20} {'Total Vibes Required':<25} {'Vibes for Next Point':<25} {'% Increase'}")
print("-" * 80)
prev_vibes = 0
for points in [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]:
    total_vibes = (points ** 2) * 1000000
    vibes_for_next = vibes_for_next_insight(points) - total_vibes
    if prev_vibes > 0:
        increase = ((total_vibes - prev_vibes) / prev_vibes) * 100
    else:
        increase = 0
    print(f"{points:<20} {total_vibes:<25,} {vibes_for_next:<25,} {increase:>6.1f}%")
    prev_vibes = total_vibes

# Analysis 4: Upgrade Tier Progression
print("\n[4] UPGRADE TIER REQUIREMENTS")
print("-" * 80)
tier_requirements = [
    (1, 100, "Early game"),
    (2, 1000, "Basic mechanics"),
    (3, 10000, "Mid-game opens"),
    (4, 100000, "Advanced strategies"),
    (5, 10000000, "Late game power"),
    (6, 5000000000, "Cookie Clicker scaling"),
    (7, 1000000000000, "Absurd scaling"),
    (8, 1000000000000000, "Transcendent"),
    (9, 1000000000000000000, "Infinity"),
]
print(f"{'Tier':<10} {'Min Cost':<25} {'Description'}")
print("-" * 80)
for tier, cost, desc in tier_requirements:
    print(f"{tier:<10} {cost:<25,} {desc}")

# Analysis 5: Milestone Gap Analysis
print("\n[5] MILESTONE PROGRESSION GAPS")
print("-" * 80)
milestones = [10000, 100000, 500000, 1000000, 10000000, 100000000, 1000000000]
print(f"{'Milestone':<20} {'Multiplier from Previous':<30} {'Status'}")
print("-" * 80)
prev_milestone = 0
for milestone in milestones:
    if prev_milestone > 0:
        multiplier = milestone / prev_milestone
        status = "OK" if multiplier <= 10 else "⚠ LARGE GAP"
    else:
        multiplier = 0
        status = "First"
    print(f"{milestone:<20,} {f'{multiplier:.1f}x' if multiplier > 0 else 'N/A':<30} {status}")
    prev_milestone = milestone

# Analysis 6: Late Game Vibes/Sec Projection
print("\n[6] LATE-GAME PRODUCTION PROJECTION (with 2x multipliers)")
print("-" * 80)
print("Assuming you buy 50 units of each substance and have 2x global multiplier:")
print("-" * 80)
total_vibes_per_sec = 0
for sub in SUBSTANCES:
    count = 50
    vibes_per_sec = calculate_vibes_per_second(sub, count) * 2  # Assuming 2x multiplier
    total_vibes_per_sec += vibes_per_sec
    print(f"{sub['id']:<15} x{count:<5} = {vibes_per_sec:>15,.1f} vibes/sec")
print("-" * 80)
print(f"{'TOTAL':<21} = {total_vibes_per_sec:>15,.1f} vibes/sec")
print(f"\nTime to earn 1 billion vibes: {(1000000000 / total_vibes_per_sec / 3600):.2f} hours")

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
