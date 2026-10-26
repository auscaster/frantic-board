"""
Sourcey Startup Offers Engine
Bounty #120: Add a valuable startup offer to Sourcey.
"""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Set


class OfferCategory(str, Enum):
    """Categories for startup offers available on Sourcey."""

    CLOUD_INFRASTRUCTURE = "Cloud & Infrastructure"
    PAYMENTS_FINANCE = "Payments & Financial Services"
    DEVELOPER_TOOLS = "Developer Tools & APIs"
    PRODUCTIVITY_COLLABORATION = "Productivity & Collaboration"
    MARKETING_ANALYTICS = "Marketing & Analytics"
    LEGAL_COMPLIANCE = "Legal & Compliance"


class OfferStatus(str, Enum):
    """Lifecycle status of a startup offer."""

    ACTIVE = "active"
    EXPIRED = "expired"
    UPCOMING = "upcoming"
    SUSPENDED = "suspended"


@dataclass
class StartupOffer:
    """Represents a curated startup perk or deal on Sourcey."""

    slug: str
    company_name: str
    title: str
    category: OfferCategory
    headline_value: str
    estimated_value_usd: float
    description: str
    perks: List[str]
    eligibility_criteria: List[str]
    redemption_url: str
    promo_code: Optional[str] = None
    tags: Set[str] = field(default_factory=set)
    status: OfferStatus = OfferStatus.ACTIVE
    featured: bool = False
    verified: bool = True
    added_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def validate(self) -> None:
        """Validate the offer fields to ensure data integrity."""
        if not self.slug or not re.match(r"^[a-z0-9\-]+$", self.slug):
            raise ValueError(
                f"Invalid slug '{self.slug}': must be non-empty and kebab-case."
            )

        if not self.company_name.strip():
            raise ValueError("Company name cannot be blank.")

        if not self.title.strip():
            raise ValueError("Offer title cannot be blank.")

        if self.estimated_value_usd < 0:
            raise ValueError("Estimated value in USD cannot be negative.")

        url_pattern = re.compile(
            r"^https?://[a-zA-Z0-9\-.]+(:\d+)?(/.*)?$", re.IGNORECASE
        )
        if not url_pattern.match(self.redemption_url):
            raise ValueError(
                f"Invalid redemption URL '{self.redemption_url}': must be valid HTTP/HTTPS URL."
            )

        if not self.perks:
            raise ValueError("Offer must specify at least one perk item.")

        if not self.eligibility_criteria:
            raise ValueError("Offer must list at least one eligibility criterion.")

    def to_dict(self) -> Dict[str, Any]:
        """Convert offer into JSON-serializable dictionary."""
        data = asdict(self)
        data["category"] = self.category.value
        data["status"] = self.status.value
        data["tags"] = sorted(list(self.tags))
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "StartupOffer":
        """Reconstruct offer from dictionary."""
        payload = data.copy()
        if isinstance(payload.get("category"), str):
            payload["category"] = OfferCategory(payload["category"])
        if isinstance(payload.get("status"), str):
            payload["status"] = OfferStatus(payload["status"])
        if isinstance(payload.get("tags"), list):
            payload["tags"] = set(payload["tags"])
        offer = cls(**payload)
        offer.validate()
        return offer


class SourceyCatalog:
    """In-memory catalog and query engine for Sourcey startup offers."""

    def __init__(self) -> None:
        self._offers: Dict[str, StartupOffer] = {}

    def register_offer(self, offer: StartupOffer) -> None:
        """Validate and add or update an offer in the catalog."""
        offer.validate()
        self._offers[offer.slug] = offer

    def remove_offer(self, slug: str) -> Optional[StartupOffer]:
        """Remove an offer by slug."""
        return self._offers.pop(slug, None)

    def get_offer(self, slug: str) -> Optional[StartupOffer]:
        """Retrieve an offer by slug."""
        return self._offers.get(slug)

    def count(self) -> int:
        """Return total registered offers."""
        return len(self._offers)

    def total_estimated_value(self) -> float:
        """Compute the sum of active offers value in USD."""
        return sum(
            offer.estimated_value_usd
            for offer in self._offers.values()
            if offer.status == OfferStatus.ACTIVE
        )

    def search(
        self,
        query: Optional[str] = None,
        category: Optional[OfferCategory] = None,
        min_value_usd: float = 0.0,
        tag: Optional[str] = None,
        only_active: bool = True,
    ) -> List[StartupOffer]:
        """Search and filter offers by criteria."""
        results: List[StartupOffer] = []
        normalized_query = query.lower().strip() if query else None

        for offer in self._offers.values():
            if only_active and offer.status != OfferStatus.ACTIVE:
                continue

            if category and offer.category != category:
                continue

            if offer.estimated_value_usd < min_value_usd:
                continue

            if tag and tag.lower() not in {t.lower() for t in offer.tags}:
                continue

            if normalized_query:
                searchable_corpus = (
                    f"{offer.company_name} {offer.title} {offer.description} "
                    f"{' '.join(offer.perks)} {' '.join(offer.tags)}"
                ).lower()
                if normalized_query not in searchable_corpus:
                    continue

            results.append(offer)

        results.sort(key=lambda o: (not o.featured, -o.estimated_value_usd))
        return results

    def to_json(self, indent: int = 2) -> str:
        """Export catalog offers to a formatted JSON string."""
        serialized = [offer.to_dict() for offer in self._offers.values()]
        return json.dumps(serialized, indent=indent)

    def load_from_json(self, json_str: str) -> None:
        """Load offers from a JSON string into the catalog."""
        data_list = json.loads(json_str)
        if not isinstance(data_list, list):
            raise ValueError("Expected JSON array of offer objects.")
        for item in data_list:
            offer = StartupOffer.from_dict(item)
            self.register_offer(offer)


def create_bounty_120_offer() -> StartupOffer:
    """Create the valuable startup offer specifically curated for Bounty #120.

    AWS Activate Founders & Portfolio Tier:
    Provides up to $100,000 USD in AWS promotional credits, business support,
    and architectural guidance for early-stage and funded startups.
    """
    return StartupOffer(
        slug="aws-activate-credits",
        company_name="Amazon Web Services",
        title="AWS Activate Startup Tier & Credits Package",
        category=OfferCategory.CLOUD_INFRASTRUCTURE,
        headline_value="Up to $100,000 in Cloud Credits + 1 Year Business Support",
        estimated_value_usd=100000.0,
        description=(
            "AWS Activate provides startups with free tools, resources, and expert support "
            "to quickly get started on AWS. Eligible startups receive cloud promotional credits, "
            "technical support, and architecture advisory to scale infrastructure cost-effectively."
        ),
        perks=[
            "Up to $100,000 in AWS promotional credits valid for up to 2 years",
            "1 year of AWS Business Support (valued up to $10,000)",
            "80 free credits for self-paced training labs on AWS Skill Builder",
            "1-on-1 virtual office hours with AWS Solutions Architects",
            "Exclusive partner offers across Brex, Stripe, Carta, and Segment",
        ],
        eligibility_criteria=[
            "Early-stage venture-backed, accelerator-associated, or bootstrapped startup",
            "Must have a valid company website and active business email domain",
            "Must have an active AWS account in good standing",
            "Has not previously received AWS Activate credits at an equal or higher tier",
        ],
        redemption_url="https://aws.amazon.com/activate/",
        promo_code=None,
        tags={"cloud", "aws", "infrastructure", "credits", "hosting", "scalability"},
        status=OfferStatus.ACTIVE,
        featured=True,
        verified=True,
    )


def initialize_default_catalog() -> SourceyCatalog:
    """Build and initialize a SourceyCatalog pre-populated with standard offers

    and the new Bounty #120 offer.
    """
    catalog = SourceyCatalog()

    # Pre-existing standard startup offers on Sourcey
    catalog.register_offer(
        StartupOffer(
            slug="stripe-atlas-incorporation",
            company_name="Stripe",
            title="Stripe Atlas & Processing Perks",
            category=OfferCategory.PAYMENTS_FINANCE,
            headline_value="$20,000 in Fee-Free Processing + 50% Off Incorporation",
            estimated_value_usd=20500.0,
            description=(
                "Stripe Atlas simplifies forming a Delaware C-Corp or LLC, setting up "
                "a US business bank account, and launching payments globally."
            ),
            perks=[
                "$20,000 in fee-free card payment processing credits",
                "50% discount on Atlas company formation fee",
                "Free registered agent service for the first year",
            ],
            eligibility_criteria=[
                "New corporate entities forming via Stripe Atlas",
                "Founders launching compliant technology startups",
            ],
            redemption_url="https://stripe.com/atlas",
            tags={"payments", "legal", "incorporation", "finance"},
            status=OfferStatus.ACTIVE,
            featured=False,
            verified=True,
        )
    )

    catalog.register_offer(
        StartupOffer(
            slug="notion-for-startups",
            company_name="Notion",
            title="Notion for Startups Program",
            category=OfferCategory.PRODUCTIVITY_COLLABORATION,
            headline_value="Up to 6 Months Free Notion Plus with Unlimited AI",
            estimated_value_usd=6000.0,
            description=(
                "All-in-one workspace for notes, project management, internal wikis, "
                "and AI-assisted knowledge management."
            ),
            perks=[
                "6 months free of Notion Plus with unlimited team members",
                "Unlimited Notion AI features for team collaboration",
            ],
            eligibility_criteria=[
                "Affiliated with an approved accelerator, VC, or incubator partner",
                "Fewer than 50 employees and new Notion Plus customer",
            ],
            redemption_url="https://www.notion.so/startups",
            tags={"productivity", "wiki", "docs", "project-management"},
            status=OfferStatus.ACTIVE,
            featured=False,
            verified=True,
        )
    )

    # Register the valuable new startup offer added for Bounty #120
    bounty_offer = create_bounty_120_offer()
    catalog.register_offer(bounty_offer)

    return catalog


# =====================================================================
# Test Suite
# =====================================================================
import unittest


class TestStartupOfferModel(unittest.TestCase):
    """Test suite for StartupOffer validation and serialization."""

    def test_valid_offer_creation(self) -> None:
        offer = create_bounty_120_offer()
        self.assertEqual(offer.slug, "aws-activate-credits")
        self.assertEqual(offer.estimated_value_usd, 100000.0)
        self.assertEqual(offer.category, OfferCategory.CLOUD_INFRASTRUCTURE)
        self.assertTrue(offer.verified)

    def test_invalid_slug_raises_error(self) -> None:
        with self.assertRaises(ValueError):
            offer = create_bounty_120_offer()
            offer.slug = "Invalid Slug with spaces!"
            offer.validate()

    def test_invalid_url_raises_error(self) -> None:
        with self.assertRaises(ValueError):
            offer = create_bounty_120_offer()
            offer.redemption_url = "not-a-valid-url"
            offer.validate()

    def test_negative_value_raises_error(self) -> None:
        with self.assertRaises(ValueError):
            offer = create_bounty_120_offer()
            offer.estimated_value_usd = -50.0
            offer.validate()

    def test_empty_perks_raises_error(self) -> None:
        with self.assertRaises(ValueError):
            offer = create_bounty_120_offer()
            offer.perks = []
            offer.validate()

    def test_to_dict_and_from_dict_roundtrip(self) -> None:
        offer = create_bounty_120_offer()
        data = offer.to_dict()
        reconstructed = StartupOffer.from_dict(data)
        self.assertEqual(offer.slug, reconstructed.slug)
        self.assertEqual(offer.company_name, reconstructed.company_name)
        self.assertEqual(offer.category, reconstructed.category)
        self.assertEqual(offer.estimated_value_usd, reconstructed.estimated_value_usd)
        self.assertEqual(offer.perks, reconstructed.perks)


class TestSourceyCatalog(unittest.TestCase):
    """Test suite for SourceyCatalog operations and querying."""

    def setUp(self) -> None:
        self.catalog = initialize_default_catalog()

    def test_catalog_contains_bounty_offer(self) -> None:
        bounty_offer = self.catalog.get_offer("aws-activate-credits")
        self.assertIsNotNone(bounty_offer)
        assert bounty_offer is not None
        self.assertEqual(bounty_offer.company_name, "Amazon Web Services")
        self.assertGreaterEqual(bounty_offer.estimated_value_usd, 100000.0)
        self.assertTrue(bounty_offer.featured)

    def test_total_estimated_value(self) -> None:
        total = self.catalog.total_estimated_value()
        # 100,000 (AWS) + 20,500 (Stripe) + 6,000 (Notion) = 126,500
        self.assertAlmostEqual(total, 126500.0)

    def test_search_by_query(self) -> None:
        results = self.catalog.search(query="promotional credits")
        slugs = [o.slug for o in results]
        self.assertIn("aws-activate-credits", slugs)

    def test_search_by_category(self) -> None:
        cloud_offers = self.catalog.search(
            category=OfferCategory.CLOUD_INFRASTRUCTURE
        )
        self.assertEqual(len(cloud_offers), 1)
        self.assertEqual(cloud_offers[0].slug, "aws-activate-credits")

    def test_search_by_min_value(self) -> None:
        high_value = self.catalog.search(min_value_usd=50000.0)
        self.assertEqual(len(high_value), 1)
        self.assertEqual(high_value[0].slug, "aws-activate-credits")

    def test_search_by_tag(self) -> None:
        aws_tagged = self.catalog.search(tag="aws")
        self.assertEqual(len(aws_tagged), 1)
        self.assertEqual(aws_tagged[0].slug, "aws-activate-credits")

    def test_remove_offer(self) -> None:
        removed = self.catalog.remove_offer("notion-for-startups")
        self.assertIsNotNone(removed)
        self.assertIsNone(self.catalog.get_offer("notion-for-startups"))
        self.assertEqual(self.catalog.count(), 2)

    def test_json_export_and_import(self) -> None:
        json_repr = self.catalog.to_json()
        new_catalog = SourceyCatalog()
        new_catalog.load_from_json(json_repr)
        self.assertEqual(new_catalog.count(), self.catalog.count())
        self.assertIsNotNone(new_catalog.get_offer("aws-activate-credits"))


def run_tests() -> bool:
    """Execute all tests programmatically and return True if successful."""
    suite = unittest.TestSuite()
    loader = unittest.TestLoader()
    suite.addTests(loader.loadTestsFromTestCase(TestStartupOfferModel))
    suite.addTests(loader.loadTestsFromTestCase(TestSourceyCatalog))
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_tests()
    if success:
        catalog = initialize_default_catalog()
        print("\nSuccessfully initialized Sourcey with Bounty #120 offer:")
        offer = catalog.get_offer("aws-activate-credits")
        if offer:
            print(f"Title: {offer.title}")
            print(f"Headline Value: {offer.headline_value}")
            print(f"Estimated USD: ${offer.estimated_value_usd:,.2f}")
            print(f"Redemption URL: {offer.redemption_url}")
            print(f"Total catalog offers: {catalog.count()}")
            print(f"Total catalog value: ${catalog.total_estimated_value():,.2f}")