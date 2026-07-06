# Integration Doctor (runx skill)

Diagnoses integration health for your services.

## Usage

```bash
python runx_skill_integration_doctor.py -c config.json [-o report.json]
```

## Configuration

Create a JSON file with a list of checks:

```json
{
  "checks": [
    {
      "name": "API Gateway",
      "type": "http",
      "url": "https://api.example.com/health",
      "timeout": 10
    },
    {
      "name": "Database Admin",
      "type": "http",
      "url": "https://db-admin.example.com/ping",
      "timeout": 5
    }
  ]
}
```

## Output

Returns a JSON report with overall status and per-check details.

Exit code 0 if healthy, 1 otherwise.