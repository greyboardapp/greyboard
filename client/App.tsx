import { Route, Router, Routes } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Component, createSignal, lazy } from "solid-js";

import "./App.scss";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import LoadingOverlay from "./components/app/LoadingOverlay";
import ModalProvider from "./components/surfaces/Modal";
import NotFoundPage from "./pages/NotFoundPage";

const BoardPage = lazy(async () => import("./pages/BoardPage"));

const [theme, setTheme] = createSignal("dark");

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
        </QueryClientProvider>
    </div>
);

export default App;
export { theme, setTheme };
