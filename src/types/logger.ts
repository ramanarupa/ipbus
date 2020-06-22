
export enum LogLevel {
  silent = 1,
  error,
  warn,
  info,
  trace,
  debug = 6
}

export interface Logger {
  readonly level: LogLevel;

  info(...args: any): void;
  trace(...args: any): void;
  debug(...args: any): void;
  warn(...args: any): void;
  error(...args: any): void;
}
