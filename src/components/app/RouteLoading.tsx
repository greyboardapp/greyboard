import { useLocation } from "@solidjs/router";
import { Component, Show } from "solid-js";

import BoardLoadingSVG from "../../assets/animations/board_loading.svg";
import Text from "../typography/Text";
import "./BoardLoading.scss";

const RouteLoading : Component = () => {
    const location = useLocation();

    return (
        <Show when={location.pathname.startsWith("/b")}>
            <div class="boardLoading">
                <BoardLoadingSVG />
                <Text content="board.loading" size={"l"} />
            </div>
        </Show>
    );
};
export default RouteLoading;
