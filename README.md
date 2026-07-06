# Expense Copilot

A runx skill to help you manage your expenses.

## Usage

```bash
python expense_copilot.py <csv_file>
```

## CSV Format

Expected columns: `amount`, `category`, `date`, `description` (case-insensitive).

Example:
```
amount,category,date,description
12.50,Food,2025-03-01,Lunch
75.00,Transport,2025-03-02,Gas
```

## Features

- Loads expenses from a CSV file
- Calculates total spending
- Categorizes expenses
- Lists top 5 largest expenses
