import { Route, Router, Routes } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Component, createSignal, lazy, Suspense } from "solid-js";

import "./App.scss";
import RouteLoading from "./components/app/RouteLoading";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";

const BoardPage = lazy(async () => import("./pages/BoardPage"));

const [theme, setTheme] = createSignal("dark");

const queryClient = new QueryClient();

const App : Component = () => (
    <div class={`theme-${theme()}`}>
        <QueryClientProvider client={queryClient}>
            <Router base={import.meta.env.BASE_URL}>
                <Suspense fallback={<RouteLoading />}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/sign-in" element={<SignInPage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/b/:slug" element={<BoardPage />} />
                    </Routes>
                </Suspense>
            </Router>
        </QueryClientProvider>
    </div>
);

export default App;
export { theme, setTheme };
