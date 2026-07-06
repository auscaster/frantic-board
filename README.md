# Postmortem Maker (runx skill)

Generates markdown postmortem documents from command-line input.

## Usage

```bash
node postmortem-maker.js --title "Database outage" --summary "Primary DB read replica lag caused 5-minute downtime." --timeline "10:00 - Alert triggered,10:05 - On-call engineer paged,10:10 - Root cause identified,10:15 - Failover executed,10:20 - Service restored" --rootCause "Misconfigured replication slot retention" --actionItems "Increase monitoring on replication lag,Review alert threshold,Document failover procedure"
```

### Options

- `-t, --title` (required): Title of the postmortem.
- `-d, --date` (optional): Date of the incident (YYYY-MM-DD). Defaults to today.
- `-s, --summary` (required): Brief summary.
- `-l, --timeline` (required): Comma-separated list of timeline events.
- `-r, --rootCause` (required): Root cause description.
- `-a, --actionItems` (required): Comma-separated list of action items.
- `-o, --output` (optional): Output file path. Default: `postmortem-<title>.md`

## Production notes

- Requires Node.js and `yargs` package (`npm install yargs`)
- Can be integrated into runx as a skill by wrapping the CLI call.
