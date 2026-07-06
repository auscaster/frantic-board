# Expense Copilot - runx skill

A simple CLI tool to track personal expenses. Designed to be used as a [runx](https://github.com/auscaster/runx) skill.

## Installation

1. Ensure you have Python 3 installed.
2. Make the script executable: `chmod +x expense_copilot.py`
3. Place the script in a directory included in your PATH, or configure runx to find it.
4. Optionally, create a symlink: `ln -s /path/to/expense_copilot.py ~/.local/bin/expense-copilot`

## Usage

```
# Add an expense
runx expense-copilot add --amount 15.00 --category Food --description "Lunch at Mario's"

# List all expenses
runx expense-copilot list

# Show summary with category totals
runx expense-copilot summary
```

## Data Storage

Expenses are stored in `~/.expense_copilot_db.json`. This file is human-readable.

## License

MIT
