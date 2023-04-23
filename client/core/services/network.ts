import "reflect-metadata";
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { Service, createService } from "../../utils/system/service";
import { BasicUser } from "../data/user";
import { BoardAction, BoardActionType, BoardEvent } from "../data/boardAction";
import { generateStringId } from "../../utils/datatypes/id";
import generateName from "../../utils/system/nicknames";
import { board } from "./board";
import { user } from "../../utils/system/auth";
import { input, PointerType } from "./input";
import Point from "../data/geometry/point";
import { NetworkClient } from "../data/networkClient";
import { viewport } from "./viewport";
import { BoardItem } from "../data/item";
import Rect from "../data/geometry/rect";
import { selection } from "./selection";
import createDelegate from "../../utils/datatypes/delegate";

export interface NetworkState {
    user ?: BasicUser;
    clients : NetworkClient[];
}

export class Network extends Service<NetworkState> {
    public readonly onConnected = createDelegate();
    public readonly onConnectionFailed = createDelegate();
    public readonly onClientReassigned = createDelegate();
    public readonly onClientBoardClosed = createDelegate();

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
        this.onConnected.clear();
        this.onConnectionFailed.clear();
        this.onClientReassigned.clear();
        this.onClientBoardClosed.clear();

        this.connection.stop();
        this.state.clients.clear();
        if (this.heartBeatTimer)
            clearInterval(this.heartBeatTimer);
    }

    async connect(slug : string) : Promise<boolean> {
        try {
            this.state.user = user() ?? this.generateTemporaryUser();
            const pointerPos = viewport.screenToViewport(input.pointerPosition());

            await this.connection.start();
            await this.send("Join", { ...this.state.user, pointerX: pointerPos.x, pointerY: pointerPos.y }, slug);

            this.heartBeatTimer = setInterval(async () : Promise<void> => this.setPointerPosition(), 100, null);

            this.registerNetworkEvents();

            return true;
        } catch (e) {
            console.error(e);
            this.onConnectionFailed();
        }
        return false;
    }

    async disconnect() : Promise<void> {
        await this.connection.stop();
        this.state.clients = [];
    }

    async onConnectionReady(clients : NetworkClient[], events : BoardEvent[]) : Promise<void> {
        this.state.clients = clients;
        await this.performBoardActions(events, false);
        this.onConnected();
    }

    onClientConnected(client : NetworkClient) : void {
        this.state.clients.push(client);
    }

    onClientDisconnected(client : NetworkClient) : void {
        const index = this.state.clients.findIndex((c) => c.id === client.id);
        if (index >= 0)
            this.state.clients.splice(index, 1);
    }

    onReassignUserToClient() : void {
        this.disconnect();
        this.onClientReassigned();
    }

    onClientAfkUpdated(client : NetworkClient) : void {
        const c = this.state.clients.find((value) => value.id === client.id);
        if (c)
            c.afk = client.afk;
    }

    onPerformBoardAction(event : BoardEvent) : void {
        this.performBoardActions([event], true);
    }

    onBoardClosed() : void {
        this.disconnect();
        this.onClientBoardClosed();
    }

    onBoardNameChanged(name : string) : void {
        board.state.name = name;
    }

    onHeartBeat(pointers : Record<string, [number, number, PointerType]>) : void {
        for (const [id, data] of Object.entries(pointers)) {
            if (data.length !== 3)
                continue;

            const client = this.state.clients.find((c) => c.id === id);
            if (!client)
                continue;

            client.pointerX = data[0] * viewport.state.scale;
            client.pointerY = data[1] * viewport.state.scale;
            [,, client.pointerType] = data;
        }
        this.lastHeartBeatTime = Date.now();
    }

    async setPointerPosition() : Promise<void> {
        let pos = input.pointerPosition();
        if (this.lastSentPointerPosition.x !== pos.x || this.lastSentPointerPosition.y !== pos.y) {
            pos = viewport.screenToViewport(pos);
            await this.send("SetPointerPosition", pos.x, pos.y, input.state.lastUsedPointerType);
            this.lastSentPointerPosition = pos;
        }
    }

    async setAfk(afk : boolean) : Promise<void> {
        await this.send("SetAfk", afk);
    }

    async addBoardItems(items : BoardItem[]) : Promise<void> {
        await this.sendBoardAction({ type: BoardActionType.Add, data: items });
    }

    async removeBoardItems(items : BoardItem[]) : Promise<void> {
        await this.sendBoardAction({ type: BoardActionType.Remove, data: items.map((item) => item.id) });
    }

    async moveBoardItems(ids : number[], dx : number, dy : number) : Promise<void> {
        await this.sendBoardAction({ type: BoardActionType.Move, data: { ids, dx, dy } });
    }

    async resizeBoardItems(ids : number[], rect : Rect) : Promise<void> {
        await this.sendBoardAction({
            type: BoardActionType.Scale,
            data: {
                ids, x: rect.x, y: rect.y, w: rect.w, h: rect.h,
            },
        });
    }

    async orderBoardItems(ids : number[], direction : number) : Promise<void> {
        await this.sendBoardAction({ type: BoardActionType.Order, data: { ids, direction } });
    }

    async setBoardItemsLockState(ids : number[], state : boolean) : Promise<void> {
        await this.sendBoardAction({ type: BoardActionType.LockState, data: { ids, state } });
    }

    async setBoardItemLabel(ids : number[], label : string | null) : Promise<void> {
        await this.sendBoardAction({ type: BoardActionType.Label, data: { ids, label } });
    }

    async setBoardItemColor(ids : number[], color : number) : Promise<void> {
        await this.sendBoardAction({ type: BoardActionType.Color, data: { ids, value: color } });
    }

    async setBoardItemWeight(ids : number[], weight : number) : Promise<void> {
        await this.sendBoardAction({ type: BoardActionType.Weight, data: { ids, value: weight } });
    }

    async boardSaved() : Promise<void> {
        await this.send("BoardSaved");
    }

    async closeBoard() : Promise<void> {
        await this.send("CloseBoard");
    }

    async setBoardName(name : string) : Promise<void> {
        await this.send("SetBoardName", name);
    }

    private generateTemporaryUser() : BasicUser {
        return {
            id: generateStringId(),
            name: generateName(),
            avatar: "",
        };
    }

    private async performBoardActions(events : BoardEvent[], ignoreOwn = true) : Promise<void> {
        let isSelectionUpdateNeeded = true;
        for (const event of events) {
            if (ignoreOwn && event.by === this.state.user?.id)
                continue;
            if (event.action.type === BoardActionType.Add) {
                await board.addFromObject(event.action.data, true);
                isSelectionUpdateNeeded = false;
            } else if (event.action.type === BoardActionType.Remove) {
                board.removeByIds(event.action.data);
                selection.state.ids = selection.state.ids.filter((id) => !(event.action.data as number[]).includes(id));
            } else if (event.action.type === BoardActionType.Move) {
                board.move(event.action.data.ids, event.action.data.dx, event.action.data.dy);
            } else if (event.action.type === BoardActionType.Scale) {
                board.resize(event.action.data.ids, new Rect(event.action.data.x, event.action.data.y, event.action.data.w, event.action.data.h));
            } else if (event.action.type === BoardActionType.Order) {
                if (event.action.data.direction > 0)
                    board.bringForward(board.getItemsFromIds(event.action.data.ids));
                else
                    board.sendBackward(board.getItemsFromIds(event.action.data.ids));
            } else if (event.action.type === BoardActionType.LockState) {
                board.setLockState(board.getItemsFromIds(event.action.data.ids), event.action.data.state);
            } else if (event.action.type === BoardActionType.Label) {
                board.setLabel(board.getItemsFromIds(event.action.data.ids), event.action.data.label);
            } else if (event.action.type === BoardActionType.Color) {
                board.setColor(board.getItemsFromIds(event.action.data.ids), event.action.data.value);
            } else if (event.action.type === BoardActionType.Weight) {
                board.setWeight(board.getItemsFromIds(event.action.data.ids), event.action.data.value);
            }
        }
        if (isSelectionUpdateNeeded)
            selection.refresh();
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

    private async sendBoardAction(action : BoardAction) : Promise<boolean> {
        return this.send("BoardActionPerformed", action);
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
