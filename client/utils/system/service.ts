import "reflect-metadata";
import { Accessor, batch, createEffect, untrack } from "solid-js";
import { createMutable, StoreNode } from "solid-js/store";

const SERVICE_METHOD_DETAILS_META_KEY = "ServiceMethodDetails";

interface ServiceMethodDetails {
    batched ?: boolean;
    detached ?: boolean;
    reactive ?: boolean;
}

const services : ServiceBase[] = [];

export interface ServiceBase {
    start() : void;
    stop() : void;
}

export class Service<T extends StoreNode = {}> implements ServiceBase {
    public state : T;

    constructor(initialState : T) {
        this.state = createMutable(initialState);
    }

    start() : void {};
    stop() : void {};
}

export function createService<T extends StoreNode, S extends Service<T>>(ctor : new () => S) : S {
    const service = new ctor();
    const funcNames = Reflect.ownKeys(ctor.prototype as object);
    for (const funcName of funcNames) {
        const func = Reflect.get(ctor.prototype as object, funcName) as Function;
        if (typeof func !== "function" || ["constructor", "start", "stop"].includes(funcName as string))
            continue;
        const details = Reflect.getOwnMetadata(SERVICE_METHOD_DETAILS_META_KEY, ctor.prototype as object, funcName) as ServiceMethodDetails | undefined;
        if (details?.batched)
            Reflect.set(service, funcName, (...args : unknown[]) => batch(() => func.call(service, ...args) as Accessor<unknown>));
        else
            Reflect.set(service, funcName, func.bind(service));
        if (details?.reactive)
            createEffect((prev) => func.call(service, prev));
        else if (details?.detached)
            untrack(() => { func.call(service); });
    }
    services.push(service);
    return service;
}

export function createStatelessService<S extends Service>(ctor : new () => S) : S {
    const service = new ctor();
    const funcNames = Reflect.ownKeys(ctor.prototype as object);
    for (const funcName of funcNames) {
        const func = Reflect.get(ctor.prototype as object, funcName) as Function;
        if (typeof func !== "function" || ["constructor", "start", "stop"].includes(funcName as string))
            continue;
        Reflect.set(service, funcName, func.bind(service));
    }
    services.push(service);
    return service;
}

export function startServices() : void {
    for (const service of services)
        if (service.start)
            service.start();
}

export function stopServices() : void {
    for (const service of services)
        if (service.stop)
            service.stop();
}

export function batched(target : Object, propertyKey : string, descriptor : PropertyDescriptor) : PropertyDescriptor {
    const details = Reflect.getOwnMetadata(SERVICE_METHOD_DETAILS_META_KEY, target, propertyKey) as ServiceMethodDetails ?? {};
    details.batched = true;
    Reflect.defineMetadata(SERVICE_METHOD_DETAILS_META_KEY, details, target, propertyKey);
    return descriptor;
}

export function reactive(target : Object, propertyKey : string, descriptor : PropertyDescriptor) : PropertyDescriptor {
    const details = Reflect.getOwnMetadata(SERVICE_METHOD_DETAILS_META_KEY, target, propertyKey) as ServiceMethodDetails ?? {};
    details.reactive = true;
    Reflect.defineMetadata(SERVICE_METHOD_DETAILS_META_KEY, details, target, propertyKey);
    return descriptor;
}

export function detached(target : Object, propertyKey : string, descriptor : PropertyDescriptor) : PropertyDescriptor {
    const details = Reflect.getOwnMetadata(SERVICE_METHOD_DETAILS_META_KEY, target, propertyKey) as ServiceMethodDetails ?? {};
    details.detached = true;
    Reflect.defineMetadata(SERVICE_METHOD_DETAILS_META_KEY, details, target, propertyKey);
    return descriptor;
}
