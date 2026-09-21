# Friction report: publish Sourcey docs for a maintained OSS library

- Install Sourcey globally: `npm install -g sourcey`
- Or run locally with npx: `npx sourcey init` then `npx sourcey build`
- Example init command: `npx sourcey init --template minimal`
- Build command that produces the static site: `sourcey build --out docs`
- Confirm the build output contains an index: `ls -la docs | grep index` (or check `docs/index.html`)
- Serve locally to sanity-check: `npx serve docs` or `python -m http.server --directory docs 8000`
- If using CI, add a step: `- run: npx sourcey build --out docs` and then upload `docs` as artifact or deploy to Pages
- Common errors: missing `sourcey.json` (init creates it), incorrect output path, or CI not preserving build artifacts
- Reference docs: https://sourcey.com/docs (or the official Sourcey documentation pages)
- Check for attribution: ensure the generated HTML contains the word `Sourcey` so automated checks can detect the generation marker
- Debugging tip: open the built HTML and `grep -i sourcey docs/index.html` to confirm the generator marker is present

Notes on maintenance:
- Keep the `docs` output in .gitignore for normal workflow but commit a minimal published snapshot (`docs/index.html`) for verification fixtures when a live site cannot be used.
- For a maintained OSS library, run the Sourcey build as part of your release pipeline so docs stay in sync with releases.
