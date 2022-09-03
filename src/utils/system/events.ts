/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Container, Injectable, Lifetime, Service } from "./di";

const EVENT_DATA_META_KEY = Symbol("event_data");

export class Event<T = null> {
    constructor(public data : T) {}
}

export type EventConsumerMethod = (data : unknown) => boolean;
export type EventListenerContructor = new(...args : any[]) => any;
export type EventConstructor = new(data : any) => Event<any>

export interface EventMetaData<T extends EventConstructor | EventConsumerMethod> {
    event : T;
    priority : number;
}

@Injectable(Lifetime.Singleton)
export class EventDispatcher implements Service {
    private readonly consumers : Map<EventConstructor, EventMetaData<EventConsumerMethod>[]> = new Map();

    init() : void {}

    dispatch<T>(event : Event<T>) : boolean {
        const consumerMetaData = this.consumers.get(Object.getPrototypeOf(event).constructor as EventConstructor);
        if (consumerMetaData === undefined)
            return false;

        consumerMetaData.sort((a, b) => b.priority - a.priority);

        for (const metaData of consumerMetaData)
            if (metaData.event(event.data))
                return true;

        return false;
    }

    registerConsumer(event : EventConstructor, consumer : EventConsumerMethod, priority : number) : void {
        let consumerMetaData = this.consumers.get(event);
        if (consumerMetaData === undefined)
            consumerMetaData = [];

        consumerMetaData.push({ event: consumer, priority });
        this.consumers.set(event, consumerMetaData);
    }
}

export function EventConsumer(event : EventConstructor, priority = 0) : (target : Object, propertyKey : string, descriptor : PropertyDescriptor) => PropertyDescriptor {
    return (target : Object, propertyKey : string, descriptor : PropertyDescriptor) : PropertyDescriptor => {
        let events = Reflect.getOwnMetadata(EVENT_DATA_META_KEY, target, propertyKey) as EventMetaData<EventConstructor>[];
        if (!events)
            events = [];
        events.push({ event, priority });
        Reflect.defineMetadata(EVENT_DATA_META_KEY, events, target, propertyKey);

        return descriptor;
    };
}

export function EventListener(ctor : EventListenerContructor) : EventListenerContructor {
    const dispatcher = Container.get<EventDispatcher>(EventDispatcher);

    return class extends ctor {
        constructor(...args : any[]) {
            super(...args);
            const functions = Reflect.ownKeys(ctor.prototype as object);
            for (const name of functions) {
                const eventMetaData = Reflect.getOwnMetadata(EVENT_DATA_META_KEY, ctor.prototype as object, name) as EventMetaData<EventConstructor>[];
                if (!eventMetaData)
                    continue;

                let fn = Reflect.get(ctor.prototype as object, name) as EventConsumerMethod;
                fn = fn.bind(this) as EventConsumerMethod;

                for (const metaData of eventMetaData)
                    dispatcher.registerConsumer(metaData.event, fn, metaData.priority);
            }
        }
    };
}
