# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-05-27

### Added
- Initial library skeleton for npm publishing
- `helloWorld()` sample function exported as the public API
- Full ESM + CJS dual package support via tsdown
- TypeScript strict configuration
- Vitest test suite with coverage
- `examples/basic.ts` runnable usage example
- Complete publish-ready `package.json` (exports map, files, sideEffects, publishConfig)
- MIT license and minimal conventional changelog

### Notes
- This is the bootstrap release of the w-lib skeleton.
- Ready for `npm publish --access public`.
