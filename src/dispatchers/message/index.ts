
import {IpBus} from "../../ipbus";
import {MessageCallback, MessageDispatcher} from "./message-dispatcher";

export * from './originId';
export * from './message-dispatcher';
export * from './message-listener';

let messageDispatcher: MessageDispatcher;

export const initMessageDispatcher = (bus: IpBus, callback?: MessageCallback): MessageDispatcher => {
  if( messageDispatcher ) {
    messageDispatcher.logger.warn( 'message dispatcher already up');
  } else {
    messageDispatcher = new MessageDispatcher(bus, callback);
  }
  bus.addDispatcher(messageDispatcher);
  return messageDispatcher;
};