# runx skill: support desk

This skill provides a basic support desk functionality for runx.

## Actions

- `create_ticket`: Creates a new support ticket.
- `get_help`: Returns FAQ answers based on the message content.

## Deployment

Deploy as an AWS Lambda function or any serverless platform.

## Example

```json
{
  "action": "create_ticket",
  "user": "user123",
  "message": "I cannot login"
}
```

Response:
```json
{
  "status": "success",
  "ticket_id": "TKT-abc123",
  "message": "Ticket TKT-abc123 created for user123. A support agent will follow up."
}
```
