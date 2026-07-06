#!/usr/bin/env python3
"""
Expense Copilot - A runx skill to manage personal expenses.
Usage:
  runx expense-copilot add --amount 12.50 --category Food --description "Lunch"
  runx expense-copilot list
  runx expense-copilot summary
"""
import argparse
import json
import os
from datetime import datetime, date

DB_PATH = os.path.expanduser("~/.expense_copilot_db.json")

def load_db():
    if os.path.exists(DB_PATH):
        try:
            with open(DB_PATH, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []

def save_db(expenses):
    with open(DB_PATH, "w") as f:
        json.dump(expenses, f, indent=2)

def add_expense(amount, category, description, date_str=None):
    if date_str is None:
        date_str = str(date.today())
    else:
        try:
            datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            print("Error: Date must be in YYYY-MM-DD format.")
            return
    expenses = load_db()
    expense = {
        "amount": amount,
        "category": category,
        "description": description,
        "date": date_str
    }
    expenses.append(expense)
    save_db(expenses)
    print(f"Expense added: {expense}")

def list_expenses():
    expenses = load_db()
    if not expenses:
        print("No expenses recorded.")
        return
    print(f"{'Date':<12} {'Amount':<10} {'Category':<15} {'Description'}")
    print("-" * 60)
    for e in expenses:
        print(f"{e['date']:<12} {e['amount']:<10.2f} {e['category']:<15} {e['description']}")

def summary_expenses():
    expenses = load_db()
    if not expenses:
        print("No expenses to summarize.")
        return
    total = 0.0
    category_totals = {}
    for e in expenses:
        total += e['amount']
        cat = e['category']
        category_totals[cat] = category_totals.get(cat, 0.0) + e['amount']
    print(f"Total expenses: ${total:.2f}")
    print("\nBy category:")
    for cat, amt in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
        print(f"  {cat}: ${amt:.2f}")

def main():
    parser = argparse.ArgumentParser(description="Expense Copilot - manage your expenses.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    add_parser = subparsers.add_parser("add", help="Add a new expense")
    add_parser.add_argument("--amount", type=float, required=True, help="Expense amount")
    add_parser.add_argument("--category", type=str, required=True, help="Expense category")
    add_parser.add_argument("--description", type=str, required=True, help="Expense description")
    add_parser.add_argument("--date", type=str, help="Expense date (YYYY-MM-DD), defaults to today")

    subparsers.add_parser("list", help="List all expenses")

    subparsers.add_parser("summary", help="Show expense summary")

    args = parser.parse_args()

    if args.command == "add":
        add_expense(args.amount, args.category, args.description, args.date)
    elif args.command == "list":
        list_expenses()
    elif args.command == "summary":
        summary_expenses()

if __name__ == "__main__":
    main()
