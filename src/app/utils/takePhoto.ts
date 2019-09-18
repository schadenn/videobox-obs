import * as Electron from "electron";
import * as fs from "fs";
import * as path from "path";
import { config } from "../videobox.config";

/**
 * This is a very hacky way of taking a photo. It just takes a screenshot and crops.
 * Depending on your devices screen resolution photos will be very low res.
 * A photo feature is currently being added to OBS natively. Use it when its available:
 * https://github.com/obsproject/obs-studio/pull/1269
 */

export const takePhoto = () =>
  new Promise<string>((resolve, reject) => {
    const {
      height: screenHeight,
      width: screenWidth,
    } = Electron.screen.getPrimaryDisplay().workAreaSize;
    const vsWrapper = document.getElementById("videoStreamWrapper");
    const appWrapper = document.getElementById("appWrapper");
    const vsRect = vsWrapper.getBoundingClientRect();
    const appRect = appWrapper.getBoundingClientRect();
    const x = Math.floor((vsRect.left / appRect.width) * screenWidth);
    const y = Math.floor((vsRect.top / appRect.height) * screenHeight);
    const width = Math.floor((vsRect.width / appRect.width) * screenWidth);
    const height = Math.floor((vsRect.height / appRect.height) * screenHeight);

    const fileName = `${Date.now()}.jpg`;
    setTimeout(() => {
      Electron.desktopCapturer.getSources(
        { types: ["screen"], thumbnailSize: { width: screenWidth, height: screenHeight } },
        (err, src) =>
          fs.writeFile(
            path.join(config.recordedFilesPath, fileName),
            src
              .find(s => s.name === "Entire screen")
              .thumbnail.crop({ x, y, width, height })
              .toJPEG(90),
            error => {
              if (error) {
                reject(error);
              } else {
                console.log("Photo taken");
                resolve(fileName);
              }
            },
          ),
      );
    }, 300);
  });
