import {LoggerConsole, SimpleListener} from "../src";
import {RegExpBus} from "../src/regexp-bus";

describe('RegExpBus', () => {

  const logger = new LoggerConsole('ipbus');

  it('get all channels', () => {
    const bus = new RegExpBus(logger)

    bus.subscribe('/channel1', new SimpleListener() );
    bus.subscribe('/channel1', new SimpleListener() );
    bus.subscribe('/channel2', new SimpleListener() );

    expect(bus.getAllChannels()).toEqual([
      '/channel1', '/channel2'
    ])
  })
});