import argparse
from .browser import InMemoryBrowser
from .session import BrowserSession


def main() -> None:
    parser = argparse.ArgumentParser(description="Run a deterministic Ausca browser session")
    parser.add_argument("url")
    parser.add_argument("--read", default=None)
    parser.add_argument("--click", default=None)
    parser.add_argument("--json", action="store_true", help="emit JSON instead of Markdown")
    args = parser.parse_args()
    browser = InMemoryBrowser({args.url: {args.read: "ready"}} if args.read else {args.url: {}})
    session = BrowserSession(browser)
    report = session.run_and_close(args.url, click=args.click, read=args.read)
    print(report.to_json() if args.json else report.to_markdown(), end="")


if __name__ == "__main__":
    main()
