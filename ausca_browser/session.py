from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
import re
from collections.abc import Mapping
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from uuid import uuid4

from .browser import Browser
from .report import SessionReport


class SessionState(StrEnum):
    CREATED = "created"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CLOSED = "closed"


class SessionError(RuntimeError):
    pass


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


_SECRET_PATTERN = re.compile(
    r"(?i)(token|password|secret|api[_-]?key)\s*[:=]\s*[^\s,;&]+"
)


def _safe(value: Any) -> Any:
    """Return a report-safe copy without mutating adapter-owned values."""
    if isinstance(value, str):
        # Cover both log-style key=value material and URL query parameters.
        value = _SECRET_PATTERN.sub(r"\1=[REDACTED]", value)
        try:
            parts = urlsplit(value)
            if parts.scheme and parts.netloc:
                hostname = parts.hostname or ""
                netloc = hostname + (f":{parts.port}" if parts.port else "")
                if parts.username is not None or parts.password is not None:
                    netloc = f"[REDACTED]@{netloc}"
                sensitive = re.compile(r"(?i)(token|password|secret|api[_-]?key)")
                query = urlencode(
                    [(key, "[REDACTED]" if sensitive.search(key) else item)
                     for key, item in parse_qsl(parts.query, keep_blank_values=True)]
                )
                value = urlunsplit((parts.scheme, netloc, parts.path, query, parts.fragment))
        except ValueError:
            pass
        return value
    if isinstance(value, Mapping):
        safe = {}
        for key, item in value.items():
            key_text = str(key)
            if re.search(r"(?i)(token|password|secret|api[_-]?key)", key_text):
                safe[key_text] = "[REDACTED]"
            else:
                safe[key_text] = _safe(item)
        return safe
    if isinstance(value, (list, tuple, set)):
        return [_safe(item) for item in value]
    return value


@dataclass
class BrowserSession:
    browser: Browser
    session_id: str = field(default_factory=lambda: uuid4().hex)
    state: SessionState = SessionState.CREATED
    started_at: str = field(default_factory=_now)
    ended_at: str | None = None
    events: list[dict[str, Any]] = field(default_factory=list)
    result: dict[str, Any] | None = None
    error: str | None = None

    def _event(self, name: str, status: str, **details: Any) -> None:
        self.events.append({"name": name, "status": status, "at": _now(), **{k: _safe(v) for k, v in details.items()}})

    def run(self, url: str, *, click: str | None = None, read: str | None = None) -> SessionReport:
        if self.state is not SessionState.CREATED:
            raise SessionError(f"session cannot run from state {self.state}")
        self.state = SessionState.RUNNING
        try:
            self.browser.open(url)
            self._event("open", "ok", url=url)
            if click is not None:
                self.browser.click(click)
                self._event("click", "ok", selector=click)
            if read is not None:
                value = self.browser.text(read)
                self.result = {"selector": read, "text": _safe(value)}
                self._event("read", "ok", selector=read)
            self.state = SessionState.COMPLETED
            self._event("complete", "ok")
        except Exception as exc:
            self.state = SessionState.FAILED
            self.error = _safe(str(exc))
            self._event("run", "failed", error=self.error)
        return self.report()

    def close(self) -> SessionReport:
        if self.state is SessionState.CLOSED:
            return self.report()
        try:
            self.browser.close()
        except Exception as exc:
            self.state = SessionState.FAILED
            self.error = _safe(str(exc))
            self._event("close", "failed", error=self.error)
            self.ended_at = _now()
            return self.report()
        self.state = SessionState.CLOSED
        self.ended_at = _now()
        self._event("close", "ok")
        return self.report()

    def run_and_close(self, url: str, *, click: str | None = None,
                      read: str | None = None) -> SessionReport:
        """Run the workflow and close the adapter even when the workflow fails."""
        self.run(url, click=click, read=read)
        return self.close()

    def report(self) -> SessionReport:
        return SessionReport(self.session_id, self.state.value, self.started_at, self.ended_at, list(self.events), self.result, self.error)
