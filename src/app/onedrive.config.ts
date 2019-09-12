export const oneDriveConfig = {
    scopes:
        "offline_access openid https://graph.microsoft.com/user.read https://graph.microsoft.com/files.readwrite",
    redirectUri: "http://localhost/auth",
    authUri: "https://login.live.com/oauth20_authorize.srf",
    tokenUri: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    response_type: "code",
    response_mode: "query",
    scope:
        "offline_access openid https://graph.microsoft.com/user.read https://graph.microsoft.com/files.readwrite",
};