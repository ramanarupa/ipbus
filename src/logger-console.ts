import {Logger, LogLevel} from './types/logger';

export class LoggerConsole implements Logger {

  readonly prefix: string;
  readonly level: LogLevel;

  constructor(prefix?: string | string[], level?: LogLevel, parent?: LoggerConsole) {

    this.prefix = parent ? parent.prefix : '';

    if( Array.isArray(prefix) ) {
      this.prefix += prefix.map( p => "[" + p + "]").join('');
    } else if( prefix )
      this.prefix += "[" + prefix + "]";

    if( level ) this.level = level
    else if( parent ) this.level = parent.level;
    else this.level = LogLevel.info;
  }

  public info(...args: any):void {
    if (this.level >= LogLevel.info) {
      this.log(console.log, args, false);
    }
  }

  public trace(...args: any):void {
    if (this.level >= LogLevel.trace) {
      this.log(console.log, args, false);
    }
  }
  public debug(...args: any):void {
    if (this.level >= LogLevel.debug) {
      this.log(console.debug, args, false);
    }
  }

  public warn(...args: any):void {
    if (this.level >= LogLevel.warn) {
      this.log(console.warn, args, true);
    }
  }

  public error(...args: any):void {
    if (this.level >= LogLevel.error) {
      this.log(console.error, args, true);
    }
  }

  private log(func: () => any, args: IArguments, stack: boolean): void {

    const a: any = [];
    const d = new Date();
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();
    const ms = d.getMilliseconds();
    const mcC = ms <= 99 ? '0' + ms : ms;
    a.push(String((h <= 9 ? '0' + h : h) + ':' + (m <= 9 ? '0' + m : m) + ':' + (s <= 9 ? '0' + s : s) + '.' + (ms <= 9 ? '00' + ms : mcC)));

    if (this.prefix) {
      a.push(this.prefix + ':');
    }

    for (let i = 0; i < args.length; i++) {
      a.push(args[i]);
    }

    if (stack)
      try {
        const stack = Error().stack;
        if( stack ) {
          const traceLine = stack.split("\n")[3]; // 4 for Safari
          a.push(traceLine);
        }
      } catch (e) {
        // ignore
      }

    func.apply(console, a);
  }
}
