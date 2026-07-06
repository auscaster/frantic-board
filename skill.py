import sys
import re
from collections import Counter

def extract_paragraphs(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    # Split by double newline to get paragraphs
    paragraphs = re.split(r'\n\s*\n', content)
    return [p.strip() for p in paragraphs if p.strip()]

def tokenize(text):
    return re.findall(r'\w+', text.lower())

def compute_relevance(query_tokens, para_tokens):
    query_counter = Counter(query_tokens)
    para_counter = Counter(para_tokens)
    common = query_counter & para_counter
    return sum(common.values())

def answer_from_docs(query, docs_path='docs.txt'):
    paragraphs = extract_paragraphs(docs_path)
    if not paragraphs:
        return "No documentation found."
    query_tokens = tokenize(query)
    if not query_tokens:
        return "Please provide a valid query."
    best_para = max(paragraphs, key=lambda p: compute_relevance(query_tokens, tokenize(p)))
    # If no overlap, return first paragraph as fallback
    if compute_relevance(query_tokens, tokenize(best_para)) == 0:
        return "No relevant answer found."
    return best_para

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python skill.py <query>")
        sys.exit(1)
    query = ' '.join(sys.argv[1:])
    result = answer_from_docs(query)
    print(result)
