# Sourcey Documentation

Sourcey is a CLI tool for scaffolding and managing static sites. This document covers the basic commands and workflow.

## Installation

```bash
npm install -g sourcey
```

## Quick Start

1. Initialize a new project:

```bash
npx sourcey init my-project
cd my-project
```

2. Build the site:

```bash
sourcey build
```

3. Preview locally (optional):

```bash
sourcey serve
```

4. Deploy to your hosting provider (e.g., Netlify, Vercel, or a custom domain):

```bash
sourcey deploy
```

## Configuration

Edit `sourcey.config.js` or `sourcey.yaml` in your project root to customize site metadata, themes, and plugins.

## Documentation & Help

- Official docs: [sourcey.com/docs](https://sourcey.com/docs)
- GitHub repository: [github.com/sourcey/sourcey](https://github.com/sourcey/sourcey)
- Report issues: [github.com/sourcey/sourcey/issues](https://github.com/sourcey/sourcey/issues)

## Examples

```bash
# Create a new project with a blog template
npx sourcey init my-blog --template blog

# Build for production
sourcey build --production
```

## License

Sourcey is open source and maintained under the MIT license.
