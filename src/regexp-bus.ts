import { match, MatchFunction } from 'path-to-regexp';
import { ListListeners } from './list-listeners';
import { BusEvent, Listener } from './types';
import { Logger } from './types/logger';
import { LoggerConsole } from './logger-console';

declare type RegExpListeners  = {
  match: MatchFunction,
  list: ListListeners
};

export class RegExpBus {
  private regexps: Record<string, RegExpListeners> = {};
  private logger: Logger;

  constructor(logger: LoggerConsole){
    this.logger = new LoggerConsole('regexp-bus', logger.level, logger);
  }

  subscribe(channel: string, listener: Listener): boolean {
    let r = this.regexps[channel];
    if (!r) {
      r = this.regexps[channel] = {
        list: new ListListeners(),
        match: match(channel)
      };
    }
    const exists = r.list.isExists(listener);
    if( ! exists ) r.list.add(listener);
    return !exists;
  }

  unsubscribe(channel: string, listener?: Listener): boolean {
    const r = this.regexps[channel];
    if (!r) return false;

    if( listener ) {
      const result = r.list.remove(listener)
      if( result && r.list.size() === 0 ) delete this.regexps[channel];
      return result;
    }

    delete this.regexps[channel];
    return true;
  }

  publish(event: BusEvent, source?: Listener, target?: Listener): boolean {
    const channel = event.channel;
    const list = this.buildCacheLine(channel);
    const self = this;
    return list.any((listener: Listener): boolean => {
      if (target && target !== listener) return false;
      if (source === listener) return false;
      try {
        return listener.process(event, source);
      } catch (e) {
        self.logger.error("Error during processing event", event, ', error:', e);
        return false;
      }
    });
  }

  getAllChannels() {
    return Object.keys(this.regexps);
  }

  private buildCacheLine(channel: string): ListListeners {
    const list: ListListeners = new ListListeners();
    for (let index in this.regexps) {
      const r: RegExpListeners = this.regexps[index];
      const params = r.match(channel);
      if (params) list.concat( r.list );
    }
    return list;
  }

}
