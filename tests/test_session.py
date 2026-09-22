import json
import pytest

from ausca_browser import BrowserSession, InMemoryBrowser, SessionError, SessionState

URL = "https://example.test/start"


def browser():
    return InMemoryBrowser({URL: {"#status": "ready", "#secret": "token=abc123"}})


def test_end_to_end_lifecycle_and_report():
    b = browser()
    s = BrowserSession(b, session_id="demo")
    report = s.run(URL, click="#go", read="#status")
    assert report.state == "completed"
    assert report.result == {"selector": "#status", "text": "ready"}
    assert [e["name"] for e in report.events] == ["open", "click", "read", "complete"]
    closed = s.close()
    assert closed.state == "closed" and b.closed
    assert "Ausca Browser Session" in closed.to_markdown()
    assert json.loads(closed.to_json())["session_id"] == "demo"


def test_secret_is_redacted_from_result_and_events():
    s = BrowserSession(browser())
    report = s.run(URL, read="#secret")
    assert "abc123" not in report.to_json()
    assert "REDACTED" in report.to_json()


def test_missing_page_fails_and_can_still_close():
    b = InMemoryBrowser({})
    s = BrowserSession(b)
    report = s.run(URL)
    assert report.state == "failed"
    assert "page not found" in report.error
    assert s.close().state == "closed"


def test_invalid_transition_and_bad_selector():
    s = BrowserSession(browser())
    s.run(URL)
    with pytest.raises(SessionError):
        s.run(URL)
    b = browser()
    failed = BrowserSession(b).run(URL, read="#missing")
    assert failed.state == "failed"


def test_invalid_url_is_reported_without_secret_leak():
    s = BrowserSession(InMemoryBrowser({}))
    report = s.run("javascript:token=abc")
    assert report.state == "failed"
    assert "abc" not in report.to_json()


def test_nested_values_and_url_credentials_are_redacted():
    b = InMemoryBrowser({"https://example.test/?token=abc123": {"#status": "ok"}})
    s = BrowserSession(b)
    report = s.run("https://example.test/?token=abc123")
    s._event("metadata", "ok", payload={"password": "secret-value", "items": ["api_key=another-secret"]})
    rendered = s.report().to_json()
    assert "abc123" not in rendered
    assert "secret-value" not in rendered
    assert "another-secret" not in rendered
    assert report.state == "completed"


def test_url_userinfo_and_encoded_query_secrets_are_redacted():
    url = "https://alice:pw-123@example.test/start?token=abc123&view=summary"
    b = InMemoryBrowser({url: {}})
    s = BrowserSession(b)
    s.run(url)
    s._event("echo", "ok", url=url)
    rendered = s.report().to_json()
    assert "pw-123" not in rendered
    assert "abc123" not in rendered
    assert "summary" in rendered


def test_close_failure_is_reported_and_is_terminal():
    class BrokenBrowser(InMemoryBrowser):
        def close(self):
            raise OSError("password=close-secret")

    b = BrokenBrowser({URL: {}})
    s = BrowserSession(b)
    s.run(URL)
    report = s.close()
    assert report.state == "failed"
    assert report.error == "password=[REDACTED]"
    assert report.ended_at is not None
    assert s.close().state == "failed"


def test_run_and_close_is_end_to_end_and_idempotent():
    b = browser()
    s = BrowserSession(b, session_id="e2e")
    report = s.run_and_close(URL, click="#go", read="#status")
    assert report.state == "closed"
    assert b.closed is True
    assert [event["name"] for event in report.events] == ["open", "click", "read", "complete", "close"]
    assert s.close().state == "closed"


def test_run_and_close_closes_after_failed_run():
    b = InMemoryBrowser({URL: {}})
    report = BrowserSession(b).run_and_close(URL, read="#missing")
    assert report.state == "closed"
    assert b.closed is True
    assert report.error is not None


def test_cli_json_mode_reports_closed_session(monkeypatch, capsys):
    from ausca_browser import cli

    monkeypatch.setattr("sys.argv", ["ausca-browser", URL, "--read", "#status", "--json"])
    cli.main()
    output = json.loads(capsys.readouterr().out)
    assert output["state"] == "closed"
    assert output["result"] == {"selector": "#status", "text": "ready"}
