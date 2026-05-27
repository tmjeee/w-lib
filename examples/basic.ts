
import {createStateStore} from '../src/state-management';

type State = {
  name: string,
  age: number,
  address: {
    address1: string,
    address2: string,
    postcode: string,
  }
}

const example = ()=> {

  const state = createStateStore<State>({
    name: 'jim',
    age: 12,
    address: {
      address1: '1 Kent Street',
      address2: 'Sydney',
      postcode: '2000',
    }
  });


  const address1 = state.get('address.address1');
  state.on('change', (change) => {
    const state = change.state;
    const previousState = change.previousState;
    const value = change.value;
    const previousValue = change.previousValue;

    console.log(`change`, state, previousState, value, previousValue);
  });
}