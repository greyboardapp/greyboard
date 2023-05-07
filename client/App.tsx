import { Route, Router, Routes } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Component, createEffect, createSignal, lazy } from "solid-js";
import { Toaster } from "solid-toast";

import "./App.scss";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import LoadingOverlay from "./components/app/LoadingOverlay";
import ModalProvider from "./components/surfaces/Modal";
import NotFoundPage from "./pages/NotFoundPage";

const BoardPage = lazy(async () => import("./pages/BoardPage"));

const themes = ["light", "dark"] as const;
type Theme = typeof themes[number];

let savedTheme = localStorage.getItem("theme") as Theme | null;
if (!savedTheme || !themes.includes(savedTheme))
    savedTheme = "dark";
const [theme, setTheme] = createSignal<Theme>(savedTheme ?? "dark");
createEffect(() => {
    if (themes.includes(theme()))
        localStorage.setItem("theme", theme());
    else
        setTheme("dark");
});

const queryClient = new QueryClient();

const App : Component = () => (
    <div class={`theme-${theme()}`}>
        <QueryClientProvider client={queryClient}>
            <Router base={import.meta.env.BASE_URL}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/b/:slug" element={<BoardPage />} />

                    <Route path="/auth/google" element={<AuthPage />} />
                    <Route path="/auth/github" element={<AuthPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Router>
            <LoadingOverlay />
            <ModalProvider />
            <Toaster
                position="bottom-center"
                gutter={8}
            />
        </QueryClientProvider>
    </div>
);

export default App;
export { themes, theme, setTheme };
