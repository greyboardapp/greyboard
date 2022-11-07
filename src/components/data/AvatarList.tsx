import { For, ParentComponent, Show } from "solid-js";
import { User } from "../../core/data/user";
import Text from "../typography/Text";
import Avatar, { AvatarVariants } from "./Avatar";

import styles from "./AvatarList.module.scss";

interface AvatarListProps {
    users : User[];
    me ?: number;
    size ?: keyof typeof AvatarVariants.size;
}

const AvatarList : ParentComponent<AvatarListProps> = (props) => (
    <div class={styles.avatarList}>
        <For each={props.users.slice(0, 9)}>
            {(user) => <Avatar user={user} me={user.id === props.me} size={props.size} />}
        </For>
        <Show when={props.users.length > 9}>
            <Text content={`+${props.users.length - 9}`} as="span" />
        </Show>
    </div>
);

export default AvatarList;
