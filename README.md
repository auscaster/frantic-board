# runx skill: answer from docs

This skill answers questions based on documentation files in the `docs/` directory.

## Usage

```bash
python runx_skill.py "your question here"
```

Place `.txt` files in `docs/` to be searched.

## Example

```bash
python runx_skill.py "what is runx"
```

## Production readiness
- Simple keyword matching (can be extended with embeddings).
- Supports recursive doc loading.
- Handles missing docs directory.
