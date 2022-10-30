const solidPlugin = require("vite-plugin-solid");
const solidSvg = require("vite-plugin-solid-svg");

module.exports = {
    core: {
        builder: "@storybook/builder-vite"
    },
    framework: "@storybook/html",
    stories: ["../src/**/*.stories.tsx"],
    addons: ["@storybook/addon-links", "@storybook/addon-essentials", '@storybook/addon-a11y'],
    async viteFinal(config, { configType }) {
        config.plugins.unshift(
            solidPlugin({
                hot: false
            }),
            solidSvg({
                defaultExport: "component",
            }),
        );
        return config;
    }
};