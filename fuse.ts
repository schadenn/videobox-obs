import { FuseBox, CSSPlugin, Sparky, CopyPlugin, ReplacePlugin } from "fuse-box";
import { spawn } from "child_process";
import * as pjson from "./package.json";
import * as fs from "fs";
import * as path from "path";

const DEV_PORT = 4445;
const OUTPUT_DIR = "out";
const SRC_DIR = "src";
const ASSETS = ["*.jpg", "*.png", "*.jpeg", "*.gif", "*.svg"];

// are we running in production mode?
const isProduction = process.env.NODE_ENV === "production";

// copy the renderer's html file into the right place
Sparky.task("copy-html", () => {
  return Sparky.src("src/app/index.html").dest(`${OUTPUT_DIR}/$name`);
});

// the default task
Sparky.task("default", ["copy-html"], async () => {
  // setup the producer with common settings
  const fuse = FuseBox.init({
    homeDir: SRC_DIR,
    output: `${OUTPUT_DIR}/$name.js`,
    target: "electron",
    log: isProduction,
    cache: !isProduction,
    sourceMaps: true,
    tsConfig: "tsconfig.json",
  });

  // start the hot reload server
  if (!isProduction) {
    fuse.dev({ port: DEV_PORT, httpServer: false });
  }

  // bundle the electron main code
  const mainBundle = fuse
    .bundle("main")
    .target("server")
    .instructions("> [app/main.ts]")
    // inject in some configuration
    .plugin(
      ReplacePlugin({
        "process.env.HOMEPAGE": pjson.homepage ? `"${pjson.homepage}"` : "null",
      }),
    );

  // and watch unless we're bundling for production
  if (!isProduction) {
    mainBundle.watch();
  }

  // bundle the electron renderer code
  const rendererBundle = fuse
    .bundle("renderer")
    .instructions("> [app/index.tsx] +fuse-box-css")
    .plugin(CSSPlugin());

  const getAllFilesFromDir = async dir => {
    const files = await fs.promises.readdir(dir);
    files.map(file => {
      return (await fs.promises.stat(dir + file)).isDirectory()
        ? getAllFilesFromDir(path.join(dir, file, "/"))
        : file;
    });
  };

  // and watch & hot reload unless we're bundling for production
  if (!isProduction) {
    rendererBundle.watch();
    rendererBundle.hmr();
  }

  // when we are finished bundling...
  return fuse.run().then(() => {
    if (!isProduction) {
      // startup electron
      spawn("node", [`${__dirname}/node_modules/electron/cli.js`, __dirname], {
        stdio: "inherit",
      }).on("exit", code => {
        console.log(`electron process exited with code ${code}`);
        process.exit(code);
      });
    }
  });
});
