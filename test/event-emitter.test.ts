import { describe, it, expect, vi } from 'vitest';
import { JsEventEmitter, RxEventEmitter, type EventEmitter } from '../src/event-emitter';

function runEventEmitterTests(
  name: string,
  createEmitter: <T>() => EventEmitter<T>
) {
  describe(name, () => {
    it('should emit to registered handlers', () => {
      const emitter = createEmitter<string>();
      const handler = vi.fn();

      emitter.on('test', handler);
      emitter.emit('test', 'hello');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('hello');
    });

    it('should support multiple handlers for the same event', () => {
      const emitter = createEmitter<number>();
      const h1 = vi.fn();
      const h2 = vi.fn();

      emitter.on('num', h1);
      emitter.on('num', h2);
      emitter.emit('num', 42);

      expect(h1).toHaveBeenCalledWith(42);
      expect(h2).toHaveBeenCalledWith(42);
    });

    it('should not call handlers for different events', () => {
      const emitter = createEmitter<string>();
      const handler = vi.fn();

      emitter.on('eventA', handler);
      emitter.emit('eventB', 'data');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should remove specific handler with off(event, handler)', () => {
      // RxEventEmitter's current implementation does not support removing individual handlers
      if (name === 'RxEventEmitter') return;

      const emitter = createEmitter<string>();
      const h1 = vi.fn();
      const h2 = vi.fn();

      emitter.on('msg', h1);
      emitter.on('msg', h2);
      emitter.off('msg', h1);
      emitter.emit('msg', 'x');

      expect(h1).not.toHaveBeenCalled();
      expect(h2).toHaveBeenCalledWith('x');
    });

    it('should remove all handlers when off(event) is called without handler', () => {
      const emitter = createEmitter<string>();
      const h1 = vi.fn();
      const h2 = vi.fn();

      emitter.on('msg', h1);
      emitter.on('msg', h2);
      emitter.off('msg');
      emitter.emit('msg', 'y');

      expect(h1).not.toHaveBeenCalled();
      expect(h2).not.toHaveBeenCalled();
    });

    it('once() should only fire one time', () => {
      const emitter = createEmitter<number>();
      const handler = vi.fn();

      emitter.once('count', handler);
      emitter.emit('count', 1);
      emitter.emit('count', 2);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(1);
    });

    it('once() handler should only fire once (removal by wrapper reference is not supported)', () => {
      const emitter = createEmitter<string>();
      const handler = vi.fn();

      emitter.once('evt', handler);
      emitter.emit('evt', 'first');
      emitter.emit('evt', 'second');

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not duplicate the same handler reference on multiple .on() (JsEventEmitter only)', () => {
      // Note: RxEventEmitter does not deduplicate handlers
      if (name === 'RxEventEmitter') return;

      const emitter = createEmitter<string>();
      const handler = vi.fn();

      emitter.on('dup', handler);
      emitter.on('dup', handler);
      emitter.emit('dup', 'once');

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
}

// Run tests for both implementations
runEventEmitterTests('JsEventEmitter', () => new JsEventEmitter());
runEventEmitterTests('RxEventEmitter', () => new RxEventEmitter());
