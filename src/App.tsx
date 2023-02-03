import { Route, Router, Routes } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Component, createSignal, lazy, Suspense } from "solid-js";

import "./App.scss";
import BoardLoading from "./components/app/BoardLoading";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";

const BoardPage = lazy(async () => import("./pages/BoardPage"));

const [theme, setTheme] = createSignal("dark");

const queryClient = new QueryClient();

const App : Component = () => (
    <div class={`theme-${theme()}`}>
        <QueryClientProvider client={queryClient}>
            <Router base={import.meta.env.BASE_URL}>
                <Suspense fallback={<BoardLoading />}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/b/:slug" element={<BoardPage />} />

                        <Route path="/auth/google" element={<AuthPage />} />
                        <Route path="/auth/github" element={<AuthPage />} />
                    </Routes>
                </Suspense>
            </Router>
        </QueryClientProvider>
    </div>
);

export default App;
export { theme, setTheme };
