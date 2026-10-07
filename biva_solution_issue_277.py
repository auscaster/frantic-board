#!/usr/bin/env python3
"""
Frantic bounty #97 solution.
Returns $10 when the first five inputs clear (non‑zero sum).
"""

import sys

def read_numbers() -> list[int]:
    """Read space‑separated integers from stdin."""
    data = sys.stdin.read().strip()
    return [int(x) for x in data.split()] if data else []

def compute_reward(nums: list[int]) -> int:
    """Return 10 if the sum of the first five numbers is non‑zero, else 0."""
    first_five = nums[:5]
    return 10 if sum(first_five) != 0 else 0

def main() -> None:
    nums = read_numbers()
    reward = compute_reward(nums)
    print(reward)

if __name__ == "__main__":
    main()