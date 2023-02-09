import { Motion, Presence } from "@motionone/solid";
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
    <Presence>
        <Show when={loadingOverlayData().visible}>
            <Motion.div
                class="loadingOverlay"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <Motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{
                        y: 0, opacity: 1, transitionDuration: 1000, transitionDelay: 100, transitionTimingFunction: "ease-out",
                    }}
                >
                    <BoardLoadingSVG />
                    <Text content={loadingOverlayData().text} size={"l"} />
                </Motion.div>
            </Motion.div>
        </Show>
    </Presence>
);
export default LoadingOverlay;
export { showLoadingOverlay, hideLoadingOverlay };
