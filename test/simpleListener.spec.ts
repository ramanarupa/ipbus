import { SimpleListener } from '../src/simpleListener';
import { BusEvent } from '../src/types';
import { mockDate } from './utils';

describe('SimpleListener', () => {

  it('create new SimpleListener', () => {
    const spy = mockDate('2010-01-01T01:00:00.001Z');

    const listener = new SimpleListener( (event: BusEvent): boolean => {
      return false;
    });

    expect(listener).not.toBeNull();
    expect(listener.originId).toEqual('simple-1262307600001');

    spy.mockReset();
    spy.mockRestore();
  })

  it('create new SimpleListener with prefix', () => {
    const spy = mockDate('2010-01-01T01:00:00.001Z');

    const listener = new SimpleListener( (event: BusEvent): boolean => {
      return false;
    }, 'new-listener');

    expect(listener).not.toBeNull();
    expect(listener.originId).toEqual('new-listener-1262307600001');
    spy.mockReset();
    spy.mockRestore();
  })

  it('process event', () => {
    let processed = '';
    const listener = new SimpleListener( (event: BusEvent): boolean => {
      processed = event.channel;
      return true;
    }, 'new-listener');

    expect(listener).not.toBeNull();
    expect(listener.process({channel: '/channel'})).toBeTruthy();
    expect(processed).toEqual('/channel');
  })

  it('event is not processed', () => {
    const listener = new SimpleListener( );
    expect(listener).not.toBeNull();
    expect(listener.process({channel: '/channel'})).toBeFalsy();
  })

});
