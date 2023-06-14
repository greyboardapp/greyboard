/* @refresh reload */
import { render } from "solid-js/web";

import "./utils/datatypes/array";
import "./utils/datatypes/map";

import App from "./App";
import { loadFonts } from "./utils/system/fonts";

(async () => {
    await loadFonts();

    const root = document.getElementById("root");
    if (root)
        render(() => <App />, root);
})();
