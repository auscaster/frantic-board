"""Core domain model for valuable startup offers on Sourcey.

The module is deliberately framework-free so it can be used by a CLI, API, or
job runner without coupling business rules to transport concerns.
"""

from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal, InvalidOperation
from enum import Enum
from typing import Any, Mapping


class OfferStatus(str, Enum):
    FUNDED = "funded"
    DELIVERED = "delivered"
    ACCEPTED = "accepted"
    PAID = "paid"


@dataclass(frozen=True)
class StartupOffer:
    title: str
    description: str
    price: Decimal
    slots: int
    status: OfferStatus = OfferStatus.FUNDED
    claim_url: str | None = None
    funding_receipt_url: str | None = None
    claimed_slots: int = 0
    tags: tuple[str, ...] = field(default_factory=tuple)

    def __post_init__(self) -> None:
        title = self.title.strip() if isinstance(self.title, str) else ""
        description = self.description.strip() if isinstance(self.description, str) else ""
        if not title:
            raise ValueError("title must not be empty")
        if not description:
            raise ValueError("description must not be empty")
        if self.price < Decimal("0.01"):
            raise ValueError("price must be at least 0.01")
        if self.slots < 1:
            raise ValueError("slots must be positive")
        if not 0 <= self.claimed_slots <= self.slots:
            raise ValueError("claimed_slots must be between zero and slots")
        if self.status is OfferStatus.PAID and self.claimed_slots != self.slots:
            raise ValueError("a paid offer must have all slots claimed")

    @property
    def remaining_slots(self) -> int:
        return self.slots - self.claimed_slots

    def claim(self, count: int = 1) -> "StartupOffer":
        if count < 1:
            raise ValueError("claim count must be positive")
        if count > self.remaining_slots:
            raise ValueError("not enough slots remaining")
        return self.__class__(**{**self.__dict__, "claimed_slots": self.claimed_slots + count})

    def advance(self, status: OfferStatus | str) -> "StartupOffer":
        try:
            next_status = status if isinstance(status, OfferStatus) else OfferStatus(status)
        except ValueError as exc:
            raise ValueError(f"invalid offer status: {status!r}") from exc
        order = list(OfferStatus)
        if order.index(next_status) < order.index(self.status):
            raise ValueError("offer status cannot move backwards")
        if next_status is OfferStatus.PAID and self.remaining_slots:
            raise ValueError("an offer cannot be paid before all slots are claimed")
        return self.__class__(**{**self.__dict__, "status": next_status})

    def to_dict(self) -> dict[str, Any]:
        result = {"title": self.title, "description": self.description,
                  "price": str(self.price), "slots": self.slots,
                  "claimed_slots": self.claimed_slots, "remaining_slots": self.remaining_slots,
                  "status": self.status.value, "tags": list(self.tags)}
        if self.claim_url is not None:
            result["claim_url"] = self.claim_url
        if self.funding_receipt_url is not None:
            result["funding_receipt_url"] = self.funding_receipt_url
        return result


def create_offer(payload: Mapping[str, Any]) -> StartupOffer:
    """Build an offer from JSON-like data with strict, predictable coercion."""
    if not isinstance(payload, Mapping):
        raise TypeError("offer payload must be a mapping")
    try:
        price = Decimal(str(payload["price"]))
    except (KeyError, InvalidOperation, ValueError) as exc:
        raise ValueError("price must be a valid decimal") from exc
    if not price.is_finite():
        raise ValueError("price must be finite")
    raw_status = payload.get("status", OfferStatus.FUNDED)
    try:
        status = raw_status if isinstance(raw_status, OfferStatus) else OfferStatus(raw_status)
    except ValueError as exc:
        raise ValueError("invalid offer status") from exc
    return StartupOffer(title=payload.get("title", ""), description=payload.get("description", ""),
                        price=price, slots=int(payload.get("slots", 0)), status=status,
                        claim_url=payload.get("claim_url"),
                        funding_receipt_url=payload.get("funding_receipt_url"),
                        claimed_slots=int(payload.get("claimed_slots", 0)),
                        tags=tuple(payload.get("tags", ())))


def solve_task(data: Mapping[str, Any]) -> dict[str, Any]:
    """Create and serialize a Sourcey startup offer."""
    return create_offer(data).to_dict()
