import {BusEvent, Dispatcher, IpBus, LoggerConsole, SimpleListener} from "../../src";
import {LogLevel} from "../../src/types/logger";
import {MessageListener} from "../../src/dispatchers/message/message-listener";
import {generateOriginId} from "../../src/dispatchers/message/originId";

const createEvent = (originId: string, method: string | undefined, channel: string, data?: any): MessageEvent => (
  {
    source: global.window as Window,
    data: {
      originId,
      method: method,
      event: {
        channel: channel,
        data: data
      },
    },
    preventDefault: () => {},
    stopPropagation: () => {}
  } as MessageEvent
);

describe('MessageDispatcher without callback', () => {

  let initMessageDispatcher: (bus: IpBus) => Dispatcher;
  jest.isolateModules(() => {
    initMessageDispatcher = require('../../src/dispatchers/message').initMessageDispatcher;
  });

  const logger = new LoggerConsole( '', LogLevel.trace);
  let onMessageCallback: (e: MessageEvent) => boolean;
  const bus = new IpBus(logger);
  let dispatcher: Dispatcher;

  it( 'create', () => {
    const addEventListenerSpy = jest.spyOn( global.window, 'addEventListener' );
    addEventListenerSpy.mockImplementation((type: string, callback: any) => {
      if( type === 'message') {
        onMessageCallback = callback;
      }
    });
    dispatcher = initMessageDispatcher(bus);
    expect(dispatcher).not.toBeNull();
    expect(onMessageCallback).not.toBeNull();
    expect(onMessageCallback).not.toBeUndefined();
    addEventListenerSpy.mockClear();
  })

  it( 'double create', () => {
    const warnSpy = jest.spyOn(global.console, 'warn')

    const bus = new IpBus(logger);
    const dispatcher1 = initMessageDispatcher(bus);
    expect(dispatcher1).toEqual(dispatcher);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockClear();
  })

  it( 'onMessage with unknown event', () => {
    expect(onMessageCallback( {data:{}} as MessageEvent )).toBeFalsy();
  })

  const originId = generateOriginId();
  it( 'onMessage subscribe method', () => {
    expect(onMessageCallback(createEvent(originId, 'subscribe', '/channel1'))).toBeTruthy();
  })

  it( 'onMessage publish method', () => {
    const listener = dispatcher.getListener(originId) as MessageListener;
    let count = 0;
    bus.subscribe( '/channel1', new SimpleListener( (event: BusEvent) => {
      ++count;
      return true;
    }))
    expect(onMessageCallback(createEvent(originId, 'publish', '/channel1'))).toBeTruthy();
    expect(count).toEqual(1);
  })

  it( 'onMessage unsubscribe method', () => {
    expect(onMessageCallback(createEvent(originId, 'unsubscribe', '/channel1'))).toBeTruthy();
  })

  it( 'onMessage unsubscribe bus channel', () => {
    bus.subscribe('/channel2', new SimpleListener() );
    expect(onMessageCallback(createEvent(originId, 'unsubscribe', '/channel2'))).toBeTruthy();
  })

  it( 'onMessage with unknown method and without callback', () => {
    expect(onMessageCallback(createEvent(originId, 'unknownMethod', '/channel1'))).toBeTruthy();
  });

  it( 'onMessage with no method and without callback', () => {
    expect(onMessageCallback(createEvent(originId, undefined, '/channel1'))).toBeTruthy();
  });
})

describe('MessageDispatcher with callback', () => {
  let initMessageDispatcher: (bus: IpBus, dispatcherCallback: (e: MessageEvent, listener: MessageListener) => boolean) => Dispatcher;
  jest.isolateModules(() => {
    initMessageDispatcher = require('../../src/dispatchers/message').initMessageDispatcher;
  });

  const logger = new LoggerConsole( '', LogLevel.trace);
  const bus = new IpBus(logger);
  let dispatcher: Dispatcher;
  let onMessageCallback: (e: MessageEvent) => boolean;
  let countCallbackCall = 0;
  const dispatcherCallback = (e: MessageEvent, listener: MessageListener): boolean => {
    ++countCallbackCall;
    return true;
  }
  const originId = generateOriginId();

  it( 'create', () => {
    const addEventListenerSpy = jest.spyOn( global.window, 'addEventListener' );
    addEventListenerSpy.mockImplementation((type: string, callback: any) => {
      if( type === 'message') {
        onMessageCallback = callback;
      }
    });
    dispatcher = initMessageDispatcher(bus, dispatcherCallback);
    expect(dispatcher).not.toBeNull();
    expect(onMessageCallback).not.toBeNull();
    expect(onMessageCallback).not.toBeUndefined();
    addEventListenerSpy.mockClear();
  })

  it( 'onMessage with unknown event', () => {
    expect(onMessageCallback( createEvent(originId, 'unknownMethod', '/channel1'))).toBeTruthy();
    expect(countCallbackCall).toEqual(1);
  })

  it( 'onMessage without method', () => {
    expect(onMessageCallback( createEvent(originId, undefined, '/channel1'))).toBeTruthy();
    expect(countCallbackCall).toEqual(2);
  })

});