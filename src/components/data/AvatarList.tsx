import { cva, VariantProps } from "class-variance-authority";
import { For, ParentComponent, Show } from "solid-js";
import { User } from "../../core/data/user";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import Text from "../typography/Text";
import Avatar, { AvatarVariants } from "./Avatar";

import styles from "./AvatarList.module.scss";

const AvatarListVariants = { ...getGenericVariants({}) };
const avatarListStyles = cva(styles.avatarList, {
    variants: AvatarListVariants,
});

interface AvatarListProps extends GenericProps<HTMLDivElement>, VariantProps<typeof avatarListStyles> {
    users : User[];
    me ?: string;
    size ?: keyof typeof AvatarVariants.size;
}

const AvatarList : ParentComponent<AvatarListProps> = (props) => (
    <div {...getGenericProps(props)} class={cls(avatarListStyles(props), props.class)}>
        <For each={props.users.slice(0, 9)}>
            {(user) => <Avatar user={user} me={user.id === props.me} size={props.size} />}
        </For>
        <Show when={props.users.length > 9}>
            <Text content={`+${props.users.length - 9}`} as="span" />
        </Show>
    </div>
);

export default AvatarList;
