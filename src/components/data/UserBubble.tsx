import { Component } from "solid-js";
import { getInitials } from "../../utils/system/misc";

import styles from "./UserBubble.module.scss";

interface UserBubbleProps {
    name : string;
}

const UserBubble : Component<UserBubbleProps> = (props) => <div class={styles.userBubble}>{getInitials(props.name)}</div>;

export default UserBubble;
