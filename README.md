# typescript-with-electron-react-kit

This repo is based on [typescript-with-electron-react-kit](https://github.com/skellock/typescript-with-electron-react-kit).

This is a photo-/videobox UI that remote controls OBS over Websocket plugin.
It is build using React and Electron. It also includes Onedrive API communication to upload each new photo/video to Onedrive.

This is highly customized towards my device and there is a lot of cleaning up to do :)

Add a `src/app/onedrive.secrets.ts` like:
```
export const oneDriveSecrets = {
    clientId: "xxx",
    secret: "xxx",
};
```