import { describe, it, expect } from 'vitest';
import { createLoadingState } from '../src/index.js';

describe('w-lib public exports', () => {
  it('exports createLoadingState from index', () => {
    expect(typeof createLoadingState).toBe('function');
  });

  it('createLoadingState works for basic usage', async () => {
    const loading = createLoadingState<'save'>();
    expect(loading.is('save')()).toBe(false);

    const result = await loading.withLoading('save', async () => {
      return 'done';
    });

    expect(result).toBe('done');
    expect(loading.is('save')()).toBe(false);
  });
});
