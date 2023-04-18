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
        console.log(clients);
        this.state.clients.push(...clients);
        console.log(this.state.clients);
        // this.performBoardActions(actions, true);
    }

    onClientConnected(client : NetworkClient) : void {
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

    onHeartBeat(pointers : Record<string, [number, number]>) : void {
        for (const [id, pos] of Object.entries(pointers)) {
            if (pos.length !== 2)
                continue;

            const client = this.state.clients.find((c) => c.id === id);
            if (!client)
                continue;

            [client.pointerX, client.pointerY] = pos;
        }
        this.lastHeartBeatTime = Date.now();
    }

    // FIXME: The pointer position sent is not correct. Viewport scaling messes up the position.
    async setPointerPosition() : Promise<void> {
        let pos = input.pointerPosition();
        if (this.lastSentPointerPosition.x !== pos.x || this.lastSentPointerPosition.y !== pos.y) {
            pos = viewport.screenToBoard(pos);
            await this.send("SetPointerPosition", pos.x, pos.y);
            this.lastSentPointerPosition = pos;
        }
    }

    async setAfk(afk : boolean) : Promise<void> {
        await this.send("SetAfk", afk);
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
