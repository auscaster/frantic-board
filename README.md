# Reply Router Skill

A runx skill for routing replies to appropriate handlers based on event type.

## Usage

```python
from reply_router import ReplyRouter
from handlers import handle_greeting, handle_default

router = ReplyRouter()
router.register("greeting", handle_greeting)
router.set_default_handler(handle_default)

# Route an incoming event
result = await router.route({"type": "greeting", "text": "Hello"})
print(result)  # {'response': 'Hello! How can I help you?'}
```

## Customizing Route Key Extraction

Override `_extract_route_key` in a subclass to change how the route key is determined.

## Running Tests

```bash
pytest test_reply_router.py -v
```
