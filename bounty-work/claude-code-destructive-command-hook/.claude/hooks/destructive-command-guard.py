#!/usr/bin/env python3
"""Claude Code PreToolUse guard for destructive Bash commands."""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path


RULES = (
    (re.compile(r"\brm\s+(?:-[^\s]*\s+)*-r(?:f|F)?(?:\s|$)", re.I), "rm -rf"),
    (re.compile(r"\bdrop\s+table\b", re.I), "DROP TABLE"),
    (re.compile(r"\bgit\s+push\b[^\n]*\s(?:--force|-f)(?:\s|$)", re.I), "git push --force"),
    (re.compile(r"\btruncate(?:\s+table)?\b", re.I), "TRUNCATE"),
)


def blocked_delete_without_where(command: str) -> bool:
    for match in re.finditer(r"\bdelete\s+from\b", command, re.I):
        statement = command[match.start():]
        statement = re.split(r"[;\n]", statement, maxsplit=1)[0]
        if not re.search(r"\bwhere\b", statement, re.I):
            return True
    return False


def find_reason(command: str) -> str | None:
    for pattern, label in RULES:
        if pattern.search(command):
            return f"Blocked destructive Bash command: {label}"
    if blocked_delete_without_where(command):
        return "Blocked destructive Bash command: DELETE FROM without WHERE"
    return None


def log_block(command: str, cwd: str, reason: str) -> None:
    log_path = Path(
        os.environ.get(
            "CLAUDE_DESTRUCTIVE_GUARD_LOG",
            str(Path.home() / ".claude" / "hooks" / "blocked.log"),
        )
    ).expanduser()
    log_path.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).isoformat()
    with log_path.open("a", encoding="utf-8") as handle:
        handle.write(f"{timestamp}\t{cwd}\t{reason}\t{command.replace(chr(9), ' ')}\n")


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        return 0

    if payload.get("tool_name") != "Bash":
        return 0

    tool_input = payload.get("tool_input") or {}
    command = tool_input.get("command")
    if not isinstance(command, str) or not command.strip():
        return 0

    reason = find_reason(command)
    if reason is None:
        return 0

    cwd = str(payload.get("cwd") or os.getcwd())
    try:
        log_block(command, cwd, reason)
    except OSError:
        pass

    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
