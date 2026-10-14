from dataclasses import dataclass
from typing import Any

@dataclass(frozen=True)
class Sourcey:
    """
    Represents the 'Sourcey' entity for Frantic Bounty #113, 
    designed to align upstream docs with runx-outbox v1 entries.
    """
    id: str

    def __post_init__(self):
        object.__setattr__(self, '_entry_ref', f"frantic:bounty:{self.id}")

    @property
    def metadata(self) -> dict[str, Any]:
        return {
            "schema_version": "runx.outbox.entry.provider-thread-create.v1",
            "channel": "github_issue",
            "source": "frantic",
            "source_ref": self._entry_ref,
            "action": "created",
            "target_repo": "accessor/frantic-board"
        }

    def __str__(self):
        return self._entry_ref

    @property
    def entry(self) -> str:
        return self._entry_ref

    def __repr__(self):
        return f"Sourcey(id='{self.id}', ref='{self._entry_ref}')"