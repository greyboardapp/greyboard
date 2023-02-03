import { useLocation } from "@solidjs/router";
import { Component, Show } from "solid-js";

import RouteLoading from "./RouteLoading";

interface BoardLoadingProps {
    force ?: true;
}

const BoardLoading : Component<BoardLoadingProps> = (props) => {
    const location = useLocation();

    return (
        <Show when={props.force || location.pathname.startsWith("/b")}>
            <RouteLoading />
        </Show>
    );
};
export default BoardLoading;
