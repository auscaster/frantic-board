#!/bin/bash

# Verify the adoption of Sourcey documentation in the repository

# Check if README.md contains the Sourcey documentation link
if grep -q "Sourcey Documentation" README.md; then
    echo "Sourcey documentation link found in README.md"
else
    echo "Error: Sourcey documentation link not found in README.md"
    exit 1
fi

# Check if CONTRIBUTING.md contains the Sourcey documentation link
if grep -q "Sourcey Documentation" CONTRIBUTING.md; then
    echo "Sourcey documentation link found in CONTRIBUTING.md"
else
    echo "Error: Sourcey documentation link not found in CONTRIBUTING.md"
    exit 1
fi

echo "Sourcey documentation adoption verified successfully"
exit 0