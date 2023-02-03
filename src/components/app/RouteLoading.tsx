import { Component } from "solid-js";

import BoardLoadingSVG from "../../assets/animations/board_loading.svg";
import Text from "../typography/Text";
import "./RouteLoading.scss";

const RouteLoading : Component = () => (
    <div class="boardLoading">
        <BoardLoadingSVG />
        <Text content="board.loading" size={"l"} />
    </div>
);
export default RouteLoading;
