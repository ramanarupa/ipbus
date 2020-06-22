import { BusEvent, Listener, PubSub, Dispatcher } from './types';
import { LoggerConsole } from './logger-console';
import { RegExpBus } from './regexp-bus';

export class IpBus implements PubSub {

  private regExpBus: RegExpBus;
  readonly logger: LoggerConsole;
  private dispatchers: Dispatcher[] = []

  constructor(parentLogger?: LoggerConsole ) {
    this.logger = new LoggerConsole('ipbus', undefined, parentLogger);
    this.regExpBus = new RegExpBus(this.logger);
  }

  addDispatcher(dispatcher: Dispatcher) {
    const i = this.dispatchers.indexOf( dispatcher );
    if( i === -1 )
      this.dispatchers.push(dispatcher);
    else {
      this.logger.warn( 'trying to add existance dispatcher');
    }
  }

  removeDispatcher(dispatcher: Dispatcher) {
    const i = this.dispatchers.indexOf( dispatcher );
    if( i !== -1 ) this.dispatchers.splice(i,1);
  }

  subscribe(channel: string, listener: Listener): void {
    if( this.regExpBus.subscribe(channel, listener) ) {
      this.dispatchers.forEach( dispatcher => {
        dispatcher.onSubscribe(channel, listener);
      })
    }
  }

  unsubscribe(channel: string, listener?: Listener): boolean {
    const result = this.regExpBus.unsubscribe(channel, listener)
    if( result ) {
      this.dispatchers.forEach( dispatcher => {
        dispatcher.onUnsubscribe(channel, listener);
      })
    }
    return result;
  }

  publish(channel: string, data?: any, sourceListener?: Listener): boolean {
    const event: BusEvent = {
      channel,
      data
    }
    return this.regExpBus.publish(event, sourceListener);
  }

}