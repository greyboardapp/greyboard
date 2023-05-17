import {createRoot} from "solid-js";
import {insert, template, createComponent} from "solid-js/web";

import "./style.scss";

export const decorators = [
	((Story) => (
		createRoot(() => {
			const container = template(`<div class="sb-theme-container"/>`).cloneNode(true);
			const lightThemed = template(`<div class="sb-theme-column theme-light"/>`).cloneNode(true);
			insert(lightThemed, createComponent(Story, {}));
			const darkThemed = template(`<div class="sb-theme-column theme-dark"/>`).cloneNode(true);
			insert(darkThemed, createComponent(Story, {}));
			insert(container, lightThemed);
			insert(container, darkThemed);
			return container;
		})
	)),
];

export const parameters = {
	actions: { argTypesRegex:"^on[A-Z].*" },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
};
