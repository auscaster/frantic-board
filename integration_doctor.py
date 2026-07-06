#!/usr/bin/env python3
"""
Integration Doctor - runx skill for checking integration health.

Tests connectivity to configured endpoints and services.
Usage: python integration_doctor.py [--config config.yaml]
"""

import argparse
import yaml
import sys
import requests
import time
import logging
from typing import Dict, List, Any

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

DEFAULT_CONFIG = {
    "checks": [
        {"type": "http", "url": "https://api.example.com/health", "expected_status": 200, "timeout": 5},
        {"type": "dns", "host": "example.com", "expected_ip": None},
        {"type": "tcp", "host": "example.com", "port": 443, "timeout": 5}
    ]
}

def load_config(config_path: str) -> Dict[str, Any]:
    try:
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        log.warning(f"Config file {config_path} not found, using defaults.")
        return DEFAULT_CONFIG
    except yaml.YAMLError as e:
        log.error(f"Error parsing config: {e}")
        sys.exit(1)

def check_http(url: str, expected_status: int, timeout: int) -> Dict[str, Any]:
    result = {"check": f"HTTP GET {url}", "status": "unknown", "details": {}}
    try:
        start = time.time()
        resp = requests.get(url, timeout=timeout)
        latency = time.time() - start
        result["details"]["status_code"] = resp.status_code
        result["details"]["latency"] = round(latency, 3)
        if resp.status_code == expected_status:
            result["status"] = "pass"
        else:
            result["status"] = "fail"
            result["details"]["error"] = f"Expected {expected_status}, got {resp.status_code}"
    except requests.exceptions.Timeout:
        result["status"] = "fail"
        result["details"]["error"] = "Timeout"
    except requests.exceptions.ConnectionError:
        result["status"] = "fail"
        result["details"]["error"] = "Connection error"
    except Exception as e:
        result["status"] = "fail"
        result["details"]["error"] = str(e)
    return result

def check_dns(host: str, expected_ip: str = None) -> Dict[str, Any]:
    import socket
    result = {"check": f"DNS lookup {host}", "status": "unknown", "details": {}}
    try:
        ip = socket.gethostbyname(host)
        result["details"]["resolved_ip"] = ip
        if expected_ip and ip != expected_ip:
            result["status"] = "fail"
            result["details"]["error"] = f"Expected IP {expected_ip}, got {ip}"
        else:
            result["status"] = "pass"
    except socket.gaierror:
        result["status"] = "fail"
        result["details"]["error"] = "DNS resolution failed"
    except Exception as e:
        result["status"] = "fail"
        result["details"]["error"] = str(e)
    return result

def check_tcp(host: str, port: int, timeout: int) -> Dict[str, Any]:
    import socket
    result = {"check": f"TCP connect {host}:{port}", "status": "unknown", "details": {}}
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    try:
        start = time.time()
        sock.connect((host, port))
        latency = time.time() - start
        result["details"]["latency"] = round(latency, 3)
        result["status"] = "pass"
    except socket.timeout:
        result["status"] = "fail"
        result["details"]["error"] = "Connection timeout"
    except ConnectionRefusedError:
        result["status"] = "fail"
        result["details"]["error"] = "Connection refused"
    except Exception as e:
        result["status"] = "fail"
        result["details"]["error"] = str(e)
    finally:
        sock.close()
    return result

def run_checks(config: Dict[str, Any]) -> List[Dict[str, Any]]:
    results = []
    for check in config.get("checks", []):
        ctype = check.get("type", "http")
        if ctype == "http":
            result = check_http(check["url"], check.get("expected_status", 200), check.get("timeout", 5))
        elif ctype == "dns":
            result = check_dns(check["host"], check.get("expected_ip"))
        elif ctype == "tcp":
            result = check_tcp(check["host"], check["port"], check.get("timeout", 5))
        else:
            result = {"check": f"Unknown type {ctype}", "status": "skip", "details": {}}
        results.append(result)
    return results

def main():
    parser = argparse.ArgumentParser(description="Integration Doctor - run integration health checks.")
    parser.add_argument("--config", default="config.yaml", help="Path to YAML config file")
    args = parser.parse_args()
    
    config = load_config(args.config)
    log.info("Starting integration checks...")
    results = run_checks(config)
    
    all_pass = True
    for r in results:
        status = r["status"]
        if status == "fail":
            all_pass = False
            log.error(f"FAIL: {r['check']} - {r['details'].get('error','')}")
        elif status == "pass":
            log.info(f"PASS: {r['check']}")
        else:
            log.warning(f"SKIP: {r['check']}")
    
    print(f"\nOverall: {'PASS' if all_pass else 'FAIL'}")
    sys.exit(0 if all_pass else 1)

if __name__ == "__main__":
    main()
