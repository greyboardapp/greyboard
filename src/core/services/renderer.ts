import { RendererLayer } from "./renderer/layer";
import { createStatelessService, Service } from "../../utils/system/service";
import createDelegate from "../../utils/system/delegate";

import { DynamicLayer } from "./renderer/layers/dynamicLayer";
import { DebugLayer } from "./renderer/layers/debugLayer";

class Renderer extends Service {
    public onFrameUpdate = createDelegate<[dt : number]>();

    private enabled = true;
    private readonly layerStack : RendererLayer[] = [];

    constructor() {
        super({});
    }

    start() : void {
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

    private render(dt : number) : void {
        for (const layer of this.layerStack)
            layer.onRender(dt);

        this.onFrameUpdate(dt);

        if (this.enabled)
            window.requestAnimationFrame((t) => this.render(t));
    }
}

const renderer = createStatelessService(Renderer);
renderer.pushLayer(DynamicLayer);

if (import.meta.env.DEBUG)
    renderer.pushLayer(DebugLayer);

export { renderer };
