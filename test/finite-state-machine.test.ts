import { describe, it, expect, vi } from 'vitest';
import { Fsm, FsmState, type FsmResult } from '../src/finite-state-machine';

describe('Fsm', () => {
  it('should register states by name', () => {
    const fsm = new Fsm();
    const result = fsm.register('idle', 'loading');

    expect(result.success).toBe(true);
    expect(fsm.has('idle')).toBe(true);
    expect(fsm.has('loading')).toBe(true);
  });

  it('should register FsmState instances', () => {
    const fsm = new Fsm();
    const idle = new FsmState('idle');
    fsm.register(idle);

    expect(fsm.has('idle')).toBe(true);
  });

  it('should return false from set() when state does not exist', async () => {
    const fsm = new Fsm();
    const result = await fsm.set('nonexistent');

    expect(result.success).toBe(false);
    expect(result.message).toContain('not found');
  });

  it('should transition between states', async () => {
    const fsm = new Fsm();
    fsm.register('idle', 'running');

    const result = await fsm.set('running');
    expect(result.success).toBe(true);
    expect(fsm.current?.name).toBe('running');
  });

  it('should call enter() on the new state', () => {
    const fsm = new Fsm();
    const enterSpy = vi.fn();

    class CustomState extends FsmState {
      enter = enterSpy;
    }

    const idle = new CustomState('idle');
    fsm.register(idle);
    fsm.set('idle');

    expect(enterSpy).toHaveBeenCalled();
  });

  it('should call exit() on the old state when transitioning', () => {
    const fsm = new Fsm();
    const exitSpy = vi.fn();

    class LeavingState extends FsmState {
      exit = exitSpy;
    }

    const leaving = new LeavingState('leaving');
    fsm.register(leaving, 'next');
    fsm.set('leaving');
    fsm.set('next');

    expect(exitSpy).toHaveBeenCalled();
  });

  it('should support async enter/exit', async () => {
    const fsm = new Fsm();
    const enterOrder: string[] = [];

    class AsyncState extends FsmState {
      async enter(_prev: any, ..._p: any[]) {
        await Promise.resolve();
        enterOrder.push(`enter-${this.name}`);
      }
    }

    const a = new AsyncState('a');
    const b = new AsyncState('b');

    fsm.register(a, b);
    await fsm.set('a');
    await fsm.set('b');

    expect(enterOrder).toEqual(['enter-a', 'enter-b']);
    expect(fsm.current?.name).toBe('b');
  });

  it('get() should return current state or failure', () => {
    const fsm = new Fsm();
    expect(fsm.get().success).toBe(false);

    fsm.register('ready');
    fsm.set('ready');

    const result = fsm.get();
    expect(result.success).toBe(true);
    expect(result.value?.name).toBe('ready');
  });

  it('reset() should clear current state', () => {
    const fsm = new Fsm();
    fsm.register('x');
    fsm.set('x');
    fsm.reset();

    expect(fsm.current).toBe(null);
    expect(fsm.get().success).toBe(false);
  });

  it('update() should call update on current state', () => {
    const fsm = new Fsm();
    const updateSpy = vi.fn();

    class Updatable extends FsmState {
      update = updateSpy;
    }

    const s = new Updatable('updatable');
    fsm.register(s);
    fsm.set('updatable', { foo: 1 });

    fsm.update();

    expect(updateSpy).toHaveBeenCalledWith({ foo: 1 });
  });

  it('should pass params through set() to enter/exit/update', () => {
    const fsm = new Fsm();
    const enterSpy = vi.fn();

    class ParamState extends FsmState {
      enter = enterSpy;
    }

    const s = new ParamState('withParams');
    fsm.register(s);
    fsm.set('withParams', 'arg1', 42, true);

    expect(enterSpy).toHaveBeenCalledWith(null, 'arg1', 42, true);
  });
});
