import { cva, VariantProps } from "class-variance-authority";
import { For, ParentComponent, Show } from "solid-js";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import Text from "../typography/Text";
import Avatar, { AvatarVariants } from "../data/Avatar";

import styles from "../data/AvatarList.module.scss";
import { NetworkClient } from "../../core/data/networkClient";
import { viewport } from "../../core/services/viewport";
import Point from "../../core/data/geometry/point";
import { network } from "../../core/services/network";

const ClientListVariants = { ...getGenericVariants({}) };
const clientListStyles = cva(styles.avatarList, {
    variants: ClientListVariants,
});

interface ClientListProps extends GenericProps<HTMLDivElement>, VariantProps<typeof clientListStyles> {
    users : NetworkClient[];
    me ?: string;
    size ?: keyof typeof AvatarVariants.size;
}

const ClientList : ParentComponent<ClientListProps> = (props) => (
    <div {...getGenericProps(props)} class={cls(clientListStyles(props), props.class)}>
        <For each={props.users.slice(0, 9)}>
            {(user) => <Avatar user={user} me={user.id === props.me} inactive={user.afk} size={props.size} showNameAsTooltip onClick={() => {
                if (user.id !== network.state.user?.id)
                    viewport.centerOnPoint(new Point(user.pointerX, user.pointerY));
            }} />}
        </For>
        <Show when={props.users.length > 9}>
            <Text content={`+${props.users.length - 9}`} as="span" />
        </Show>
    </div>
);

export default ClientList;
