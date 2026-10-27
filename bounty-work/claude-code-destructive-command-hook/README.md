# Claude Code Destructive Command Guard

A small PreToolUse hook that blocks destructive Bash commands before Claude Code executes them.

## Blocks

- rm -rf
- DROP TABLE
- git push --force / git push -f
- TRUNCATE
- DELETE FROM without a WHERE clause

Safe commands and non-Bash tools pass through unchanged.

## Install

Copy the hook into your project:

    mkdir -p .claude/hooks
    cp destructive-command-guard.py .claude/hooks/
    chmod +x .claude/hooks/destructive-command-guard.py

Add this to .claude/settings.json:

    {
      "hooks": {
        "PreToolUse": [
          {
            "matcher": "Bash",
            "hooks": [
              {
                "type": "command",
                "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/destructive-command-guard.py"
              }
            ]
          }
        ]
      }
    }

The hook reads the standard JSON event from stdin and returns a structured PreToolUse deny decision for a blocked command.

Blocked attempts are logged to ~/.claude/hooks/blocked.log.

Set CLAUDE_DESTRUCTIVE_GUARD_LOG to override the log path.

## Test

From this directory:

    python -m pytest -q
