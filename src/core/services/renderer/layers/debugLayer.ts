import { board } from "../../board";
import { Chunk } from "../../board/chunk";
import { RendererLayer } from "../../renderer/layer";
import { viewport } from "../../viewport";

export class DebugLayer extends RendererLayer {
    onRender(dt : number) : void {
        this.graphics.clear();
        for (const chunk of board.chunks.values())
            this.graphics.rectangle(
                chunk.boundary.x * Chunk.maxChunkSize + viewport.state.offsetX,
                chunk.boundary.y * Chunk.maxChunkSize + viewport.state.offsetY,
                Chunk.maxChunkSize,
                Chunk.maxChunkSize,
                0xFF0000,
            );
    }
}
