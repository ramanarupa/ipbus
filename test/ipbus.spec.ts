import {Dispatcher, IpBus} from '../src';
import { LoggerConsole, SimpleListener } from '../src';
import {LogLevel} from "../src/types/logger";

describe('IpBus', () => {

  const logger = new LoggerConsole('ipbus');

  it( 'create simple bus', () => {
    const bus = new IpBus(logger)
    expect(bus).not.toBeNull();
  })


  it( 'subscribe/unsubscribe on simple channel', () => {
    const bus = new IpBus(logger)

    const listener1 = new SimpleListener();
    const listener2 = new SimpleListener();

    bus.subscribe('/channel1', listener1 );
    bus.subscribe('/channel1', listener2 );

    expect(bus.unsubscribe('/channel1', listener1)).toBeTruthy();
    expect(bus.unsubscribe('/channel/wrong', listener2)).toBeFalsy();
    expect(bus.unsubscribe('/channel1', listener2)).toBeTruthy();
  })

  it( 'unsubscribe not existance listener', () => {
    const bus = new IpBus(logger)
    bus.subscribe('/channel1', new SimpleListener() );
    expect(bus.unsubscribe('/channel1', new SimpleListener())).toBeFalsy();
  })

  it( 'publish', () => {
    const bus = new IpBus(logger)

    let originId = '';
    const listener1 = new SimpleListener( function(event) {
      if( event.data === 'event1') {
        // @ts-ignore
        originId = this.originId;
      }
      return event.data === 'event1';
    }, 'prefix1');
    const listener2 = new SimpleListener( function(event) {
      if( event.data === 'event2') {
        // @ts-ignore
        originId = this.originId;
      }
      return event.data === 'event2';
      return false;
    }, 'prefix2');

    bus.subscribe('/channel', listener1 );
    bus.subscribe('/channel', listener2 );

    expect(bus.publish('/channel', 'event1')).toBeTruthy();
    expect(originId.startsWith('prefix1')).toBeTruthy();
    expect(bus.publish('/channel', 'event2')).toBeTruthy();
    expect(originId.startsWith('prefix1')).toBeFalsy();
    expect(originId.startsWith('prefix2')).toBeTruthy();
  })

  it( 'publish to fail listener', () => {
    const error = jest.spyOn(global.console, 'error')
    const bus = new IpBus(logger)

    const e = new Error('error in listener');
    const listener1 = new SimpleListener( function(event) {
      throw e;
    }, 'prefix1');

    bus.subscribe('/channel', listener1 );
    expect(bus.publish('/channel')).toBeFalsy();
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][2]).toEqual("Error during processing event");
    expect(error.mock.calls[0][3]).toEqual({"channel": "/channel", "data": undefined});
    expect(error.mock.calls[0][4]).toEqual(", error:");
    expect(error.mock.calls[0][5]).toEqual(e);
    error.mockClear();
  });
});

describe('IpBus with dispatchers', () => {
  const logger = new LoggerConsole('ipbus');

  const getClassDispatcher = () => {
    let countSubscribe = 0;
    class TestDispatcher implements Dispatcher {
      onSubscribe(channel: string): void {
        ++countSubscribe;
      }

      onUnsubscribe(channel: string): void {
        --countSubscribe;
      }

      static count() {
        return countSubscribe;
      }
    }
    return TestDispatcher;
  }


  it( 'add new dispathers', () => {

    const TestDispatcher = getClassDispatcher();

    const bus = new IpBus(logger);
    bus.addDispatcher( new TestDispatcher() )
    bus.addDispatcher( new TestDispatcher() )

    const listener1 = new SimpleListener();
    bus.subscribe('/channel', listener1 )
    bus.subscribe('/channel', listener1 )
    expect(TestDispatcher.count()).toEqual(2);

    bus.subscribe('/channel2', new SimpleListener() )
    expect(TestDispatcher.count()).toEqual(4);

    bus.unsubscribe('/channel' )
    expect(TestDispatcher.count()).toEqual(2);
  })

  it( 'remove dispatcher', () => {
    const TestDispatcher = getClassDispatcher();

    const bus = new IpBus(logger);
    const dispatcher = new TestDispatcher();
    bus.addDispatcher( dispatcher )
    bus.addDispatcher( new TestDispatcher() )

    bus.subscribe('/channel', new SimpleListener() )
    expect(TestDispatcher.count()).toEqual(2);

    bus.removeDispatcher( dispatcher );
    bus.subscribe('/channel1', new SimpleListener() )
    expect(TestDispatcher.count()).toEqual(3);

    bus.removeDispatcher( dispatcher );
    bus.subscribe('/channel2', new SimpleListener() )
    expect(TestDispatcher.count()).toEqual(4);

    bus.removeDispatcher( dispatcher );
    bus.unsubscribe('/channel1' )
    expect(TestDispatcher.count()).toEqual(3);
  })

  it( 'add existance dispatcher', () => {
    const warn = jest.spyOn(global.console, 'warn')
    const TestDispatcher = getClassDispatcher();

    const bus = new IpBus(logger);
    const dispatcher = new TestDispatcher();
    bus.addDispatcher( dispatcher )
    bus.addDispatcher( dispatcher )
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockClear();
  })

});