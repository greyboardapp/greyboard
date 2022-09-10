import { Component, onCleanup, onMount } from "solid-js";
import Canvas from "../components/Canvas";
import app from "../core/app";

const IndexPage : Component = () => {
    onMount(() => app.start());
    onCleanup(() => app.stop());

    return (
        <>
            <Canvas />
        </>
    );
};

export default IndexPage;
