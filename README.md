# runx skill: support desk

Frantic bounty #78 implementation.

## Usage

```bash
python support_desk.py create "Subject" "Description" [priority]
python support_desk.py list [status]
python support_desk.py get <ticket_id>
python support_desk.py update-status <ticket_id> <new_status>
```

## Testing

```bash
python -m unittest tests/test_support_desk.py
```

## License

This project is part of a Frantic bounty.
