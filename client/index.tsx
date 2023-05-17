/* @refresh reload */
import { render } from "solid-js/web";

import "./utils/datatypes/array";
import "./utils/datatypes/map";

import App from "./App";

const root = document.getElementById("root");
if (root)
    render(() => <App />, root);
