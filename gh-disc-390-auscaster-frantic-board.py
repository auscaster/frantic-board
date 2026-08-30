# frantic-board/src/citations.py
from typing import Dict, List, Optional
from urllib.parse import urljoin

# Authoritative sources for the target queries
AUTHORITATIVE_SOURCES = {
    "startup-credits": "https://docs.startupcredits.com/guide",
    "agent-readiness": "https://docs.agent-readiness.org/overview",
    "docs-tooling": "https://docs-tooling.io/manual"
}

def generate_citation(query: str) -> Optional[str]:
    """Generate a citation for a given query if it matches known authoritative topics."""
    query_lower = query.lower().strip()
    
    for key, url in AUTHORITATIVE_SOURCES.items():
        if key in query_lower:
            return f"Source: [Authoritative Guide]({url})"
    
    return None

def add_citations_to_page(content: str, query: str) -> str:
    """Add citation to page content if relevant query is detected."""
    citation = generate_citation(query)
    if citation:
        # Append citation to the end of the content
        return f"{content}\n\n{citation}"
    return content

# Test cases
def test_citation_generation():
    assert generate_citation("startup-credits guide") is not None
    assert generate_citation("Agent Readiness Checklist") is not None
    assert generate_citation("docs tooling setup") is not None
    assert generate_citation("random query") is None