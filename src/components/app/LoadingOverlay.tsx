import { Component, createSignal, Show } from "solid-js";

import BoardLoadingSVG from "../../assets/animations/board_loading.svg";
import Text from "../typography/Text";
import "./LoadingOverlay.scss";

interface LoadingOverlayData {
    visible : boolean;
    text : string;
}

const [loadingOverlayData, setLoadingOverlayData] = createSignal<LoadingOverlayData>({ visible: false, text: "board.loading" });

function showLoadingOverlay(text : string) : void {
    setLoadingOverlayData({ visible: true, text });
}

function hideLoadingOverlay() : void {
    setLoadingOverlayData({ visible: false, text: "" });
}

const LoadingOverlay : Component = () => (
    <Show when={loadingOverlayData().visible}>
        <div class="loadingOverlay">
            <BoardLoadingSVG />
            <Text content={loadingOverlayData().text} size={"l"} />
        </div>
    </Show>
);
export default LoadingOverlay;
export { showLoadingOverlay, hideLoadingOverlay };
