import "reflect-metadata";
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { Service, createService } from "../../utils/system/service";
import { BasicUser } from "../data/user";
import { BoardAction, BoardActionType } from "../data/boardAction";
import { generateStringId } from "../../utils/datatypes/id";
import generateName from "../../utils/system/nicknames";
import { board } from "./board";
import { user } from "../../utils/system/auth";
import { input } from "./input";
import Point from "../data/geometry/point";
import { NetworkClient } from "../data/networkClient";
import { viewport } from "./viewport";
import { BoardItem } from "../data/item";
import Rect from "../data/geometry/rect";

export interface NetworkState {
    user ?: BasicUser;
    clients : NetworkClient[];
}

export class Network extends Service<NetworkState> {
    private readonly connection : HubConnection;

    private heartBeatTimer : number | null = null;
    private lastSentPointerPosition = new Point();
    private lastHeartBeatTime = 0;

    constructor() {
        super({
            clients: [],
        });

        this.connection = new HubConnectionBuilder()
            .withUrl(import.meta.env.HUB_URL)
            .configureLogging(LogLevel.Debug)
            .withAutomaticReconnect()
            .build();

        this.connection.onreconnecting((e) => console.log("Reconnecting", e));
        this.connection.onreconnected((connectionId) => console.log("Reconnected", connectionId));
        this.connection.onclose((e) => console.error("Connection closed", e));
    }

    stop() : void {
        this.connection.stop();
        this.state.clients.clear();
        if (this.heartBeatTimer)
            clearInterval(this.heartBeatTimer);
    }

    async connect(slug : string) : Promise<boolean> {
        try {
            this.state.user = user() ?? this.generateTemporaryUser();

            await this.connection.start();
            await this.send("Join", this.state.user, slug);

            this.heartBeatTimer = setInterval(async () : Promise<void> => this.setPointerPosition(), 100, null);

            this.registerNetworkEvents();

            return true;
        } catch (e) {
            console.error(e);
        }
        return false;
    }

    onConnectionReady(clients : NetworkClient[], actions : BoardAction[]) : void {
        console.log("CONNECTION READY", clients);
        this.state.clients = clients;
        this.performBoardActions(actions, false);
    }

    onClientConnected(client : NetworkClient) : void {
        console.log("USER CONNECTED");
        this.state.clients.push(client);
    }

    onClientDisconnected(client : NetworkClient) : void {
        const index = this.state.clients.findIndex((c) => c.id === client.id);
        if (index >= 0)
            this.state.clients.splice(index, 1);
    }

    onClientAfkUpdated(client : NetworkClient) : void {
        const c = this.state.clients.find((value) => value.id === client.id);
        if (c)
            c.afk = client.afk;
    }

    onBoardPerformAction(action : BoardAction) : void {
        this.performBoardActions([action], true);
    }

    onHeartBeat(pointers : Record<string, [number, number]>) : void {
        for (const [id, pos] of Object.entries(pointers)) {
            if (pos.length !== 2)
                continue;

            const client = this.state.clients.find((c) => c.id === id);
            if (!client)
                continue;

            client.pointerX = pos[0] * viewport.state.scale;
            client.pointerY = pos[1] * viewport.state.scale;
        }
        this.lastHeartBeatTime = Date.now();
    }

    async setPointerPosition() : Promise<void> {
        let pos = input.pointerPosition();
        if (this.lastSentPointerPosition.x !== pos.x || this.lastSentPointerPosition.y !== pos.y) {
            pos = viewport.screenToViewport(pos);
            await this.send("SetPointerPosition", pos.x, pos.y);
            this.lastSentPointerPosition = pos;
        }
    }

    async setAfk(afk : boolean) : Promise<void> {
        await this.send("SetAfk", afk);
    }

    async addBoardItems(items : BoardItem[]) : Promise<void> {
        await this.send("AddItems", items);
    }

    async removeBoardItems(items : BoardItem[]) : Promise<void> {
        await this.send("RemoveItems", items.map((item) => item.id));
    }

    async moveBoardItems(ids : Iterable<number>, dx : number, dy : number) : Promise<void> {
        await this.send("MoveItems", { ids, dx, dy });
    }

    async resizeBoardItems(ids : Iterable<number>, rect : Rect) : Promise<void> {
        await this.send("ResizeItems", {
            ids, x: rect.x, y: rect.y, w: rect.w, h: rect.h,
        });
    }

    async boardSaved() : Promise<void> {
        await this.send("BoardSaved");
    }

    private generateTemporaryUser() : BasicUser {
        return {
            id: generateStringId(),
            name: generateName(),
            avatar: "",
        };
    }

    private performBoardActions(actions : Iterable<BoardAction>, ignoreOwn = true) : void {
        for (const action of actions) {
            if (ignoreOwn && action.by === this.state.user?.id)
                continue;
            if (action.type === BoardActionType.Add)
                board.addFromObject(action.data);
            else if (action.type === BoardActionType.Remove)
                board.removeByIds(action.data);
            else if (action.type === BoardActionType.Move)
                board.move(action.data.ids, action.data.dx, action.data.dy);
            else if (action.type === BoardActionType.Scale)
                board.resize(action.data.ids, new Rect(action.data.x, action.data.y, action.data.w, action.data.h));
        }
    }

    private async send(method : string, ...args : unknown[]) : Promise<boolean> {
        try {
            if (this.connection.state !== HubConnectionState.Connected)
                return false;

            await this.connection.send(method, ...args);
            return true;
        } catch (e) {
            console.error(e);
        }
        return false;
    }

    private registerNetworkEvents() : void {
        for (const prop of Reflect.ownKeys(Network.prototype as object))
            if (typeof prop === "string" && prop.startsWith("on")) {
                const func = Reflect.get(Network.prototype as object, prop) as (...args : unknown[]) => unknown;
                this.connection.on(prop.replace("on", ""), func.bind(this));
            }
    }
}

export const network = createService<NetworkState, Network>(Network);
