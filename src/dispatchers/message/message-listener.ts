import {BusEvent, Listener} from "../../types";
import {generateOriginId, OriginId} from "./originId";
import {LoggerConsole} from "logger-console";

export class MessageListener implements Listener {

  readonly originId: OriginId;
  private source: Window | Worker;
  private logger: LoggerConsole

  constructor(source: Window | Worker, originId?: OriginId, parentLogger?: LoggerConsole | undefined) {
    this.source = source;
    this.originId = originId || generateOriginId();
    this.logger = new LoggerConsole( this.originId, undefined, parentLogger);
    this.logger.trace( 'created message listener' );
  }

  process(event: BusEvent): boolean {
    return this.send( 'publish', event);
  }

  send(method: string, event: BusEvent): boolean {
    const msg = {
      event: event,
      method: method,
      originId: this.originId
    };
    try {
      this.source.postMessage(msg, '*');
      this.logger.trace( 'send message', msg );
    } catch (e) {
      this.logger.error("failed to send message", msg);
      return false;
    }
    return true;
  }

}