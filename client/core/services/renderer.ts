import tweenjs from "@tweenjs/tween.js";
import { RendererLayer } from "./renderer/layer";
import { createStatelessService, Service } from "../../utils/system/service";
import createDelegate from "../../utils/datatypes/delegate";

import { DynamicLayer } from "./renderer/layers/dynamicLayer";
import { DebugLayer } from "./renderer/layers/debugLayer";

class Renderer extends Service {
    public onFrameUpdate = createDelegate<[dt : number]>();

    private enabled = true;
    private readonly layerStack : RendererLayer[] = [];
    private prevT = 0;

    constructor() {
        super({});
    }

    start() : void {
        this.enabled = true;
        for (const layer of this.layerStack)
            layer.start();

        this.render(0);
    }

    stop() : void {
        this.enabled = false;
        this.onFrameUpdate.clear();
    }

    pushLayer(ctor : new () => RendererLayer) : void {
        this.layerStack.push(new ctor());
    }

    getLayer<T extends RendererLayer>(toolType : new (...args : any[]) => T) : T | null {
        return (this.layerStack.find((tool) => tool instanceof toolType) as T) ?? null;
    }

    private async render(t : number) : Promise<void> {
        const dt = (t - this.prevT) * 0.001;
        for (const layer of this.layerStack)
            await layer.onRender(dt);

        tweenjs.update(t);
        this.onFrameUpdate(dt);

        this.prevT = t;

        if (this.enabled)
            window.requestAnimationFrame(async (t2) => this.render(t2));
    }
}

const renderer = createStatelessService(Renderer);
renderer.pushLayer(DynamicLayer);

if (import.meta.env.DEBUG === "true")
    renderer.pushLayer(DebugLayer);

export { renderer };
