import createDelegate from "../../utils/datatypes/delegate";
import { BoardItem } from "../data/item";
import { renderer } from "./renderer";
import { QuadTree } from "./board/quadTree";
import { createStatelessService, Service } from "../../utils/system/service";
import Rect from "../data/geometry/rect";
import { Chunk } from "./board/chunk";
import { viewport } from "./viewport";

class BoardBuilder extends Service {
    public onBuildFinished = createDelegate<[chunks : Map<string, QuadTree>]>();

    public isRunning = false;

    private items : BoardItem[] = [];
    private readonly chunks = new Map<string, QuadTree>();
    private processedCount = 0;
    private readonly batchSize = 10;

    constructor() {
        super({});
    }

    stop() : void {
        this.onBuildFinished.clear();
    }

    queueBuild(items : BoardItem[]) : void {
        this.items = items;
        this.chunks.clear();
        this.processedCount = 0;
        renderer.onFrameUpdate.add(this.process);
        this.isRunning = true;
    }

    cancel() : void {
        this.endProcess(false);
    }

    private process() : void {
        const count = Math.min(this.processedCount + this.batchSize, this.items.length);
        for (let i = this.processedCount; i < count; i++) {
            const item = this.items[i];

            const region = this.truncateRegion(viewport.viewportToBoardRect(item.rect));
            for (let { x } = region.min; x <= region.max.x; ++x)
                for (let { y } = region.min; y <= region.max.y; ++y) {
                    const key = this.hash(x, y);
                    let chunk = this.chunks.get(key);
                    if (!chunk) {
                        chunk = new QuadTree(new Rect(x * Chunk.maxChunkSize, y * Chunk.maxChunkSize, Chunk.maxChunkSize, Chunk.maxChunkSize), 0);
                        this.chunks.set(key, chunk);
                    }
                    chunk.insert(item);
                }
        }
        this.processedCount += this.batchSize;
        if (this.processedCount >= this.items.length)
            this.endProcess(true);
    }

    private endProcess(finished : boolean) : void {
        if (finished)
            this.onBuildFinished(this.chunks);
        renderer.onFrameUpdate.remove(this.process);
        this.processedCount = 0;
        this.chunks.clear();
        this.isRunning = false;
    }

    private truncateRegion(r : Rect) : Rect {
        const rect = new Rect(
            Math.floor(r.x / Chunk.maxChunkSize),
            Math.floor(r.y / Chunk.maxChunkSize),
            0, 0,
        );
        rect.x2 = Math.floor(r.x2 / Chunk.maxChunkSize);
        rect.y2 = Math.floor(r.y2 / Chunk.maxChunkSize);
        return rect;
    }

    private hash(x : number, y : number) : string {
        return `${x}_${y}`;
    }
}

const builder = createStatelessService(BoardBuilder);

export { builder };
