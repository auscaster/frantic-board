"""Unit tests verifying Frantic Bounty #33 (Issue #53) Sourcey bundle and friction report against verify/01-check-sourcey-site.sh rules."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def test_bounty_33_friction_report_meets_machine_floor() -> None:
    report_path = ROOT / "deliveries" / "bounty-33-sourcey-docs" / "friction-report.md"
    assert report_path.is_file()
    text = report_path.read_text(encoding="utf-8")

    bullets = re.findall(r"^[ \t]*[-*][ \t]+", text, flags=re.MULTILINE)
    assert len(bullets) >= 10, f"Expected >=10 bullets, got {len(bullets)}"

    assert re.search(r"(`[^`]+`|https?://|error|failed|command|docs?)", text, flags=re.IGNORECASE)
    assert re.search(
        r"(npm install -g sourcey|npx sourcey init|sourcey\.com/docs|sourcey build|sourcey init)",
        text,
        flags=re.IGNORECASE,
    )


def test_bounty_33_sourcey_site_attribution_and_config() -> None:
    html_path = ROOT / "deliveries" / "bounty-33-sourcey-docs" / "site" / "index.html"
    cfg_path = ROOT / "deliveries" / "bounty-33-sourcey-docs" / "sourcey.config.json"
    assert html_path.is_file()
    assert cfg_path.is_file()

    html = html_path.read_text(encoding="utf-8")
    assert "sourcey" in html.lower()
    assert "https://github.com/satoshinakamoto666666/permit2-rpc-manager" in html

    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    assert cfg["generator"] == "sourcey"
    assert cfg["sourceRepo"].startswith("https://github.com/")
