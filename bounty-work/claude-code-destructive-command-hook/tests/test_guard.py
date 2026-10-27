import json
import os
import subprocess
import sys
from pathlib import Path

HOOK = Path(__file__).parents[1] / ".claude" / "hooks" / "destructive-command-guard.py"


def run(command: str, tmp_path: Path):
    env = dict(os.environ)
    env["CLAUDE_DESTRUCTIVE_GUARD_LOG"] = str(tmp_path / "blocked.log")
    payload = {
        "hook_event_name": "PreToolUse",
        "tool_name": "Bash",
        "tool_input": {"command": command},
        "cwd": "/tmp/project",
    }
    return subprocess.run(
        [sys.executable, str(HOOK)],
        input=json.dumps(payload),
        text=True,
        capture_output=True,
        env=env,
        check=True,
    )


def decision(result):
    return json.loads(result.stdout)["hookSpecificOutput"]["permissionDecision"]


def test_all_required_destructive_patterns_are_blocked(tmp_path):
    commands = [
        "rm -rf /tmp/build",
        "DROP TABLE users",
        "git push origin main --force",
        "git push -f origin main",
        "TRUNCATE TABLE users",
        "DELETE FROM users",
    ]
    for command in commands:
        result = run(command, tmp_path)
        assert decision(result) == "deny"


def test_delete_with_where_is_allowed(tmp_path):
    result = run("DELETE FROM users WHERE id = 7", tmp_path)
    assert result.stdout == ""
    assert result.stderr == ""


def test_safe_commands_are_untouched(tmp_path):
    for command in ("npm test", "git status", "ls -la", "SELECT * FROM users"):
        result = run(command, tmp_path)
        assert result.stdout == ""
        assert result.stderr == ""


def test_non_bash_tools_are_untouched(tmp_path):
    env = dict(os.environ)
    env["CLAUDE_DESTRUCTIVE_GUARD_LOG"] = str(tmp_path / "blocked.log")
    payload = {
        "tool_name": "Read",
        "tool_input": {"file_path": "/tmp/rm -rf"},
        "cwd": "/tmp/project",
    }
    result = subprocess.run(
        [sys.executable, str(HOOK)],
        input=json.dumps(payload),
        text=True,
        capture_output=True,
        env=env,
        check=True,
    )
    assert result.stdout == ""


def test_block_is_logged(tmp_path):
    result = run("git push --force origin main", tmp_path)
    assert decision(result) == "deny"
    log = (tmp_path / "blocked.log").read_text(encoding="utf-8")
    assert "/tmp/project" in log
    assert "git push --force" in log
