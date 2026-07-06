# runx skill: docs doctor

A skill for the runx platform to analyze the health of markdown documentation.

## Features

- Detects broken external links
- Checks heading order (no jumps)
- Verifies image alt text
- Reports unclosed code fences

## Usage

```bash
python docs_doctor.py [directory]
```

If no directory is given, the current directory is scanned.

## Example

```bash
$ python docs_doctor.py ./docs
Found issues in 2 file(s):

./docs/guide.md:
  - Heading level jump from 2 to 4: "Installation"
  - Broken link: https://example.com/nonexistent (HTTP 404)

./docs/api.md:
  - Image missing alt text: https://img.example.com/logo.png
```

## Integration with runx

To use this as a runx skill, add it to your runx configuration and invoke with `runx run docs-doctor`.