import * as esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["src/index.tsx"],
    bundle: true,
    minify: false,
    sourcemap: true,
    outfile: "output/index.js",
    alias: {
        "react": "preact/compat",
        "react-dom": "preact/compat"
    },
});