import { CreateQueryResult } from "@tanstack/solid-query";
import { JSX, Match, Switch } from "solid-js";
import { ApiResponse } from "../../api/api";

interface ApiSuspenseProps<T> {
    query : CreateQueryResult<ApiResponse<T>>;
    loadingFallback ?: JSX.Element;
    errorFallback ?: (error : string) => JSX.Element;
    children : (data : T) => JSX.Element;
}

export default function ApiSuspense<T>(props : ApiSuspenseProps<T>) : JSX.Element {
    return (
        <Switch>
            <Match when={props.query.isLoading}>{props.loadingFallback}</Match>
            <Match when={props.query.data?.error} keyed>{(error : string) => props.errorFallback && props.errorFallback(error)}</Match>
            <Match when={props.query.data?.result} keyed>{(data : T) => props.children(data)}</Match>
        </Switch>
    );
}
