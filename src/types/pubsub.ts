import { Listener } from './listener';

export declare type PubSubCallback = (channel: string, data: any) => boolean;

/**
 *  Publish/Subscribe interface
 */
export interface PubSub {
  /**
   * Subscribe on channel name
   * @param channel - specify channel name
   * @param listener - listener which will process events on this channel
   */
  subscribe(channel: string, listener: Listener): void;

  /**
   * Unsubscribe from channel name
   * @param channel - specify channel name
   * @param listener - specify listener which need to remove, if no listener is specified then will be unsubscribed all listeners
   */
  unsubscribe(channel: string, listener?: Listener): boolean;

  /**
   * Publish event on channel
   * @param channel - channel name
   * @param data - user data
   * @param sourceListener - source listener which need to exclude from this event
   *                         (this parameter is used for inter-process communication)
   */
  publish(channel: string, data?: any, sourceListener?: Listener): boolean;
}
