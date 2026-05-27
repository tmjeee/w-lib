import { describe, it, expect } from 'vitest';
import { helloWorld } from '../src/index.js';

describe('w-lib', () => {
  it('helloWorld returns the canonical greeting', () => {
    expect(helloWorld()).toBe('Hello, world!');
  });

  it('helloWorld is stable across multiple calls', () => {
    expect(helloWorld()).toBe(helloWorld());
  });
});
