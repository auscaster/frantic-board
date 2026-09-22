# Ausca Browser Session

This package provides a small, auditable browser-session lifecycle that is independent of a particular browser vendor. `BrowserSession` accepts a browser adapter, records each step, redacts credential-like values, and emits JSON or Markdown reports. `InMemoryBrowser` makes the complete flow deterministic for local validation and tests.

Example:

```python
from ausca_browser import BrowserSession, InMemoryBrowser

url = "https://example.test/start"
browser = InMemoryBrowser({url: {"#status": "ready"}})
session = BrowserSession(browser)
session.run(url, click="#go", read="#status")
print(session.close().to_markdown())
```

The adapter boundary is intentional: a real Playwright/WebDriver adapter can implement `open`, `click`, `text`, and `close` without changing the lifecycle or reporting code.

For a complete deterministic run from the command line:

```bash
python -m ausca_browser.cli https://example.test/start --click '#go' --read '#status' --json
```

The command emits a closed-session report containing the ordered process events. Secrets in URLs, mappings, results, and errors are redacted before they enter the report.
