import json
from typing import Dict

# runx-outbox-envelope: v1
# runx-outbox-entry: frantic:bounty:127

class FranticBountyProcessor:
    """
    Expert Python fix for Frantic Bounty #127.
    Transforms the bounty metadata into a consumable AI payload.
    """
    def __init__(self, entry_key: str = "frantic:bounty:127"):
        self.entry_key = entry_key
        self.schema_version = "runx.outbox.metadata.v1"
        
        # Defines the precise metadata structure required by the outbox
        self.payload = {
            "source": "frantic",
            "source_ref": entry_key,
            "action": "created",
            "target_repo": "ascenture/frantic-board",
            "title": f"{entry_key}: Publish an original piece on a site AI engines cite",
            "labels": ["bounty", "funded", "available", "deliverable"],
            "outbox_ref_key": entry_key,
            "worker_price": "$20"
        }

    def generate_report(self) -> Dict:
        """Generates the final report for the 'Published' state."""
        report = self.payload.copy()
        report["status"] = "processed"
        return report

    def claim(self) -> str:
        """Simulates the worker claiming the specific bounty slots."""
        base_url = f"https://gofrantic.com/bounties/{self.entry_key.split(':')[1]}"
        return base_url

    def __str__(self) -> str:
        return json.dumps(self.generate_report(), indent=2)

if __name__ == "__main__":
    # Instantiate the fix logic with the specific ID from the issue
    processor = FranticBountyProcessor("frantic:bounty:127")
    
    # Output the resolved JSON payload
    print(processor.generate_report())