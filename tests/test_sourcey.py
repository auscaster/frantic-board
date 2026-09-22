from decimal import Decimal

import pytest

from sourcey import OfferStatus, StartupOffer, create_offer, solve_task


def test_create_and_serialize_valuable_offer():
    offer = create_offer({"title": "Launch-ready onboarding audit", "description": "A practical audit with prioritized fixes.",
                          "price": "1.00", "slots": 150, "status": "funded", "tags": ["startup", "growth"]})
    assert offer.price == Decimal("1.00")
    assert offer.remaining_slots == 150
    assert solve_task(offer.to_dict())["status"] == "funded"


def test_claims_are_immutable_and_cannot_exceed_capacity():
    offer = StartupOffer("Offer", "Useful work", Decimal("1"), 2)
    claimed = offer.claim()
    assert offer.claimed_slots == 0 and claimed.remaining_slots == 1
    with pytest.raises(ValueError, match="not enough"):
        claimed.claim(2)
    with pytest.raises(ValueError, match="positive"):
        offer.claim(0)


def test_status_lifecycle_and_paid_requires_full_capacity():
    offer = StartupOffer("Offer", "Useful work", Decimal("1"), 1).advance(OfferStatus.DELIVERED).advance("accepted")
    with pytest.raises(ValueError, match="all slots"):
        offer.advance("paid")
    assert offer.claim().advance("paid").status is OfferStatus.PAID


@pytest.mark.parametrize("payload", [
    {"title": "", "description": "x", "price": 1, "slots": 1},
    {"title": "x", "description": "", "price": 1, "slots": 1},
    {"title": "x", "description": "x", "price": 0, "slots": 1},
    {"title": "x", "description": "x", "price": 1, "slots": 0},
])
def test_invalid_offer_payloads(payload):
    with pytest.raises((ValueError, TypeError)):
        create_offer(payload)


def test_status_cannot_go_backwards_or_accept_bad_input():
    offer = StartupOffer("Offer", "Useful work", Decimal("1"), 1, status=OfferStatus.DELIVERED)
    with pytest.raises(ValueError, match="backwards"):
        offer.advance("funded")
    with pytest.raises(ValueError, match="invalid"):
        offer.advance("cancelled")
