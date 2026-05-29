import { describe, it, expect, vi } from 'vitest';
import { createLoadingState } from '../src/loading-state';

describe('createLoadingState', () => {
  it('should start with all keys as false', () => {
    const loading = createLoadingState<'fetch' | 'save'>();
    expect(loading.is('fetch')()).toBe(false);
    expect(loading.is('save')()).toBe(false);
  });

  it('should allow manually setting loading state', () => {
    const loading = createLoadingState<'action'>();
    loading.set('action', true);
    expect(loading.is('action')()).toBe(true);

    loading.set('action', false);
    expect(loading.is('action')()).toBe(false);
  });

  it('withLoading should set loading true during execution and false after', async () => {
    const loading = createLoadingState<'upload'>();
    const spy = vi.fn().mockResolvedValue('result');

    const promise = loading.withLoading('upload', spy);

    // Should be loading while the promise is pending
    expect(loading.is('upload')()).toBe(true);

    const result = await promise;

    expect(result).toBe('result');
    expect(loading.is('upload')()).toBe(false);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('withLoading should set loading to false even if the function rejects', async () => {
    const loading = createLoadingState<'risky'>();
    const error = new Error('boom');

    const promise = loading.withLoading('risky', async () => {
      throw error;
    });

    expect(loading.is('risky')()).toBe(true);

    await expect(promise).rejects.toThrow('boom');
    expect(loading.is('risky')()).toBe(false);
  });

  it('should support multiple independent keys', async () => {
    const loading = createLoadingState<'a' | 'b'>();

    const p1 = loading.withLoading('a', async () => {
      await new Promise(r => setTimeout(r, 5));
      return 1;
    });

    const p2 = loading.withLoading('b', async () => {
      return 2;
    });

    expect(loading.is('a')()).toBe(true);
    expect(loading.is('b')()).toBe(true);

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toBe(1);
    expect(r2).toBe(2);
    expect(loading.is('a')()).toBe(false);
    expect(loading.is('b')()).toBe(false);
  });

  it('states should reflect current loading map', () => {
    const loading = createLoadingState<'x' | 'y'>();
    loading.set('x', true);

    const snapshot = loading.states();
    expect(snapshot.x).toBe(true);
    expect(snapshot.y).toBeUndefined();
  });

  it('is() should return a stable Signal reference for the same key', () => {
    const loading = createLoadingState<'item'>();
    const sig1 = loading.is('item');
    const sig2 = loading.is('item');
    expect(sig1).toBe(sig2);
  });
});
