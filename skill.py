import runx

@runx.skill
def expense_copilot():
    """Expense Copilot: Track, categorize, and report expenses."""
    runx.display("Expense Copilot ready!")
    
    expenses = []
    
    @runx.action("Add an expense")
    def add_expense(description: str, amount: float, category: str = "General"):
        """Add a new expense entry."""
        expense = {"description": description, "amount": amount, "category": category}
        expenses.append(expense)
        runx.say(f"Added expense: {description} - ${amount:.2f} ({category})")
        return expense
    
    @runx.action("List expenses")
    def list_expenses():
        """Show all recorded expenses."""
        if not expenses:
            runx.say("No expenses recorded yet.")
            return []
        runx.say("Your expenses:")
        for i, exp in enumerate(expenses, 1):
            runx.say(f"{i}. {exp['description']}: ${exp['amount']:.2f} [{exp['category']}]")
        return expenses
    
    @runx.action("Get total by category")
    def total_by_category():
        """Compute total spending per category."""
        totals = {}
        for exp in expenses:
            cat = exp["category"]
            totals[cat] = totals.get(cat, 0) + exp["amount"]
        if not totals:
            runx.say("No expenses to summarize.")
            return {}
        runx.say("Total spending by category:")
        for cat, total in totals.items():
            runx.say(f"{cat}: ${total:.2f}")
        return totals
    
    @runx.action("Clear all expenses")
    def clear_expenses():
        """Remove all expense records."""
        expenses.clear()
        runx.say("All expenses cleared.")
        return None

if __name__ == "__main__":
    expense_copilot()