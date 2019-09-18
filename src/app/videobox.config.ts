export type TScreenNames = "splash" | "app" | "confirmation" | "thankyou";

export interface IConfig {
  recordingCountdown: number;
  photoReviewTime: number;
  videoDurations: number[];
  obsWebsocketPw: string;
  recordedFilesPath: string;
  onedrive: {
    scopes: string;
    redirectUri: string;
    authUri: string;
    tokenUri: string;
    response_type: string;
    response_mode: string;
    scope: string;
  };
  screens: {
    name: TScreenNames;
    show: boolean;
    landing?: boolean;
    goto: {
      next: TScreenNames;
      prev?: TScreenNames;
    };
  }[];
}

export const config: IConfig = {
  recordingCountdown: 6,
  photoReviewTime: 8,
  videoDurations: [10, 30, 60],
  obsWebsocketPw: "ichbins",
  recordedFilesPath: "C:/obsrec",
  onedrive: {
    scopes:
      "offline_access openid https://graph.microsoft.com/user.read https://graph.microsoft.com/files.readwrite",
    redirectUri: "http://localhost/auth",
    authUri: "https://login.live.com/oauth20_authorize.srf",
    tokenUri: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    response_type: "code",
    response_mode: "query",
    scope:
      "offline_access openid https://graph.microsoft.com/user.read https://graph.microsoft.com/files.readwrite",
  },
  screens: [
    {
      name: "splash",
      landing: true,
      show: true,
      goto: { next: "app" },
    },
    {
      name: "app",
      show: true,
      goto: { next: "confirmation" },
    },
    {
      name: "confirmation",
      show: true,
      goto: { next: "thankyou", prev: "app" },
    },
    {
      name: "thankyou",
      show: true,
      goto: { next: "splash" },
    },
  ],
};
