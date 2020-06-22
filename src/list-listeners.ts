import { Listener } from './types';

export class ListListeners {
  private listeners: Listener[] = [];

  public add(listener: Listener) {
    if( ! this.listeners.some( l => l === listener ) )
      this.listeners.push(listener);
  }

  public concat( list: ListListeners ) {
    this.listeners = this.listeners.concat(list.listeners);
  }

  public size() {
    return this.listeners.length
  }

  public at<T extends Listener>(index: number): T {
    return this.listeners[index] as T;
  }

  public isExists(listener: Listener): boolean {
    let index = this.listeners.indexOf(listener);
    return index !== -1;
  }

  public remove(listener: Listener): boolean {
    let index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
    return index != -1;
  }

  public each<T extends Listener>(callback: (listener:T, index?: number) => void) {
    let listeners = this.listeners;
    for (let i = 0; i < listeners.length; ++i) {
      callback(listeners[i] as T, i);
    }
  }

  public any(callback: (listener:Listener) => boolean): boolean {
    let result = false;
    let listeners = this.listeners;
    for (let i = 0; i < listeners.length; ++i) {
      let listener = listeners[i];
      result = Boolean(callback(listener)) || result;
    }
    return result;
  }
}
