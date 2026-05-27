
export interface EventEmitterHandler<T> {
  (change:T):void;
}

export interface EventEmitterSubscription {
  unsubscribe:()=>void;
}


export interface EventEmitter<T> {
  emit(event: string,  payload: T): void;
  on(event: string, handler: EventEmitterHandler<T>): void;
  off(event: string, handler?: EventEmitterHandler<T>): void;
  once(event: string, handler: EventEmitterHandler<T>): void;
}

// =============================================================
// ============== RxJs =========================================
// =============================================================

import {Subject} from 'rxjs';
import {take} from 'rxjs/operators';

export class RxEventEmitter<T> implements EventEmitter<T> {

  _listeners: Record<string, Subject<T>> = {};

  emit(event: string, payload: T): void {
    const handlers = this._listeners[event];
    if (handlers) {
      handlers.next(payload);
    }
  }
  on(event: string, handler: EventEmitterHandler<T>): void {
    if (!this._listeners[event]) {
      this._listeners[event] = new Subject();
    }
    this._listeners[event].subscribe(handler)
  }
  off(event: string, handler?: EventEmitterHandler<T>): void {
    const s = this._listeners[event];
    if (s) {
      this._listeners[event].complete();
      delete this._listeners[event];
    }
  }
  once(event: string, handler: EventEmitterHandler<T>): void {
    this._listeners[event].pipe(
      take(1)
    ).subscribe(handler);
  }
}


// =============================================================
// ============== Js ===========================================
// =============================================================

export class JsEventEmitter<T> implements EventEmitter<T> {

  _listeners: Record<string, EventEmitterHandler<T>[]> = {};

  emit(event: string, payload: T): void {
    const handlers = this._listeners[event];
    if (handlers && handlers.length) {
      handlers.forEach(h => {
        h(payload);
      })
    }
  }
  on(event: string, handler: EventEmitterHandler<T>): void {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    const exists = this._listeners[event].find(h => h == handler);
    if (!exists) {
      this._listeners[event].push(handler);
    }
  }
  off(event: string, handler?: EventEmitterHandler<T>): void {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    if (handler) {
      const idx = this._listeners[event].indexOf(h => h == handler);
      if (idx > 0) {
        this._listeners[event].splice(idx, 1);
      }
    } else {
      delete this._listeners[event];
    }
  }
  once(event: string, handler:EventEmitterHandler<T>): void {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    const onceOnlyHandler = (evt: T) => {
      try {
        handler(evt);
      } finally {
        this.off(event, onceOnlyHandler);
      }
    }
  }
}