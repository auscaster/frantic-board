# Postmortem Maker

A simple CLI tool to generate structured postmortem reports from the command line.

## Usage

```bash
python postmortem_maker.py --title "Outage 2025-03-28" --author "Alice" --summary "Brief description" --impact "1M users affected for 2 hours" --root-cause "Misconfigured load balancer" --timeline "14:00 - Alert triggered; 14:10 - On-call paged; ..." --action-items "1. Add monitoring; 2. Review config" --output report.md
```

## Arguments

- `--title` (required): Incident title
- `--date` (optional, default today): Date of incident
- `--author` (required): Postmortem author
- `--summary`, `--impact`, `--root-cause`, `--timeline`, `--action-items` (all required): Sections content
- `--output` (optional, default `postmortem.md`): Output file path
- `--template` (optional, default `template.md`): Custom template path

## Custom Template

You can provide a custom markdown template with placeholders `{title}`, `{date}`, `{author}`, `{summary}`, `{impact}`, `{root_cause}`, `{timeline}`, `{action_items}`.
