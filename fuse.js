import { rollup } from "rollup";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import path from "path";
import fse from "fs-extra";
import {spawn} from "child_process"

const DEV_PORT = 4445;
const OUTPUT_DIR = "out";
const ASSETS = ["*.jpg", "*.png", "*.jpeg", "*.gif", "*.svg", "*.mp4"];
const external = [
  "zlib",
  "crypto",
  "http",
  "path",
  "fs",
  "child_process",
  "net",
  "tls",
  "events",
  "stream",
  "module",
  "assert",
  "tty",
  "util",
  "constants",
  "https",
  "url",
  "os",
  "string_decoder",
  "punycode",
  "net",
  "buffer",
  "cls-bluebird",
  "querystring",
];
const plugins = [
  json(),
  commonjs({
    namedExports: {
      electron: ["shell", "ipcMain", "app", "Menu", "dialog", "webFrame"],
      "electron-updater": ["autoUpdater"],
      "electron-log": ["info", "error"],
      react: ["cloneElement", "createContext", "Component", "createElement", "useCallback"],
      "react-dom": ["render"],
      "react-is": ["isElement", "isValidElementType", "ForwardRef"],
    },
  }),
  resolve({
    preferBuiltins: true,
    extensions: [".mjs", ".js", ".jsx", ".json", ".ts", ".tsx"],
  }),
  babel({
    presets: ["@babel/preset-typescript"],
    plugins: [
      "@babel/plugin-transform-react-jsx",
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-object-rest-spread",
    ],
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  }),
];

// are we running in production mode?
const isProduction = process.env.NODE_ENV === "production";

// Sparky.task("copy-html", () => {
//   return Sparky.src("src/app/index.html").dest(`${OUTPUT_DIR}/$name`)
// })

const bundle = async (input, name) =>
  rollup({
    input,
    onwarn: () => {},
    external,
    plugins,
  }).then(bundle =>
    bundle.write({
      file: path.join(OUTPUT_DIR, `${name}.js`),
      format: "cjs",
    }),
  );

const logError = err => console.log(err);

const build = async () =>
  Promise.all([
    fse.outputFile("src/app/index.html", path.join(OUTPUT_DIR, "index.html")),
    bundle("src/app/main.ts", "main").catch(logError),
    bundle("src/app/index.tsx", "renderer").catch(logError),
  ]);

const run = async () => {
  await fse.emptyDir(OUTPUT_DIR);
  await build();
  spawn("node", [`${__dirname}/node_modules/electron/cli.js`, __dirname], {
    stdio: "inherit",
  }).on("exit", code => {
    console.log(`electron process exited with code ${code}`);
    process.exit(code);
  });
};

run();

// Sparky.task("default", ["copy-html"], () => {
//   // setup the producer with common settings
//   const fuse = FuseBox.init({
//     homeDir: "src",
//     output: `${OUTPUT_DIR}/$name.js`,
//     target: "electron",
//     log: isProduction,
//     cache: !isProduction,
//     sourceMaps: true,
//     tsConfig: "tsconfig.json",
//   })
//
//   // start the hot reload server
//   if (!isProduction) {
//     fuse.dev({ port: DEV_PORT, httpServer: false })
//   }
//
//   // bundle the electron main code
//   const mainBundle = fuse
//     .bundle("main")
//     .target("server")
//     .instructions("> [app/main.ts]")
//     // inject in some configuration
//     .plugin(
//       ReplacePlugin(),
//     )
//
//   // and watch unless we're bundling for production
//   if (!isProduction) {
//     mainBundle.watch()
//   }
//
//   // bundle the electron renderer code
//   const rendererBundle = fuse
//     .bundle("renderer")
//     .instructions("> [app/index.tsx] +fuse-box-css")
//     .plugin(CSSPlugin())
//     .plugin(CopyPlugin({ useDefault: false, files: ASSETS, dest: "assets", resolve: "assets/" }))
//
//   // and watch & hot reload unless we're bundling for production
//   if (!isProduction) {
//     rendererBundle.watch()
//     rendererBundle.hmr()
//   }
//
//   // when we are finished bundling...
//   return fuse.run().then(() => {
//     if (!isProduction) {
//       // startup electron
//       spawn("node", [`${__dirname}/node_modules/electron/cli.js`, __dirname], {
//         stdio: "inherit",
//       }).on("exit", code => {
//         console.log(`electron process exited with code ${code}`)
//         process.exit(code)
//       })
//     }
//   })
// })
