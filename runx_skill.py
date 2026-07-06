#!/usr/bin/env python3
"""runx skill: answer from docs."""
import os
import sys
import glob

def load_docs(docs_dir: str = "docs") -> dict:
    """Load all text files from the docs directory."""
    docs = {}
    if not os.path.isdir(docs_dir):
        print(f"Docs directory '{docs_dir}' not found.", file=sys.stderr)
        return docs
    for filepath in glob.glob(os.path.join(docs_dir, "**/*.txt"), recursive=True):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        relpath = os.path.relpath(filepath, docs_dir)
        docs[relpath] = content
    return docs

def find_answer(query: str, docs: dict) -> str:
    """Simple keyword-based answer retrieval."""
    query_lower = query.lower()
    query_words = set(query_lower.split())
    best_score = 0
    best_answer = "I couldn't find an answer in the documentation."
    for doc_path, content in docs.items():
        content_lower = content.lower()
        # Count how many query words appear in the content
        score = sum(1 for word in query_words if word in content_lower)
        if score > best_score:
            best_score = score
            # Extract a snippet around the first occurrence
            for word in query_words:
                idx = content_lower.find(word)
                if idx != -1:
                    start = max(0, idx - 100)
                    end = min(len(content), idx + 100)
                    snippet = content[start:end]
                    best_answer = f"From {doc_path}: ...{snippet}..."
                    break
    return best_answer

def main():
    if len(sys.argv) < 2:
        print("Usage: runx_skill.py <query>")
        sys.exit(1)
    query = " ".join(sys.argv[1:])
    docs = load_docs()
    answer = find_answer(query, docs)
    print(answer)

if __name__ == "__main__":
    main()
