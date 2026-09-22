from dataclasses import dataclass, field
from typing import Protocol
from urllib.parse import urlparse


class Browser(Protocol):
    def open(self, url: str) -> None: ...
    def click(self, selector: str) -> None: ...
    def text(self, selector: str) -> str: ...
    def close(self) -> None: ...


@dataclass
class InMemoryBrowser:
    """A deterministic browser adapter for local runs and unit tests."""
    pages: dict[str, dict[str, str]] = field(default_factory=dict)
    current_url: str | None = None
    clicks: list[str] = field(default_factory=list)
    closed: bool = False

    def open(self, url: str) -> None:
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("url must be an absolute http(s) URL")
        if url not in self.pages:
            raise LookupError(f"page not found: {url}")
        self.current_url = url

    def click(self, selector: str) -> None:
        if self.current_url is None:
            raise RuntimeError("no page is open")
        if not selector:
            raise ValueError("selector must not be empty")
        self.clicks.append(selector)

    def text(self, selector: str) -> str:
        if self.current_url is None:
            raise RuntimeError("no page is open")
        try:
            return self.pages[self.current_url][selector]
        except KeyError as exc:
            raise LookupError(f"selector not found: {selector}") from exc

    def close(self) -> None:
        self.closed = True
        self.current_url = None
