import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const run = async () => {
    const outputDir = path.join(__dirname, "/../output");
    const srcDir = path.join(__dirname, "/../src");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const files = fs.readdirSync(outputDir);
    await Promise.all(files.map(file => {
        return fs.promises.unlink(path.join(outputDir, file));
    }));
    fs.copyFileSync(path.join(srcDir, "index.html"), path.join(outputDir, "index.html"));
    return esbuild.build({
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
};

run().catch((error) => {console.error(error); process.exit(1)});
