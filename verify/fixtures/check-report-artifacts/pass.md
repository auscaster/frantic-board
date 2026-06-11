# Install friction report — example pass fixture

- Ran `npm install -g sourcey` and hit `EACCES: permission denied` on the global prefix.
- Re-ran under `sudo npm install -g sourcey`; install completed in 41s.
- `npx sourcey init` prompted for a config path but the docs at `https://sourcey.com/docs` never mention the prompt.
- The generated `sourcey.config.json` defaulted `theme: "auto"`, which rendered black-on-black in dark mode.
- Build step `sourcey build` failed first run with `Error: ENOENT readme.md` — repo used `README.rst`.
- Converted with `pandoc README.rst -o README.md` and the build passed.
- Deploy docs assume Vercel; deploying to my own nginx box needed a manual `try_files $uri $uri/ /index.html;` rule.
- The sitemap generator wrote absolute `http://localhost:3000` URLs until I set `siteUrl` in the config.
- Total wall-clock from clean machine to live page: `1h 12m` measured with `time`.
- The only doc page covering custom domains 404s: `https://sourcey.com/docs/custom-domains`.
