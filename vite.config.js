const { defineConfig } = require("vite");
const { viteStaticCopy } = require("vite-plugin-static-copy");

module.exports = defineConfig({
    plugins: [
        viteStaticCopy({
            targets: [
                { src: "js/*", dest: "js" }
            ]
        })
    ]
});
