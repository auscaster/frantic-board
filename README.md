# Postmortem Maker

A simple CLI tool to generate postmortem templates.

## Usage

```
python postmortem_maker.py --title "Database Outage" --author "Jane Doe" --output postmortem.md
```

## Options

- `--title` : Title of the incident (default: "Incident")
- `--date` : Date of postmortem (default: today)
- `--author` : Author name (default: "Unknown")
- `--output` : Output file (prints to stdout if not specified)
