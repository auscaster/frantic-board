"""Example handlers for the reply router."""

import logging

logger = logging.getLogger(__name__)


async def handle_greeting(event, context=None):
    """Handle a greeting message."""
    logger.info("Handling greeting: %s", event)
    return {"response": "Hello! How can I help you?"}


async def handle_farewell(event, context=None):
    """Handle a farewell message."""
    logger.info("Handling farewell: %s", event)
    return {"response": "Goodbye! Have a great day."}


async def handle_default(event, context=None):
    """Default handler for unknown message types."""
    logger.info("Handling default: %s", event)
    return {"response": "I didn't understand that."}
