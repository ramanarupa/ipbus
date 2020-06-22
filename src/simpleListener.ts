
import { BusEvent, Listener } from './types';

export type SimpleListenerHandler = (event:BusEvent, sourceListener?: Listener) => boolean;

export class SimpleListener implements Listener {
  readonly originId: string;
  private handler: SimpleListenerHandler | undefined;

  constructor(handler?:SimpleListenerHandler, prefix?:string) {
    this.originId = `${prefix || 'simple'}-${new Date().getTime()}`;
    this.handler = handler ? handler.bind(this) : undefined;
  }

  process(event:BusEvent, source?:Listener): boolean {
    if (this.handler) {
      return this.handler(event, source);
    }
    return false;
  };
}
