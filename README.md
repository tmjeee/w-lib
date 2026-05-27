# w-lib

[![npm version](https://img.shields.io/npm/v/@tmjeee/w-lib.svg)](https://www.npmjs.com/package/@tmjeee/w-lib)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Disclaimer: Contains codes from [jyoung4242](https://github.com/jyoung4242/Game-Dev-Library).

## Development
See [here](./README_DEV.md) for more info.

A minimal, Angular and TypeScript library.

## Installation

```bash
npm install @tmjeee/w-lib
```

## Usage

This package is **ESM-only**.


### loading-state
```typescript
const loadingState = createLoadingState();

loadingState.withLoading('assets', async ()=>{
   // xhr calls, long running calls
   // loadingState.is('asset');  will be true while this function is running else false
});

const isLoading = loadingState.is('assets'); // signal<boolean> - true when loading else false

loadingState.set('assets', false); // explicitly mark 'asset' as false 
```







## License

MIT © 2026 tmjeee
