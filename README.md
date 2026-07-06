# Secret Catcher Skill

A runx skill that catches secrets (e.g., passwords, API keys) sent in chat and stores them securely per user.

## Usage

- Automatically detects messages containing patterns like `secret: myvalue`, `password=abc123`, `api_key=xyz`.
- Use `/listsecrets` command to see stored secrets (values are truncated for display).

## Installation

1. Add this skill to your runx bot.
2. Ensure `runx-sdk` is installed.

## Note

This is a simulated implementation for demo purposes. In production, secrets should be encrypted at rest and never exposed.
