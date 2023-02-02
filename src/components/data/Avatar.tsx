import { cva, VariantProps } from "class-variance-authority";
import { Component, Show } from "solid-js";
import { User } from "../../core/data/user";
import { getInitials } from "../../utils/system/misc";
import Text from "../typography/Text";

import styles from "./Avatar.module.scss";

const AvatarVariants = {
    size: {
        xs: styles.xs,
        s: styles.s,
        m: styles.m,
        l: styles.l,
    },
    me: {
        true: styles.me,
    },
};

const avatarStyles = cva(styles.avatar, {
    variants: AvatarVariants,
    defaultVariants: {
        size: "m",
    },
});

interface AvatarProps extends VariantProps<typeof avatarStyles> {
    user : User;
}

const Avatar : Component<AvatarProps> = (props) => (
    <div class={avatarStyles(props)}>
        <Text content={(props.size === "xs" ? props.user.name[0] : getInitials(props.user.name))} size={props.size} />
        <Show when={props.user.avatar} keyed>
            {(img) => <img src={img} />}
        </Show>
    </div>
);

export default Avatar;
export { AvatarVariants };
