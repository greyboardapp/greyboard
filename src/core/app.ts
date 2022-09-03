import { Container } from "../utils/system/di";
import Rect from "./data/geometry/rect";
import Rectangle from "./data/items/rectangle";
import Board from "./services/board";

class Application {
    constructor(
        private readonly board : Board,
    ) {}

    start() : void {
        Container.start();

        const rect = new Rectangle(new Rect(100, 100, 300, 200), 0xFF000070, 0, true);
        this.board.add([
            rect,
        ]);

        this.board.add([
            new Rectangle(new Rect(150, 120, 300, 200), 0xFF000070, 0, true),
        ]);

        this.board.remove([rect.id]);
    }

    stop() : void {
        Container.stop();
    }
}

const app = new Application(
    Container.get(Board),
);
export default app;
