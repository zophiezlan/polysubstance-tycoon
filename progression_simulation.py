#!/usr/bin/env python3
"""
Realistic progression simulation - calculates actual time to milestones
"""

import math

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
    # NEW BALANCED COSTS
    {"id": "exotic", "baseCost": 50000, "costMult": 1.25, "baseVibes": 60},
    {"id": "experimental", "baseCost": 250000, "costMult": 1.28, "baseVibes": 125},
    {"id": "forbidden", "baseCost": 1000000, "costMult": 1.3, "baseVibes": 250},
    {"id": "eldritch", "baseCost": 10000000, "costMult": 1.32, "baseVibes": 500},
    {"id": "void", "baseCost": 100000000, "costMult": 1.35, "baseVibes": 1000},
]

def cost_of_next(sub, owned):
    return math.floor(sub["baseCost"] * (sub["costMult"] ** owned))

def production_rate(inventory, multiplier=2.0):
    """Calculate current vibes/sec with given inventory and global multiplier"""
    total = 0
    for sub in SUBSTANCES:
        count = inventory.get(sub["id"], 0)
        total += sub["baseVibes"] * count
    return total * multiplier

def simulate_optimal_progression(target_vibes, base_click_power=10, seconds_per_click=1):
    """Simulate optimal greedy purchasing strategy"""
    vibes = 0
    total_vibes_earned = 0
    inventory = {}
    time_elapsed = 0  # seconds
    multiplier = 2.0  # Assume 2x from upgrades (conservative)

    clicks_per_minute = 60 / seconds_per_click

    print(f"Starting simulation to reach {target_vibes:,} vibes")
    print(f"Assuming {base_click_power} click power, clicking every {seconds_per_click}s")
    print(f"Assuming {multiplier}x production multiplier from upgrades")
    print("=" * 80)

    last_log_minute = 0

    while total_vibes_earned < target_vibes:
        # Calculate passive income
        passive_per_sec = production_rate(inventory, multiplier)

        # Calculate active income (clicks)
        active_per_sec = (base_click_power * multiplier) / seconds_per_click

        total_per_sec = passive_per_sec + active_per_sec

        # Find best affordable purchase
        best_purchase = None
        best_roi = 0

        for sub in SUBSTANCES:
            owned = inventory.get(sub["id"], 0)
            cost = cost_of_next(sub, owned)

            if cost <= vibes:
                # Calculate ROI: additional vibes/sec per vibe spent
                additional_vibes_per_sec = sub["baseVibes"] * multiplier
                roi = additional_vibes_per_sec / cost

                if roi > best_roi:
                    best_roi = roi
                    best_purchase = (sub, cost, additional_vibes_per_sec)

        if best_purchase:
            # Make purchase
            sub, cost, gain = best_purchase
            vibes -= cost
            inventory[sub["id"]] = inventory.get(sub["id"], 0) + 1

            # Log milestone purchases
            if cost >= 1000000:
                print(f"[{time_elapsed/60:.1f}m] Bought {sub['id']} #{inventory[sub['id']]} for {cost:,} vibes")
                print(f"   Current rate: {production_rate(inventory, multiplier):.1f} vibes/sec")
        else:
            # No affordable purchases, advance time
            if total_per_sec <= 0:
                print("ERROR: Zero income, cannot progress!")
                break

            # Calculate time to next affordable purchase
            min_cost = min(cost_of_next(s, inventory.get(s["id"], 0)) for s in SUBSTANCES)
            time_needed = (min_cost - vibes) / total_per_sec
            time_needed = max(0.1, time_needed)  # At least 0.1 second

            vibes += total_per_sec * time_needed
            total_vibes_earned += total_per_sec * time_needed
            time_elapsed += time_needed

            # Log every minute
            current_minute = int(time_elapsed / 60)
            if current_minute > last_log_minute and current_minute % 10 == 0:
                print(f"[{current_minute}m] Vibes: {total_vibes_earned:,.0f} | Rate: {total_per_sec:.1f}/s")
                last_log_minute = current_minute

    hours = time_elapsed / 3600
    print("=" * 80)
    print(f"Reached {target_vibes:,} vibes in {hours:.2f} hours ({time_elapsed/60:.1f} minutes)")
    print(f"Final production rate: {production_rate(inventory, multiplier):.1f} vibes/sec")
    print(f"\nInventory summary:")
    for sub in SUBSTANCES:
        count = inventory.get(sub["id"], 0)
        if count > 0:
            print(f"  {sub['id']}: {count}")

    return hours, inventory

# Run simulations
print("\n" + "=" * 80)
print("PROGRESSION SIMULATION - NEW BALANCED COSTS")
print("=" * 80 + "\n")

milestones = [
    (1_000_000, "1 Million"),
    (10_000_000, "10 Million"),
    (100_000_000, "100 Million"),
    (1_000_000_000, "1 Billion"),
]

for target, name in milestones:
    print(f"\n### Simulating to {name} ###\n")
    hours, inv = simulate_optimal_progression(target, base_click_power=20, seconds_per_click=1)
    print(f"\n>>> {name} reached in {hours:.2f} hours <<<\n")
    print("-" * 80)
