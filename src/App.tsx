import { Route, Router, Routes } from "@solidjs/router";
import { Component, createSignal, Show } from "solid-js";
import IndexPage from "./pages/IndexPage";

import "./App.scss";
import ComponentsPage from "./pages/Components";

const [theme, setTheme] = createSignal("dark");

const App : Component = () => (
    <div class={`theme-${theme()}`}>
        <Router base={import.meta.env.BASE_URL}>
            <Routes>
                <Route path="/" element={<IndexPage />} />
                <Show when={import.meta.env.DEBUG}>
                    <Route path="/components" element={<ComponentsPage />} />
                </Show>
            </Routes>
        </Router>
    </div>
);

export default App;
export { theme, setTheme };
