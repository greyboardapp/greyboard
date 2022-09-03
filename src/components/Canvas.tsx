import type { Component } from "solid-js";

import styles from "./Canvas.module.scss";

const Canvas : Component = () => (
    <div
        class={styles.canvasContainer}
    >
        <canvas id="staticCanvas"></canvas>
        <canvas id="dynamicCanvas"></canvas>
    </div>
);

export default Canvas;
