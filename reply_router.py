"""runx skill: reply router.

Routes incoming replies to appropriate handlers based on message context.
"""

import logging
from typing import Callable, Dict, Any

logger = logging.getLogger(__name__)


class ReplyRouter:
    """Skill that routes replies to registered handlers."""

    def __init__(self):
        self._routes: Dict[str, Callable] = {}
        self._default_handler: Callable = None

    def register(self, route_key: str, handler: Callable):
        """Register a handler for a given route key."""
        if not callable(handler):
            raise ValueError("Handler must be callable")
        self._routes[route_key] = handler
        logger.info("Registered handler for route '%s'", route_key)

    def set_default_handler(self, handler: Callable):
        """Set a default handler for unmatched routes."""
        if not callable(handler):
            raise ValueError("Default handler must be callable")
        self._default_handler = handler
        logger.info("Set default handler")

    async def route(self, event: Dict[str, Any], context: Dict[str, Any] = None) -> Any:
        """Route an event to the appropriate handler."""
        route_key = self._extract_route_key(event)
        handler = self._routes.get(route_key, self._default_handler)
        if handler is None:
            raise RuntimeError(f"No handler found for route '{route_key}' and no default handler set")
        logger.debug("Routing event with key '%s' to handler %s", route_key, handler.__name__)
        try:
            if context:
                result = await handler(event, context)
            else:
                result = await handler(event)
            return result
        except Exception as e:
            logger.exception("Handler %s failed for event %s", handler.__name__, event)
            raise

    def _extract_route_key(self, event: Dict[str, Any]) -> str:
        """Extract the route key from the event. Override in subclass if needed."""
        return event.get("type", "")
