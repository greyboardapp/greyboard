import { useLocation, useNavigate, useSearchParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { Component, createEffect, createSignal, Show } from "solid-js";
import { ApiResponse } from "../api/api";
import { handleGoogleAuthCallback, handleGithubAuthCallback } from "../api/auth";
import { hideLoadingOverlay, showLoadingOverlay } from "../components/app/LoadingOverlay";
import { User } from "../core/data/user";
import { setUser } from "../utils/system/auth";
import { ObjectRecord } from "../utils/system/misc";

const AuthPage : Component = () => {
    const authType = useLocation().pathname.split("/").last();
    const [result] = useSearchParams<ObjectRecord<{ code : string }>>();
    const navigate = useNavigate();
    const [error, setError] = createSignal<string | null>(null);

    const authQuery = createQuery(() => ["auth"], async () => {
        showLoadingOverlay("texts.signingIn");
        switch (authType) {
            case "google":
                return handleGoogleAuthCallback(result.code);
            case "github":
                return handleGithubAuthCallback(result.code);
            default:
                return { status: 500, error: "Invalid authentication type" } as ApiResponse<User>;
        }
    }, { refetchOnWindowFocus: false, enabled: !!result && !!result.code });

    createEffect(() => {
        if (!authQuery.isSuccess)
            return;

        if (authQuery.data.result) {
            setUser(authQuery.data.result);
            navigate("/dashboard", { replace: true });
        } else {
            setUser(null);
            setError(authQuery.data.error ?? "Unknown error");
        }

        hideLoadingOverlay();
    });

    return (
        <Show when={error() !== null}>
            <p>{error()}</p>
        </Show>
    );
};
export default AuthPage;
