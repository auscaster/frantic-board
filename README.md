# runx skill: integration doctor

Diagnostic tool for validating integration configurations.

## Usage

```bash
python integration_doctor.py --config path/to/integrations.json
```

If no config is specified, it defaults to `integrations.json` in the current directory.

## Configuration

The config file should be a JSON object with an `integrations` array. Each integration object must have:
- `name`: (string) identifier
- `endpoint`: (string) URL to check (must start with http:// or https://)
- `auth_type`: (string) authentication type
- `api_key`: (string) API key

Optional fields are ignored.

## Example

```json
{
  "integrations": [
    {
      "name": "my-service",
      "endpoint": "https://api.example.com/health",
      "auth_type": "bearer",
      "api_key": "sk-12345"
    }
  ]
}
```

## Bounty

Part of Frantic bounty #88.
