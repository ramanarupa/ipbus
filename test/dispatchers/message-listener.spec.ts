import {LoggerConsole} from "../../src";
import {MessageListener} from "../../src/dispatchers/message";
import {LogLevel} from "../../src/types/logger";

describe('MessageListener', () => {

  it( 'create without originId', () => {
    const listener = new MessageListener( global.window, undefined, new LoggerConsole('', LogLevel.trace ) );
    expect(listener.originId).not.toBeNull();
    expect(listener.originId).not.toBeUndefined();
    expect(listener.originId).not.toBe('');
  })

  it( 'create with originId', () => {
    const listener = new MessageListener( global.window, '1234567', new LoggerConsole('', LogLevel.trace ) );
    expect(listener.originId).toEqual('1234567');
  })

  it( 'send a message', () => {
    const postMessageSpy = jest.spyOn( global.window, 'postMessage' );
    const listener = new MessageListener( global.window, undefined, new LoggerConsole('', LogLevel.trace ) );
    expect(listener.send( 'test', {channel: '/channel'} )).toBeTruthy();
    expect(postMessageSpy).toHaveBeenCalledTimes(1);
    postMessageSpy.mockClear();
  })

  it( 'failed to send a message', () => {
    const errorSpy = jest.spyOn(global.console, 'error')
    const postMessageSpy = jest.spyOn( global.window, 'postMessage' );
    postMessageSpy.mockImplementation(() => {
      throw new Error('error post message')
    });

    const listener = new MessageListener( global.window, undefined, new LoggerConsole('', LogLevel.trace ) );

    expect(listener.send( 'test', {channel: '/channel'} )).toBeFalsy();
    expect(postMessageSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][1]).toEqual(`[${listener.originId}]:`);

    postMessageSpy.mockClear();
    errorSpy.mockClear();
  })

  it( 'process bus event', () => {
    const postMessageSpy = jest.spyOn( global.window, 'postMessage' );
    let msg = {
      method: undefined,
      originId: undefined
    };
    postMessageSpy.mockImplementation((m: any, t: string) => {
      msg = m;
    });

    const listener = new MessageListener( global.window, undefined, new LoggerConsole('', LogLevel.trace ) );

    expect(listener.process( {channel: '/channel'} )).toBeTruthy();
    expect(postMessageSpy).toHaveBeenCalledTimes(1);
    expect(msg.method).toEqual('publish')
    expect(msg.originId).toEqual(listener.originId)

    postMessageSpy.mockClear();
  })
})