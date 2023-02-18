import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { generateStringId } from "../../utils/datatypes/id";
import generateName from "../../utils/system/nicknames";
import { createService, Service } from "../../utils/system/service";
import { BoardAction, BoardActionType } from "../data/boardAction";
import { BoardItem } from "../data/item";
import { NetworkUser } from "../data/networkUser";
import { board } from "./board";

export interface NetworkState {
    connected : boolean;
    id ?: string;
    user ?: NetworkUser;
}

export class Network extends Service<NetworkState> {
    private readonly connection : HubConnection;

    constructor() {
        super({
            connected: false,
        });

        this.connection = new HubConnectionBuilder().withUrl(import.meta.env.HUB_URL).withAutomaticReconnect().build();
    }

    stop() : void {
        this.disconnect();
    }

    async connect(user : NetworkUser | null, slug : string) : Promise<boolean> {
        try {
            this.state.user = user ?? this.generateTemporaryUser();

            await this.connection.start();

            this.connection.on("UserJoined", (userData : NetworkUser) => console.log(userData));
            this.connection.on("WelcomeBoardActionsReceived", (actions : Iterable<BoardAction>) => this.performBoardActions(actions, false));
            this.connection.on("BoardActionsReceived", (actions : Iterable<BoardAction>) => this.performBoardActions(actions));

            await this.send("Join", this.state.user, slug);

            return true;
        } catch (e) {
            console.error(e);
        }

        return false;
    }

    async disconnect() : Promise<void> {
        await this.connection.stop();
    }

    async addItem(items : Iterable<BoardItem>) : Promise<void> {
        await this.send("AddItem", items);
    }

    private generateTemporaryUser() : NetworkUser {
        return {
            id: generateStringId(),
            name: generateName(),
            avatar: "",
        };
    }

    private async send(method : string, ...args : unknown[]) : Promise<boolean> {
        try {
            await this.connection.send(method, ...args);
            return true;
        } catch (e) {
            console.error(e);
        }

        return false;
    }

    private performBoardActions(actions : Iterable<BoardAction>, ignoreOwn = true) : void {
        for (const action of actions) {
            if (ignoreOwn && action.by === this.state.user?.id)
                continue;
            if (action.type === BoardActionType.Add)
                board.addFromObject(action.data);
        }
    }
}

export const network = createService<NetworkState, Network>(Network);
