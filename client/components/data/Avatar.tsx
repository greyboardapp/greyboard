import { cva, VariantProps } from "class-variance-authority";
import { Component, Show } from "solid-js";
import { BasicUser } from "../../core/data/user";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import { getInitials } from "../../utils/system/misc";
import Text from "../typography/Text";

import styles from "./Avatar.module.scss";

const AvatarVariants = {
    ...getGenericVariants({}),
    size: {
        xs: styles.xs,
        s: styles.s,
        m: styles.m,
        l: styles.l,
    },
    me: {
        true: styles.me,
    },
    inactive: {
        true: styles.inactive,
    },
};

const avatarStyles = cva(styles.avatar, {
    variants: AvatarVariants,
    defaultVariants: {
        size: "m",
    },
});

interface AvatarProps extends GenericProps<HTMLDivElement>, VariantProps<typeof avatarStyles> {
    user : BasicUser;
}

const Avatar : Component<AvatarProps> = (props) => (
    <div {...getGenericProps(props)} class={cls(avatarStyles(props), props.class)}>
        <Text content={(props.size === "xs" ? props.user.name[0] : getInitials(props.user.name))} size={props.size} />
        <Show when={props.user.avatar} keyed>
            {(img) => <img src={img} />}
        </Show>
    </div>
);

export default Avatar;
export { AvatarVariants };
