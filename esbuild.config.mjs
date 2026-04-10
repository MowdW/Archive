import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const prod = (process.argv[2] === "production");

esbuild.build({
    banner: {
        js: '/* eslint-disable */',
    },
    entryPoints: ["src/obsidian/main.ts"],
    bundle: true,
    external: [
        "obsidian",
        "electron",
        "@codemirror/autocomplete",
        "@codemirror/collab",
        "@codemirror/commands",
        "@codemirror/language",
        "@codemirror/lint",
        "@codemirror/search",
        "@codemirror/state",
        "@codemirror/view",
        "@lezer/common",
        "@lezer/highlight",
        "@lezer/lr",
        ...builtins],
    format: "cjs",
    target: "es2018",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    outfile: "main.js",
    define: {
        'process.env.NODE_ENV': prod ? '"production"' : '"development"',
    }
}).catch(() => process.exit(1));
