import { RendererLayer } from "../../renderer/layer";
import { toolbox } from "../../toolbox";

export class DynamicLayer extends RendererLayer {
    onRender(dt : number) : void {
        this.graphics.clear();
        const tool = toolbox.state.selectedTool;
        if (!tool)
            return;
        tool.onRender(this.graphics, dt);
    }
}
