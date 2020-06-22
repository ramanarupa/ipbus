import {IpBus, LoggerConsole, SimpleListener} from "../dist/ipbus";

const bus = new IpBus(new LoggerConsole('ipbus'));

const listener1 = new SimpleListener(function(event) {
  console.log(`received event on ${event.channel}, data is ${event.data}`);
  return true;
});

const listener2 = new SimpleListener(function(event) {
  console.log(`received event on ${event.channel}, data is ${event.data}`);
  return false; // return false here to allow to process message by next listener
}, 'listener2');

const listener3 = new SimpleListener(function(event) {
  console.log(`received event on ${event.channel}, data is ${event.data}`);
  return true;
}, 'listener3');

bus.subscribe('/channel1/:subchannel', listener1);
bus.subscribe('/channel2', listener2);
bus.subscribe('/channel2', listener3);

bus.publish( '/channel1/subchannel', 'event1');
bus.publish( '/channel2', 'event2');
