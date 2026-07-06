#!/usr/bin/env python3
"""
runx skill: support desk

A simple support desk CLI tool.
"""

import json
import sys
from datetime import datetime

# In-memory storage (replace with proper database in production)
tickets = []


def create_ticket(subject: str, description: str, priority: str = "normal") -> dict:
    """Create a new support ticket."""
    ticket = {
        "id": len(tickets) + 1,
        "subject": subject,
        "description": description,
        "priority": priority,
        "status": "open",
        "created_at": datetime.now().isoformat()
    }
    tickets.append(ticket)
    return ticket


def list_tickets(status: str = None) -> list:
    """List all tickets, optionally filtered by status."""
    if status:
        return [t for t in tickets if t["status"] == status]
    return tickets


def get_ticket(ticket_id: int) -> dict:
    """Get a single ticket by ID."""
    for t in tickets:
        if t["id"] == ticket_id:
            return t
    return None


def update_ticket_status(ticket_id: int, new_status: str) -> bool:
    """Update the status of a ticket."""
    ticket = get_ticket(ticket_id)
    if ticket:
        ticket["status"] = new_status
        return True
    return False


def handle_command(args: list):
    """Process CLI arguments."""
    if not args:
        print("Usage: support_desk.py <command> [options]")
        return

    command = args[0]
    try:
        if command == "create":
            subject = args[1] if len(args) > 1 else "No subject"
            description = args[2] if len(args) > 2 else ""
            priority = args[3] if len(args) > 3 else "normal"
            ticket = create_ticket(subject, description, priority)
            print(json.dumps(ticket, indent=2))
        elif command == "list":
            status = args[1] if len(args) > 1 else None
            result = list_tickets(status)
            print(json.dumps(result, indent=2))
        elif command == "get":
            if len(args) < 2:
                print("Missing ticket ID")
                return
            ticket_id = int(args[1])
            ticket = get_ticket(ticket_id)
            if ticket:
                print(json.dumps(ticket, indent=2))
            else:
                print("Ticket not found")
        elif command == "update-status":
            if len(args) < 3:
                print("Missing ticket ID or status")
                return
            ticket_id = int(args[1])
            new_status = args[2]
            if update_ticket_status(ticket_id, new_status):
                print(f"Ticket {ticket_id} status updated to {new_status}")
            else:
                print("Ticket not found")
        else:
            print(f"Unknown command: {command}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    handle_command(sys.argv[1:])
