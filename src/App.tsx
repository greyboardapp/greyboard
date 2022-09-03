import { Route, Router, Routes } from "@solidjs/router";
import type { Component } from "solid-js";
import IndexPage from "./pages/IndexPage";

import "./App.scss";

const App : Component = () => (
    <Router base={import.meta.env.BASE_URL}>
        <Routes>
            <Route path="/" element={<IndexPage />} />
        </Routes>
    </Router>
);

export default App;
