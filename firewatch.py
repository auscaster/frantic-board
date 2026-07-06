#!/usr/bin/env python3
"""
runx skill: support firewatch

A skill that monitors firewatch events and provides support actions.
"""

import json
import sys
import time
from typing import Dict, Any

SUPPORTED_EVENTS = ['fire_alarm', 'smoke_detected', 'heat_sensor_triggered']

def handle_event(event: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main entry point for processing firewatch events.
    Expects event dict with keys:
      - type: str (one of SUPPORTED_EVENTS)
      - location: str
      - severity: str (low, medium, high)
    Returns a response dict.
    """
    event_type = event.get('type')
    if event_type not in SUPPORTED_EVENTS:
        return {'error': f'Unsupported event type: {event_type}', 'status': 'failure'}

    location = event.get('location', 'unknown')
    severity = event.get('severity', 'low')

    # Simulate handling (e.g., log, alert, trigger mitigation)
    response = {
        'status': 'processed',
        'event': event_type,
        'location': location,
        'severity': severity,
        'timestamp': time.time(),
        'action': 'notified_firewatch_team' if severity == 'high' else 'logged'
    }
    return response

def main():
    """CLI entry point for runx."""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No event provided'}), file=sys.stderr)
        sys.exit(1)

    try:
        event = json.loads(sys.argv[1])
    except json.JSONDecodeError:
        print(json.dumps({'error': 'Invalid JSON'}), file=sys.stderr)
        sys.exit(1)

    context = {}  # could be populated from environment
    result = handle_event(event, context)
    print(json.dumps(result))

if __name__ == '__main__':
    main()
