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
import {createLoadingState} from '@tmjeee/w-lib';

const loadingState = createLoadingState();
loadingState.withLoading('assets', async ()=>{
   // xhr calls, long running calls
   // loadingState.is('asset');  will be true while this function is running else false
});

const isLoading = loadingState.is('assets'); // signal<boolean> - true when loading else false

loadingState.set('assets', false); // explicitly mark 'asset' as false 
```

### Finite state machine 
```typescript
import {FsmState, Fsm} from '@tmjeee/w-lib';

  class State1 extends FsmState {
    enter(prevState: FsmState | null, ...params: any) {
      console.log(`[State1] enter`);
    }
    exit(nextState: FsmState | null, ...params: any) {
      console.log(`[State1] exit`);
    }
    update(...params: any) {
      console.log(`[State1] update`);
    }
  }


  class State2 extends FsmState {
    enter(prevState: FsmState | null, ...params: any) {
      console.log(`[State2] enter`);
    }
    exit(nextState: FsmState | null, ...params: any) {
      console.log(`[State2] exit`);
    }
    update(...params: any) {
      console.log(`[State2] update`);
    }
  }

  const fsm = new Fsm();
  fsm.register(
    new State1(`state1`),
    new State2(`state2`),
  );

  fsm.set('state1', {});  // state1.enter(...)
  fsm.update();           // state1.update({})
  fsm.set('state2');      // state1.exit(...) then state2.enter(...)
  fsm.update();           // state2.update({});
  fsm.get();              // return current state -> state2
```


### State Management
```typescript
  const store = createStateStore<State>({
    name: 'jim',
    age: 12,
    address: {
      address1: '1 Kent Street',
      address2: 'Sydney',
      postcode: '2000',
    }
  });


  const address1 = store.get('address.address1');
  store.on('change', (change) => {
    const state = change.state;
    const previousState = change.previousState;
    const value = change.value;
    const previousValue = change.previousValue;

    console.log(`change`, state, previousState, value, previousValue);
  });

  // all the following will trigger 'change' event
  store.update('address', (address) => ({address1: 'new address1', address2: 'new address2', postcode: 'new postcode'}));
  store.update('name', (name) => `name-${new Date()}`);
  store.set('name', 'name1');
  store.patch({age: 2, name: 'test'});
  store.batch((ctx) => {
    ctx.set('age', 1);
    ctx.update('age', (age)=>age + 1);
    ctx.patch({age: 2, name: 'test'});
  });
```


### Event Emitter
```typescript
  const emitter1 = new JsEventEmitter();
  const emitter2 = new JsEventEmitter();
  emitter1.on('test',()=>{
    console.log(`[Emitter1] Receive test event`);
  });
  emitter2.once('test', ()=>{
    console.log(`[Emitter2] Receive test event - once only`);
  });
  emitter1.emit('test', {test: 'test1'});
  emitter1.emit('test', {test: 'test2'});
  emitter2.emit('test', {test: 'test1'});
  emitter2.emit('test', {test: 'test2'});
  emitter1.off('test'); // turn off listening
  emitter1.emit('test', {test: 'test3'});
```



## License

MIT © 2026 tmjeee
