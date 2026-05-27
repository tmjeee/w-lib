

## Tooling

- **Build**: [tsdown](https://tsdown.dev/) (Rolldown + Oxc)
- **Testing**: [Vitest](https://vitest.dev/)
- **TypeScript**: Strict mode, ES2022 target, bundler resolution


## Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Run tests (once, exits after completion)
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Build (outputs to dist/)
npm run build

# Watch mode during development
npm run dev
```


### Project Structure

```
src/index.ts          # Source (helloWorld)
test/index.test.ts    # Vitest tests
examples/basic.ts     # Runnable usage demo
dist/                 # Build output (generated)
```

## Publishing

This package is configured for immediate publishing.

### Recommended: One-command publish

```bash
# Bump version first (patch / minor / major)
npm version patch

# Dry-run first (highly recommended)
npm run publish:npm:dry

# Then publish for real
npm run publish:npm
```

### Manual / step-by-step (with safety checks)

```bash
# 1. Make sure everything is clean
npm run typecheck && npm test && npm run build
# (npm test now runs once and exits automatically)

# 2. Dry-run the publish (strongly recommended)
npm publish --dry-run --access public

# 3. Bump version
npm version patch

# 4. Publish
npm publish --access public
```

The `prepublishOnly` hook (and both `publish:npm*` scripts) ensure that `build` + `test` run before anything is published.


### What gets published?

Only the contents of the `dist/` folder plus `package.json`, `README.md`, `LICENSE`, and `CHANGELOG.md` (controlled via the `"files"` field).

### Automated publishing with GitHub Actions

This repository includes two GitHub Actions workflows:

- **`.github/workflows/ci.yml`** — Runs type checking and tests on every push and pull request. Can also be triggered manually from the Actions tab.
- **`.github/workflows/publish.yml`** — Publishes to npmjs.com when you create a new GitHub Release. Can also be triggered manually from the Actions tab (use with caution).


#### How to release

```bash
# 1. Update CHANGELOG.md
# 2. Commit everything
git add .
git commit -m "chore: prepare v0.0.2"

# 3. Create a version tag + GitHub Release
npm version patch
git push && git push --tags

# 4. Go to GitHub → Releases → "Draft a new release"
#    - Choose the tag you just pushed
#    - Publish the release

# → The publish workflow will run automatically and publish to npm

**Alternative**: You can also manually trigger the publish workflow from the GitHub repo → **Actions** tab → **"Publish to npmjs"** → **"Run workflow"**.
```
