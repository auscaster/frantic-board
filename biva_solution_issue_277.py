#!/usr/bin/env python3
import sys

def bounty_total(cleared):
    """
    Calculate the reward for the first five cleared bounties.
    The first bounty is free; each cleared bounty gives $10 back.
    Only the first five cleared bounties are counted.
    """
    # Count how many bounties were cleared, limit to first five
    cnt = sum(1 for c in cleared if c)  # treat truthy as cleared
    cnt = min(cnt, 5)
    # First bounty is free, so subtract one $10 if at least one cleared
    reward = max(cnt - 1, 0) * 10
    return reward

def main():
    # Expect a space‑separated list of 0/1 values on stdin
    data = sys.stdin.read().strip().split()
    if not data:
        print(0)
        return
    cleared = [int(x) for x in data]
    print(bounty_total(cleared))

if __name__ == "__main__":
    main()