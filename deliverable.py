"""
frantic_board/nano_402_finder.py

Module to find a live HTTP 402 endpoint that prices in Nano (XNO).
This is for Frantic Board bounty #138.

Constraints:
- Pure Python, no external dependencies.
- No use of subprocess, ctypes, socket, sys.exit, os.system, or eval.

Author: Frantic Board contributors
"""

import http.client
import ssl
from typing import Optional, Tuple, Dict


def find_nano_402_endpoint(
    endpoints: list[str],
    timeout: float = 5.0
) -> Optional[Tuple[str, Dict[str, str]]]:
    """
    Attempts to find a live HTTP 402 endpoint that prices in Nano (XNO).

    Args:
        endpoints: List of endpoint URLs (must be full URLs, e.g., 'https://example.com/pay').
        timeout: Timeout for each HTTP request in seconds.

    Returns:
        Tuple of (endpoint_url, headers) if found, else None.
    """
    for url in endpoints:
        scheme, host, path = _parse_url(url)
        if not scheme or not host:
            continue
        try:
            if scheme == "https":
                context = ssl.create_default_context()
                conn = http.client.HTTPSConnection(host, timeout=timeout, context=context)
            else:
                conn = http.client.HTTPConnection(host, timeout=timeout)
            conn.request("GET", path)
            resp = conn.getresponse()
            status = resp.status
            headers = {k.lower(): v for k, v in resp.getheaders()}
            # Check for HTTP 402 and Nano/XNO mention in headers
            if status == 402:
                # Look for Nano/XNO in headers or body
                nano_found = False
                for k, v in headers.items():
                    if "nano" in v.lower() or "xno" in v.lower():
                        nano_found = True
                        break
                if not nano_found:
                    # Try body (but don't read too much)
                    body = resp.read(2048).decode(errors='ignore')
                    if "nano" in body.lower() or "xno" in body.lower():
                        nano_found = True
                if nano_found:
                    conn.close()
                    return url, headers
            conn.close()
        except Exception:
            continue
    return None


def _parse_url(url: str) -> Tuple[Optional[str], Optional[str], str]:
    """
    Parses a URL into (scheme, host, path).

    Args:
        url: The URL string.

    Returns:
        Tuple of (scheme, host, path).
    """
    # Basic parsing without urllib
    scheme = None
    host = None
    path = "/"
    if "://" in url:
        scheme, rest = url.split("://", 1)
        if "/" in rest:
            host, path = rest.split("/", 1)
            path = "/" + path
        else:
            host = rest
    else:
        # Assume http
        scheme = "http"
        if "/" in url:
            host, path = url.split("/", 1)
            path = "/" + path
        else:
            host = url
    return scheme, host, path


def test_find_nano_402_endpoint() -> None:
    """
    Test function for find_nano_402_endpoint.
    This test uses a known public Nano 402 endpoint if available.
    """
    # Example endpoints (update as needed)
    endpoints = [
        "https://pay.nano.to/402",  # Hypothetical Nano 402 endpoint
        "https://paywall.nanswap.com/",  # Hypothetical
        "https://example.com/pay",  # Not expected to work
    ]
    result = find_nano_402_endpoint(endpoints)
    if result:
        url, headers = result
        print(f"Found Nano 402 endpoint: {url}")
        print("Headers:")
        for k, v in headers.items():
            print(f"  {k}: {v}")
    else:
        print("No live Nano 402 endpoint found.")


if __name__ == "__main__":
    test_find_nano_402_endpoint()