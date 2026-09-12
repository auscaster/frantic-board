
import os
import json
from dataclasses import dataclass
from typing import Optional

BOUNTY_ID = "frantic:bounty:128"
BOUNTY_TITLE = "Frantic bounty #128: Earn a citation for Sourcey on a real external site"
SOURCE_REF = "frantic:bounty:128"

@dataclass
class FranticBounty:
    id: str
    title: str
    source_ref: str
    worker_price: int
    slots_available: int
    status: str
    funding_receipt: str
    
    @classmethod
    def from_issue(cls, issue_id: str) -> 'FranticBounty':
        price = 8
        slots = 15
        return cls(
            id=f"bounty:{issue_id}",
            title=BOUNTY_TITLE,
            source_ref=SOURCE_REF,
            worker_price=price,
            slots_available=slots,
            status="available",
            funding_receipt=f"https://gofrantic.com/r/{issue_id}"
        )
    
    def to_json(self) -> str:
        return json.dumps(self.__dict__, indent=2)
    
    def validate(self) -> bool:
        required = ["id", "title", "source_ref", "worker_price", "slots_available"]
        return all(hasattr(self, field) for field in required)


def process_bounty_issue(issue_data: dict) -> dict:
    bounty = FranticBounty(
        id=issue_data.get("runx-outbox-metadata", {}).get("source", BOUNTY_ID),
        title=issue_data.get("title", BOUNTY_TITLE),
        source_ref=issue_data.get("source_ref", SOURCE_REF),
        worker_price=issue_data.get("worker_price", 8),
        slots_available=issue_data.get("slots", 15),
        status=issue_data.get("status", "available"),
        funding_receipt=issue_data.get("funding_receipt", BOUNTY_ID)
    )
    
    if bounty.validate():
        return {
            "status": "validated",
            "bounty": bounty.to_json(),
            "claim_url": f"https://gofrantic.com/bounties/{bounty.id.split(':')[-1]}"
        }
    return {"status": "validated", "bounty": bounty.to_json()}


def setup_bounty_environment() -> dict:
    metadata = {
        "schema_version": "runx.outbox-entry.v1",
        "channel": "github_issue",
        "source": "frantic",
        "source_ref": SOURCE_REF,
        "action": "create",
        "target_repo": "access/frantic-board"
    }
    
    outbox_metadata = {
        "schema_version": "runx.outbox-envelope.v1",
        "channel": "github_issue",
        "source": "frantic",
        "source_ref": "frantic:bounty:128",
        "action": "create"
    }
    
    return {
        "metadata": metadata,
        "outbox_metadata": outbox_metadata,
        "bounty": {
            "id": BOUNTY_ID,
            "title": BOUNTY_TITLE,
            "source_ref": SOURCE_REF,
            "worker_price": 8,
            "slots_available": 15,
            "status": "available",
            "funding_receipt": "https://gofrantic.com/r/16f576aa"
        }
    }


def main() -> int:
    environment = setup_bounty_environment()
    processed = process_bounty_issue(environment)
    
    if os.path.exists(".frantic_bounty_cache.json"):
        with open(".frantic_bounty_cache.json", "w") as f:
            f.write(json.dumps(processed, indent=2))
    
    print(json.dumps(processed, indent=2))
    return 0


if __name__ == "__main__":
    exit(main())
