"""Tests for the reply router skill."""

import pytest
from reply_router import ReplyRouter
from handlers import handle_greeting, handle_farewell, handle_default


@pytest.mark.asyncio
async def test_route_greeting():
    router = ReplyRouter()
    router.register("greeting", handle_greeting)
    event = {"type": "greeting", "text": "Hello"}
    result = await router.route(event)
    assert result["response"] == "Hello! How can I help you?"


@pytest.mark.asyncio
async def test_route_farewell():
    router = ReplyRouter()
    router.register("farewell", handle_farewell)
    event = {"type": "farewell", "text": "Bye"}
    result = await router.route(event)
    assert result["response"] == "Goodbye! Have a great day."


@pytest.mark.asyncio
async def test_route_default():
    router = ReplyRouter()
    router.set_default_handler(handle_default)
    event = {"type": "unknown", "text": "Something"}
    result = await router.route(event)
    assert result["response"] == "I didn't understand that."


@pytest.mark.asyncio
async def test_no_handler_error():
    router = ReplyRouter()
    event = {"type": "test"}
    with pytest.raises(RuntimeError):
        await router.route(event)


@pytest.mark.asyncio
async def test_register_non_callable():
    router = ReplyRouter()
    with pytest.raises(ValueError):
        router.register("test", "not_callable")


@pytest.mark.asyncio
async def test_set_default_non_callable():
    router = ReplyRouter()
    with pytest.raises(ValueError):
        router.set_default_handler("not_callable")


@pytest.mark.asyncio
async def test_handler_error_propagation():
    async def failing_handler(event):
        raise ValueError("something wrong")
    router = ReplyRouter()
    router.register("error", failing_handler)
    event = {"type": "error"}
    with pytest.raises(ValueError):
        await router.route(event)
