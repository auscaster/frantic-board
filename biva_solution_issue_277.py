#!/usr/bin/env python3
import sys

def main():
    data = sys.stdin.read().strip().split()
    if not data:
        return
    n = int(data[0])
    # First five bounties return $10, others return $0
    print(10 if 1 <= n <= 5 else 0)

if __name__ == "__main__":
    main()