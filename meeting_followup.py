import re
from typing import List, Dict


def process_meeting_notes(notes: str) -> Dict[str, List[str]]:
    """
    Extract action items and decisions from meeting notes.
    Returns a dictionary with 'action_items' and 'decisions' lists.
    """
    action_items = []
    decisions = []
    
    # Simple heuristic: look for lines containing keywords
    lines = notes.split('\n')
    for line in lines:
        line_lower = line.lower().strip()
        # Check for action item patterns
        if re.search(r'\b(action item|to do|follow.up|next step|assignee|owner)\b', line_lower):
            action_items.append(line.strip())
        # Check for decision patterns
        if re.search(r'\b(decide|decision|agreed|conclusion|resolve)\b', line_lower):
            decisions.append(line.strip())
    
    return {
        'action_items': action_items,
        'decisions': decisions
    }


def generate_followup_email(processed: Dict[str, List[str]]) -> str:
    """
    Generate a follow-up email summary from processed meeting notes.
    """
    email_body = "Meeting Follow-up\n" + "=" * 50 + "\n\n"
    
    if processed['action_items']:
        email_body += "Action Items:\n" + "-" * 20 + "\n"
        for idx, item in enumerate(processed['action_items'], 1):
            email_body += f"{idx}. {item}\n"
        email_body += "\n"
    
    if processed['decisions']:
        email_body += "Decisions:\n" + "-" * 20 + "\n"
        for idx, decision in enumerate(processed['decisions'], 1):
            email_body += f"{idx}. {decision}\n"
        email_body += "\n"
    
    if not processed['action_items'] and not processed['decisions']:
        email_body += "No action items or decisions identified.\n"
    
    email_body += "Best,\nMeeting Followup Bot"
    return email_body


def main():
    # Example usage
    sample_notes = """Meeting: Project Review
Date: 2023-11-01
Attendees: Alice, Bob, Charlie

Agreed to move forward with the new design.
Action Item: Alice to finalize mockups by Friday.
Decision: Use React for frontend.
Next Step: Bob to set up CI pipeline.
"""
    print("Input notes:")
    print(sample_notes)
    print("\n--- Processing ---\n")
    processed = process_meeting_notes(sample_notes)
    email = generate_followup_email(processed)
    print("Generated follow-up email:")
    print(email)


if __name__ == '__main__':
    main()