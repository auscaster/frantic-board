from dataclasses import asdict, dataclass
import json
from typing import Any


@dataclass(frozen=True)
class SessionReport:
    session_id: str
    state: str
    started_at: str
    ended_at: str | None
    events: list[dict[str, Any]]
    result: dict[str, Any] | None = None
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2, sort_keys=True)

    def to_markdown(self) -> str:
        lines = [f"# Ausca Browser Session `{self.session_id}`", "", f"- State: `{self.state}`", f"- Started: `{self.started_at}`", f"- Ended: `{self.ended_at or 'n/a'}`", "", "## Process"]
        for event in self.events:
            lines.append(f"1. `{event['name']}` — {event['status']}")
        if self.result:
            lines += ["", "## Result", "```json", json.dumps(self.result, indent=2, sort_keys=True), "```"]
        if self.error:
            lines += ["", f"Error: `{self.error}`"]
        return "\n".join(lines) + "\n"
