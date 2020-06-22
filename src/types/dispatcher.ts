import {Listener} from "./listener";
import {OriginId} from "../dispatchers/message";


export interface Dispatcher {
  onSubscribe( channel: string, sourceListener?: Listener): void;
  onUnsubscribe( channel: string, sourceListener?: Listener ): void;
  getListener(originId: OriginId): Listener;
}
