
import {IpBus} from "../../ipbus";
import {LoggerConsole} from "logger-console";
import {OriginId} from "./originId";
import {MessageListener} from "./message-listener";
import {assertNull} from "utils/validate";
import {Dispatcher, Listener} from "../../types";

export declare type MessageCallback = (e: MessageEvent, listener: MessageListener) => boolean;

export class MessageDispatcher implements Dispatcher {

  private bus: IpBus;
  readonly logger: LoggerConsole;
  private listenersById: Record<OriginId, MessageListener> = {};
  private callback: MessageCallback | undefined;

  constructor(bus: IpBus, callback?: MessageCallback) {
    this.bus = bus;
    this.callback = callback;
    this.logger = new LoggerConsole('message-bridge', undefined, bus.logger)
    window.addEventListener("message", this.onMessage, false);
    this.logger.info('Message dispatcher was created');
  }

  private onMessage = (e: MessageEvent): boolean => {
    if (!e || e.data.originId === undefined) return false; // unexpected messages send by other apps
    const data = e.data;

    const listener = this.getListener(data.originId) || this.createListener(e.source as (Window | Worker), data.originId, this.logger);
    if( data.method ) {
      this.logger.trace( 'received event', data.method, 'for', data.originId);
      switch (data.method) {
        case "unsubscribe":
          this.bus.unsubscribe(data.event.channel, listener);
          break;
        case "subscribe":
          this.bus.subscribe(data.event.channel, listener);
          break;
        case "publish":
          this.bus.publish(data.event.channel, data.event.data, listener);
          break;
        default:
          if( this.callback ) return this.callback(e, listener);
      }
    } else if( this.callback ) return this.callback(e, listener);

    e.preventDefault();
    e.stopPropagation();
    return true;
  }

  onSubscribe( channel: string, sourceListener?: Listener): void {
    const event = {
      channel
    };
    this.getAllListeners().forEach( listener => {
      if( listener !== sourceListener) {
        listener.send('subscribe', event)
      }
    })
  }

  onUnsubscribe( channel: string, sourceListener?: Listener): void {
    const event = {
      channel
    };
    this.getAllListeners().forEach( listener => {
      if( listener !== sourceListener) {
        listener.send('unsubscribe', event)
      }
    })
  }

  private createListener(source: Window | Worker, originId: string, parentLogger?: LoggerConsole) {
    let listener = this.listenersById[originId];
    assertNull(listener, 'Listener with originId ' + originId + ' already exists');

    listener = new MessageListener(source, originId, parentLogger);
    this.listenersById[originId] = listener;

    return listener;
  }

  getListener(originId: OriginId): MessageListener {
    return this.listenersById[originId];
  };

  getAllListeners(): MessageListener[]  {
    return Object.keys(this.listenersById).map( k => this.listenersById[k]);
  }

}
