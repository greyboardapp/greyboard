import "reflect-metadata";
import { HubConnection, HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
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
import logger, { getSignalRLogLevel } from "../../utils/system/logger";

export interface NetworkState {
    user ?: BasicUser;
    clients : NetworkClient[];
    age : number;
}

export class Network extends Service<NetworkState> {
    public readonly onConnected = createDelegate();
    public readonly onConnectionFailed = createDelegate();
    public readonly onConnectionLost = createDelegate();
    public readonly onReconnected = createDelegate();
    public readonly onDisconnected = createDelegate();
    public readonly onClientReassigned = createDelegate();
    public readonly onClientBoardClosed = createDelegate();
    public readonly onClientReloadBoard = createDelegate();

    private readonly connection : HubConnection;
    private boardSlug ?: string;

    private reconnectTimer : number | null = null;

    private heartBeatTimer : number | null = null;
    private lastSentPointerPosition = new Point();
    private lastHeartBeatTime = 0;
    private reconnecting = false;
    private stopped = true;

    constructor() {
        super({
            clients: [],
            age: -1,
        });

        this.connection = new HubConnectionBuilder()
            .withUrl(import.meta.env.HUB_URL)
            .configureLogging(getSignalRLogLevel())
            .build();

        this.registerNetworkEvents();

        this.connection.onclose((e) => {
            if (this.stopped) {
                this.onDisconnected();
                return;
            }
            if (!this.reconnecting) {
                this.onConnectionLost();
                this.reconnect();
            }
        });
    }

    stop() : void {
        this.onConnected.clear();
        this.onConnectionFailed.clear();
        this.onConnectionLost.clear();
        this.onReconnected.clear();
        this.onDisconnected.clear();
        this.onClientReassigned.clear();
        this.onClientBoardClosed.clear();
        this.onClientReloadBoard.clear();

        this.stopped = true;
        this.connection.stop();
        this.state.clients.clear();
        this.state.age = -1;
        if (this.reconnectTimer)
            clearInterval(this.reconnectTimer);
        if (this.heartBeatTimer)
            clearInterval(this.heartBeatTimer);
    }

    async connect(slug : string) : Promise<boolean> {
        this.boardSlug = slug;
        try {
            this.state.user = user() ?? this.generateTemporaryUser();
            const pointerPos = viewport.screenToViewport(input.pointerPosition());

            this.stopped = false;
            await this.connection.start();
            if (this.reconnecting) {
                this.reconnecting = false;
                this.onReconnected();

                if (this.reconnectTimer)
                    clearInterval(this.reconnectTimer);
            }
            await this.send("Join", { ...this.state.user, pointerX: pointerPos.x, pointerY: pointerPos.y }, slug);

            this.heartBeatTimer = setInterval(async () : Promise<void> => this.setPointerPosition(), 100, null);

            return true;
        } catch (e) {
            console.error(e);
            if (!this.reconnecting)
                this.onConnectionFailed();
        }
        return false;
    }

    async disconnect() : Promise<void> {
        await this.connection.stop();
        this.state.clients = [];
        if (board.state.author !== this.state.user?.id)
            board.state.isSavingEnabled = false;
    }

    async onConnectionReady(clients : NetworkClient[], events : BoardEvent[], age : number) : Promise<void> {
        logger.debug("Hub Connection Ready", clients, events, age);
        this.state.clients = clients;

        if (this.state.age >= 0 && this.state.age !== age) {
            logger.debug("Board aged since last stable connection. Reloading contents...", this.state.age, age);
            this.onClientReloadBoard();
        }
        this.state.age = age;

        await this.performBoardActions(events, false);
        this.onConnected();
    }

    onClientConnected(client : NetworkClient) : void {
        logger.info("Client connected", client);
        this.state.clients.push(client);
    }

    onClientDisconnected(client : NetworkClient) : void {
        logger.info("Client disconnected", client);
        const index = this.state.clients.findIndex((c) => c.id === client.id);
        if (index >= 0)
            this.state.clients.splice(index, 1);
    }

    onReassignUserToClient() : void {
        logger.info("Client reassigned to another device");
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
        logger.debug("Board closed");
        this.disconnect();
        this.onClientBoardClosed();
    }

    onBoardNameChanged(name : string) : void {
        board.state.name = name;
    }

    onUserAllowedToSave(state : boolean) : void {
        logger.debug(`User is now ${state ? "able" : "unable"} to save`);
        board.state.isSavingEnabled = state;
    }

    onBoardAged(age : number) : void {
        this.state.age = age;
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

        board.queueSave();
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

    private async reconnect(attempt = 1) : Promise<void> {
        logger.debug("Reconnecting...");
        if (!this.boardSlug)
            return;
        this.reconnecting = true;
        await this.disconnect();
        const isConnected = await this.connect(this.boardSlug);
        if (!isConnected)
            this.reconnectTimer = setTimeout(async () => this.reconnect(attempt + 1), 5000, null);
    }
}

export const network = createService<NetworkState, Network>(Network);
