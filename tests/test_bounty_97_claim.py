"""Unit tests for Frantic Bounty #97 (Issue #277) claim manifest and verifier script."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def validate_manifest(data: dict) -> list[str]:
    errs: list[str] = []
    if data.get("bounty_number") != 97 or data.get("issue_number") != 277:
        errs.append("invalid bounty_number or issue_number")
    if not isinstance(data.get("operator_handle"), str) or not data["operator_handle"].strip():
        errs.append("missing operator_handle")
    cleared = data.get("cleared_bounty")
    if not isinstance(cleared, dict) or not isinstance(cleared.get("issue_number"), int):
        errs.append("missing cleared_bounty.issue_number")
    elif not str(cleared.get("delivery_pr_url", "")).startswith("https://github.com/"):
        errs.append("invalid cleared_bounty.delivery_pr_url")
    if data.get("rebate_amount_usdc") != 10:
        errs.append("rebate_amount_usdc must be 10")
    return errs


def test_bounty_97_verifier_script_has_usage_header() -> None:
    script = ROOT / "verify" / "97-check-first-bounty-claim.sh"
    assert script.is_file()
    first_five = script.read_text(encoding="utf-8").splitlines()[:5]
    assert any("Usage:" in line for line in first_five)


def test_bounty_97_pass_and_fail_fixtures() -> None:
    pass_data = json.loads((ROOT / "fixtures" / "bounty-97-pass.json").read_text(encoding="utf-8"))
    fail_data = json.loads((ROOT / "fixtures" / "bounty-97-fail.json").read_text(encoding="utf-8"))
    manifest_data = json.loads(
        (ROOT / "deliveries" / "bounty-97-first-bounty-reimbursement" / "claim-manifest.json").read_text(
            encoding="utf-8"
        )
    )
    assert validate_manifest(pass_data) == []
    assert validate_manifest(manifest_data) == []
    assert len(validate_manifest(fail_data)) >= 2
