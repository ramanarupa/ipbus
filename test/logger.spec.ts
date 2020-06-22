import {LoggerConsole} from '../src';
import {LogLevel} from '../src/types/logger';

describe('create LoggerConsole', () => {

  it('create logger without parameter', () => {
    const logger = new LoggerConsole();
    expect(logger.prefix).toEqual('');
    expect(logger.level).toEqual(LogLevel.info);
  })

  it('create logger with prefix - [app]', () => {
    const logger = new LoggerConsole('app');
    expect(logger.prefix).toEqual('[app]');
    expect(logger.level).toEqual(LogLevel.info);
  })

  it('create logger with prefix - [app] and level: error', () => {
    const logger = new LoggerConsole('app', LogLevel.error);
    expect(logger.prefix).toEqual('[app]');
    expect(logger.level).toEqual(LogLevel.error);
  })

  it('create logger with array of prefixes', () => {
    const logger = new LoggerConsole(['app', 'service']);
    expect(logger.prefix).toEqual('[app][service]');
    expect(logger.level).toEqual(LogLevel.info);
  })

  it('create logger with parent logger', () => {
    const parent = new LoggerConsole(['app']);
    const logger = new LoggerConsole(['service'], LogLevel.info, parent);
    expect(logger.prefix).toEqual('[app][service]');
    expect(logger.level).toEqual(LogLevel.info);
  })

  it('create logger without loglevel and with parent logger', () => {
    const parent = new LoggerConsole(['app'], LogLevel.trace);
    const logger = new LoggerConsole(['service'], undefined, parent);
    expect(logger.prefix).toEqual('[app][service]');
    expect(logger.level).toEqual(LogLevel.trace);
  })
});

describe('logging in LoggerConsole', () => {

  it('show info', () => {
    const log = jest.spyOn(global.console, 'log')
    const logger = new LoggerConsole('app', LogLevel.info);
    logger.info( 'this is test information');
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][1]).toEqual("[app]:");
    expect(log.mock.calls[0][2]).toEqual("this is test information");
    log.mockClear();
  })

  it('not show info', () => {
    const log = jest.spyOn(global.console, 'log')
    const logger = new LoggerConsole('app', LogLevel.silent);
    logger.info( 'this is another information');
    expect(log).toHaveBeenCalledTimes(0);
    log.mockClear();
  })

  it('show warn', () => {
    const warn = jest.spyOn(global.console, 'warn')
    const logger = new LoggerConsole('app', LogLevel.warn);
    logger.warn( 'this is warning');
    expect(warn.mock.calls[0][1]).toEqual("[app]:");
    expect(warn.mock.calls[0][2]).toEqual("this is warning");
    warn.mockClear();
  })

  it('not show warn', () => {
    const warn = jest.spyOn(global.console, 'warn')
    const logger = new LoggerConsole('app', LogLevel.silent);
    logger.warn( 'this is another warning');
    expect(warn).toHaveBeenCalledTimes(0);
    warn.mockClear();
  })

  it('show debug', () => {
    const debug = jest.spyOn(global.console, 'debug')
    const logger = new LoggerConsole('app', LogLevel.debug);
    logger.debug( 'this is debug info');
    expect(debug).toHaveBeenCalledTimes(1);
    expect(debug.mock.calls[0][1]).toEqual("[app]:");
    expect(debug.mock.calls[0][2]).toEqual("this is debug info");
    debug.mockClear();
  })

  it('not show debug', () => {
    const debug = jest.spyOn(global.console, 'debug')
    const logger = new LoggerConsole('app', LogLevel.silent);
    logger.debug( 'this is another debug');
    expect(debug).toHaveBeenCalledTimes(0);
    debug.mockClear();
  })

  it('show trace', () => {
    const log = jest.spyOn(global.console, 'log')
    const logger = new LoggerConsole('app', LogLevel.trace);
    logger.trace( 'this is test trace');
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][1]).toEqual("[app]:");
    expect(log.mock.calls[0][2]).toEqual("this is test trace");
    log.mockClear();
  })


  it('not show trace', () => {
    const log = jest.spyOn(global.console, 'log')
    const logger = new LoggerConsole('app', LogLevel.silent);
    logger.trace( 'this is another test');
    expect(log).toHaveBeenCalledTimes(0);
    log.mockClear();
  })

  it('show error', () => {
    const error = jest.spyOn(global.console, 'error')
    const logger = new LoggerConsole('app', LogLevel.error);
    logger.error( 'error 404');
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][1]).toEqual("[app]:");
    expect(error.mock.calls[0][2]).toEqual("error 404");
    error.mockClear();
  })

  it('not show error', () => {
    const error = jest.spyOn(global.console, 'error')
    const logger = new LoggerConsole('app', LogLevel.silent);
    logger.error( 'this is another error');
    expect(error).toHaveBeenCalledTimes(0);
    error.mockClear();
  })
});

describe('log info LoggerConsole', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('show time with XXX msec', () => {
    const mockDate = new Date('2010-01-01T01:00:00.101Z');
    const spy = jest.spyOn(global, 'Date');
    // @ts-ignore
    spy.mockImplementation( () => mockDate);

    const log = jest.spyOn(global.console, 'log')
    const logger = new LoggerConsole('app', LogLevel.info);
    logger.info( 'time test');
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toEqual("04:00:00.101");
    spy.mockReset();
    spy.mockRestore();
  })

  it('show time with XX msec', () => {
    const mockDate = new Date('2010-01-01T01:00:00.001Z');
    // @ts-ignore
    const spy = jest.spyOn(global, 'Date').mockImplementation( () => mockDate);

    const log = jest.spyOn(global.console, 'log')
    const logger = new LoggerConsole('app', LogLevel.info);
    logger.info( 'show time with XX msec');
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toEqual("04:00:00.001");
    spy.mockReset();
    spy.mockRestore();
  })

  it('show without prefix', () => {
    const log = jest.spyOn(global.console, 'log')
    const logger = new LoggerConsole();
    logger.info( 'show without prefix');
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][1]).toEqual("show without prefix");
  })
});