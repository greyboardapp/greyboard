import { format } from "light-date";

enum LogLevel {
    Trace = 1 << 0,
    Debug = 1 << 1,
    Info = 1 << 2,
    Warning = 1 << 3,
    Error = 1 << 4,
}

interface Logger {
    trace(...args : unknown[]) : void;
    debug(...args : unknown[]) : void;
    info(...args : unknown[]) : void;
    warning(...args : unknown[]) : void;
    error(...args : unknown[]) : void;
}

const logLevel = import.meta.env.LOG_LEVEL ?? 0;

const log = (logFn : (...args : unknown[]) => void, ...args : unknown[]) : void => logFn(format(new Date(), "{HH}:{mm}:{ss}:{SSS}"), ...args);

const logger : Logger = {
    trace: ((logLevel & LogLevel.Trace) === LogLevel.Trace) ? (...args : unknown[]) => log(console.trace, ...args) : (...args : unknown[]) => {},
    debug: (logLevel & LogLevel.Debug) ? (...args : unknown[]) => log(console.debug, ...args) : (...args : unknown[]) => {},
    info: (logLevel & LogLevel.Info) ? (...args : unknown[]) => log(console.info, ...args) : (...args : unknown[]) => {},
    warning: (logLevel & LogLevel.Warning) ? (...args : unknown[]) => log(console.warn, ...args) : (...args : unknown[]) => {},
    error: (logLevel & LogLevel.Error) ? (...args : unknown[]) => log(console.error, ...args) : (...args : unknown[]) => {},
};

export default logger;
