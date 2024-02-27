import * as esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["src/index.tsx"],
    bundle: true,
    minify: true,
    sourcemap: false,
    outfile: "output/index.js",
    alias: {
        "react": "preact/compat",
        "react-dom": "preact/compat"
    },
});