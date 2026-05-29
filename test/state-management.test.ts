import { describe, it, expect, vi } from 'vitest';
import { createStateStore } from '../src/state-management';
import { JsEventEmitter } from '../src/event-emitter';
import type { ChangePayload } from '../src/state-management';

interface TestState {
  count: number;
  user: {
    name: string;
    age: number;
  };
  tags: string[];
}

const initialState: TestState = {
  count: 0,
  user: { name: 'Alice', age: 30 },
  tags: ['a', 'b'],
};

describe('createStateStore', () => {
  it('should initialize with the given state', () => {
    const store = createStateStore(initialState);
    expect(store.get()).toEqual(initialState);
    expect(store.get('count')).toBe(0);
    expect(store.get('user.name')).toBe('Alice');
  });

  it('set() should update value and emit change', () => {
    const store = createStateStore(initialState);
    const handler = vi.fn();
    store.on('change', handler);

    store.set('count', 5);

    expect(store.get('count')).toBe(5);
    expect(handler).toHaveBeenCalledTimes(1);

    const payload = handler.mock.calls[0][0] as ChangePayload<TestState>;
    expect(payload.path).toBe('count');
    expect(payload.previousValue).toBe(0);
    expect(payload.value).toBe(5);
  });

  it('set() should not emit if value is shallow-equal', () => {
    const store = createStateStore(initialState);
    const handler = vi.fn();
    store.on('change', handler);

    store.set('count', 0); // same value

    expect(handler).not.toHaveBeenCalled();
  });

  it('update() should apply a function and set the result', () => {
    const store = createStateStore(initialState);
    store.update('count', (c) => c + 10);
    expect(store.get('count')).toBe(10);
  });

  it('patch() should deeply merge and emit per changed path', () => {
    const store = createStateStore(initialState);
    const handler = vi.fn();
    store.on('change', handler);

    store.patch({
      count: 99,
      user: { age: 31 },
    });

    expect(store.get('count')).toBe(99);
    expect(store.get('user.age')).toBe(31);
    expect(store.get('user.name')).toBe('Alice'); // unchanged

    // Should have emitted for the two changed paths
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('batch() should apply multiple changes and emit once per changed path', () => {
    const store = createStateStore(initialState);
    const changeSpy = vi.fn();
    store.on('change', changeSpy);

    store.batch((ctx) => {
      ctx.set('count', 100);
      ctx.update('user.name', (n) => n.toUpperCase());
      ctx.patch({ user: { age: 99 } });
    });

    expect(store.get('count')).toBe(100);
    expect(store.get('user.name')).toBe('ALICE');
    expect(store.get('user.age')).toBe(99);

    // Even though 3 operations, only unique changed paths should emit
    expect(changeSpy).toHaveBeenCalledTimes(3);
  });

  it('subscribe(path, handler) should listen to specific path changes', () => {
    const store = createStateStore(initialState);
    const userNameHandler = vi.fn();

    const unsubscribe = store.subscribe('user.name', userNameHandler);

    store.set('user.name', 'Bob');
    store.set('count', 123); // different path

    expect(userNameHandler).toHaveBeenCalledTimes(1);
    expect(userNameHandler.mock.calls[0][0].path).toBe('user.name');

    unsubscribe();
    store.set('user.name', 'Charlie');
    expect(userNameHandler).toHaveBeenCalledTimes(1); // no more calls
  });

  it('on("change:some.path") should work for specific change events', () => {
    const store = createStateStore(initialState);
    const specific = vi.fn();

    store.on('change:user.age', specific);
    store.set('user.age', 42);

    expect(specific).toHaveBeenCalledTimes(1);
  });

  it('off() should remove event listeners', () => {
    const store = createStateStore(initialState);
    const handler = vi.fn();

    store.on('change', handler);
    store.off('change', handler);
    store.set('count', 1);

    expect(handler).not.toHaveBeenCalled();
  });

  it('reset() should restore initial state and emit changes', () => {
    const store = createStateStore(initialState);
    const resetHandler = vi.fn();
    store.on('change', resetHandler);

    store.set('count', 999);
    store.reset();

    expect(store.get('count')).toBe(0);
    expect(resetHandler).toHaveBeenCalled();
  });

  it('serialize() should return JSON string of current state', () => {
    const store = createStateStore({ count: 7 });
    expect(store.serialize()).toBe('{"count":7}');
  });

  it('select() should return a frozen snapshot of derived data', () => {
    const store = createStateStore(initialState);
    const selected = store.select((s) => ({ name: s.user.name }));

    expect(selected.name).toBe('Alice');
    // Should be frozen
    expect(Object.isFrozen(selected)).toBe(true);
  });

  it('get(path) should return frozen value', () => {
    const store = createStateStore(initialState);
    const user = store.get('user');
    expect(Object.isFrozen(user)).toBe(true);
  });

  it('should work with a custom EventEmitter', () => {
    const customEmitter = new JsEventEmitter<any>();
    const emitSpy = vi.spyOn(customEmitter, 'emit');

    const store = createStateStore({ value: 1 }, customEmitter);
    store.set('value', 2);

    expect(emitSpy).toHaveBeenCalled();
  });
});
