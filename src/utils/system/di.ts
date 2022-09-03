import "reflect-metadata";

const INJECTABLE_TYPE_META_KEY = Symbol("injectable_type");

export class Service {
    init?() : void {};
    start?() : void {};
    stop?() : void {};
}

export enum Lifetime {
    Singleton,
    Transient
}

export interface InjectableEntry {
    ctor : InjectableContructor;
    instance : Service | null;
    lifetime : Lifetime;
}

export type InjectableContructor = new(...args : any[]) => Service;
export type InjectableCondition = () => boolean;

export class Container {
    private static readonly registry = new Map<InjectableContructor, InjectableEntry>();

    static register(ctor : InjectableContructor, lifetime : Lifetime) : void {
        this.registry.set(ctor, {
            ctor,
            instance: null,
            lifetime,
        });
    }

    static implementation(base : InjectableContructor, ctor : InjectableContructor) : void {
        const entry = this.registry.get(base);
        if (!entry)
            throw new Error("Implementation for unknown base injectable");
        entry.ctor = ctor;
    }

    static resolve<T>(ctor : new(...args : any[]) => T) : T {
        const args : Service[] = [];
        const params = Reflect.getMetadata(INJECTABLE_TYPE_META_KEY, ctor) as (InjectableContructor)[];
        if (params)
            for (const param of params.reverse())
                args.push(Container.get(param));
        const instance = new ctor(...args);
        return instance;
    }

    static get<T extends Service>(ctor : InjectableContructor) : T {
        const entry = this.registry.get(ctor);
        if (!entry)
            throw new Error(`Resolving unknown injectable '${ctor}'`);
        if (entry.lifetime === Lifetime.Singleton && entry.instance)
            return entry.instance as T;

        const instance = Container.resolve(ctor) as T;
        if (entry.lifetime === Lifetime.Singleton)
            entry.instance = instance;
        if (instance.init)
            instance.init();
        return instance;
    }

    static start() : void {
        for (const service of Container.registry.values())
            if (service.instance && service.instance.start)
                service.instance.start();
    }

    static stop() : void {
        for (const service of Container.registry.values())
            if (service.instance && service.instance.stop)
                service.instance.stop();
    }
}

export function Injectable(lifetime : Lifetime) : (ctor : InjectableContructor) => void {
    return (ctor : InjectableContructor) : void => {
        Container.register(ctor, lifetime);
    };
}

export function Inject(ctor : InjectableContructor) : (target : Object, propertyKey : string | symbol, index : number) => void {
    return (target : Object, propertyKey : string | symbol, index : number) => {
        const params = Reflect.getOwnMetadata(INJECTABLE_TYPE_META_KEY, target, propertyKey) as (InjectableContructor)[] ?? [];
        params.push(ctor);
        Reflect.defineMetadata(INJECTABLE_TYPE_META_KEY, params, target, propertyKey);
    };
}

export function ImplementationFor(base : InjectableContructor, condition ?: InjectableCondition) : (ctor : InjectableContructor) => void {
    return (ctor : InjectableContructor) : void => {
        if (!condition || condition())
            Container.implementation(base, ctor);
    };
}
