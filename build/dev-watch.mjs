import * as esbuild from "esbuild";

const context = await esbuild.context({
    entryPoints: ["src/index.tsx"],
    bundle: true,
    minify: false,
    sourcemap: true,
    outfile: "output/index.js",
    alias: {
        "react": "preact/compat",
        "react-dom": "preact/compat"
    }
});

await context.watch();