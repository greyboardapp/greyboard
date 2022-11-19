import { Route, Router, Routes } from "@solidjs/router";
import { Component, createSignal, lazy, Suspense } from "solid-js";

import "./App.scss";
import RouteLoading from "./components/app/RouteLoading";

const HomePage = lazy(async () => import("./pages/HomePage"));
const BoardPage = lazy(async () => import("./pages/BoardPage"));
const SignInPage = lazy(async () => import("./pages/SignInPage"));
const AuthPage = lazy(async () => import("./pages/AuthPage"));
const DashboardPage = lazy(async () => import("./pages/DashboardPage"));

const [theme, setTheme] = createSignal("dark");

const App : Component = () => (
    <div class={`theme-${theme()}`}>
        <Router base={import.meta.env.BASE_URL}>
            <Suspense fallback={<RouteLoading />}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/sign-in" element={<SignInPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/b/:id" element={<BoardPage />} />
                </Routes>
            </Suspense>
        </Router>
    </div>
);

export default App;
export { theme, setTheme };
