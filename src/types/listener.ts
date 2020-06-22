import { BusEvent } from './busEvent';

export interface Listener {
  process(event:BusEvent, sourceListener?:Listener): boolean;
}