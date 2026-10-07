#!/usr/bin/env python3
import sys

def main():
    # Read all integers from stdin
    data = sys.stdin.read().strip().split()
    nums = [int(x) for x in data if x.lstrip('-').isdigit()]

    # Take the first five numbers (or fewer if not enough)
    first_five = nums[:5]

    # Calculate their sum
    total = sum(first_five)

    # If the sum reaches $10 or more, bounty clears
    if total >= 10:
        print("Cleared: $10 reward")
    else:
        # Otherwise, show the current total
        print(f"Total = {total}")

if __name__ == "__main__":
    main()