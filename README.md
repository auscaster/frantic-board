# Integration Doctor

A runx skill to diagnose integration health of services.

## Usage

```bash
python integration_doctor.py --config config.yaml
```

If no config file is provided, default checks are performed (example endpoints).

## Config Format

Create a `config.yaml` file with a `checks` list. Each check has a `type` field.

### Supported Types

- **http**: Tests HTTP GET to a URL with expected status code.
  - `url`: string
  - `expected_status`: integer (default 200)
  - `timeout`: seconds (default 5)

- **dns**: Resolves a hostname.
  - `host`: string
  - `expected_ip`: optional string to verify IP

- **tcp**: Tests TCP connectivity to host:port.
  - `host`: string
  - `port`: integer
  - `timeout`: seconds (default 5)

### Example

```yaml
checks:
  - type: http
    url: https://api.example.com/health
    expected_status: 200
  - type: dns
    host: example.com
  - type: tcp
    host: example.com
    port: 443
```

## Requirements

- Python 3.6+
- PyYAML
- requests

Install with `pip install pyyaml requests`.
