# IpBus

IpBus is A high performance interprocess messages bus based on Publish/Subscribe pattern.

It helps you write application which will be able to exchange messages with other applications in different scope:
- between iframes (by using postMessage API)
- cross browser tabs communication (by using localStorage API)
- between front-end and backend (by using socket.io)

You can to use this library both on server and client, with React and other frameworks  
It is tiny (8kB, including dependencies).  

## Installation

To install the stable version:

```sh
npm install ipbus
```

This assumes you are using [npm](https://www.npmjs.com/) as your package manager.

## API Reference

## Example ##

**Basic usage**
```typescript
import {IpBus, LoggerConsole, SimpleListener} from 'ipbus';

const bus = new IpBus(new LoggerConsole('ipbus'));

const listener1 = new SimpleListener(function(event) {
  this.logger.info(`received event on ${event.channel}, data is ${event.data}`);  
  return true;
});

const listener2 = new SimpleListener(function(event) {
  this.logger.info(`received event on ${event.channel}, data is ${event.data}`);  
  return false; // return false here to allow to process message by next listener
}, 'listener2');

const listener3 = new SimpleListener(function(event) {
  this.logger.info(`received event on ${event.channel}, data is ${event.data}`);  
  return true;
}, 'listener3');

bus.subscribe('/channel1/*', listener1);
bus.subscribe('/channel2', listener2);
bus.subscribe('/channel2', listener3);

bus.publish( '/channel1/subchannel', 'event1');
bus.publish( '/channel2', 'event2');
```

**Post Message Demo**

TBD

**Cross-tab Demo**

TBD

**Socket.io Demo**

TBD

**React Demo**

TBD

**Document sharing Demo**

TBD

## License

[MIT](LICENSE.md)