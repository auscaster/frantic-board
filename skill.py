import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def handle_event(event, context):
    """
    Runx skill handler for support desk.
    Expects event with:
        - 'action': 'create_ticket' or 'get_help'
        - 'user': user id
        - 'message': user's message
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    action = event.get('action', '')
    user = event.get('user', 'anonymous')
    message = event.get('message', '')
    
    if action == 'create_ticket':
        # In production, this would persist to a database or ticketing system
        ticket_id = 'TKT-' + str(hash(message))[-6:]
        response = {
            'status': 'success',
            'ticket_id': ticket_id,
            'message': f'Ticket {ticket_id} created for {user}. A support agent will follow up.'
        }
    elif action == 'get_help':
        faq = {
            'billing': 'For billing inquiries, please visit your dashboard or contact billing@example.com.',
            'technical': 'Technical issues? Check our documentation or open a ticket with "create_ticket".',
            'general': 'What would you like help with? Use "create_ticket" to open a ticket or ask a specific question.'
        }
        response = {
            'status': 'success',
            'message': faq.get(message.lower(), faq['general'])
        }
    else:
        response = {
            'status': 'error',
            'message': f'Unknown action: {action}. Supported actions: create_ticket, get_help.'
        }
    
    return {
        'statusCode': 200,
        'body': json.dumps(response)
    }

# For local testing
if __name__ == '__main__':
    test_event = {
        'action': 'create_ticket',
        'user': 'user123',
        'message': 'I cannot login'
    }
    print(handle_event(test_event, None))
