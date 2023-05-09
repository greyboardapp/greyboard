import { format } from "light-date";
import { LogLevel as SignalRLogLevel } from "@microsoft/signalr";

enum LogLevel {
    Trace = 1 << 0,
    Debug = 1 << 1,
    Information = 1 << 2,
    Warning = 1 << 3,
    Error = 1 << 4,
}

interface Logger {
    level : LogLevel;
    trace(...args : unknown[]) : void;
    debug(...args : unknown[]) : void;
    info(...args : unknown[]) : void;
    warning(...args : unknown[]) : void;
    error(...args : unknown[]) : void;
}

const logLevel = import.meta.env.LOG_LEVEL ?? 0;

const log = (logFn : (...args : unknown[]) => void, message : string, ...args : unknown[]) : void => logFn(format(new Date(), "{HH}:{mm}:{ss}:{SSS}"), message, ...args);

const logger : Logger = {
    level: logLevel,
    trace: ((logLevel & LogLevel.Trace) === LogLevel.Trace) ? (message : string, ...args : unknown[]) => log(console.trace, message, ...args) : (...args : unknown[]) => {},
    debug: ((logLevel & LogLevel.Debug) === LogLevel.Debug) ? (message : string, ...args : unknown[]) => log(console.debug, message, ...args) : (...args : unknown[]) => {},
    info: ((logLevel & LogLevel.Information) === LogLevel.Information) ? (message : string, ...args : unknown[]) => log(console.info, message, ...args) : (...args : unknown[]) => {},
    warning: ((logLevel & LogLevel.Warning) === LogLevel.Warning) ? (message : string, ...args : unknown[]) => log(console.warn, message, ...args) : (...args : unknown[]) => {},
    error: ((logLevel & LogLevel.Error) === LogLevel.Error) ? (message : string, ...args : unknown[]) => log(console.error, message, ...args) : (...args : unknown[]) => {},
};

export const getSignalRLogLevel = () : SignalRLogLevel => {
    if ((logLevel & LogLevel.Debug) === LogLevel.Debug)
        return SignalRLogLevel.Debug;
    if ((logLevel & LogLevel.Information) === LogLevel.Information)
        return SignalRLogLevel.Information;
    if ((logLevel & LogLevel.Warning) === LogLevel.Warning)
        return SignalRLogLevel.Warning;
    if ((logLevel & LogLevel.Error) === LogLevel.Error)
        return SignalRLogLevel.Error;
    return SignalRLogLevel.None;
};

export default logger;
