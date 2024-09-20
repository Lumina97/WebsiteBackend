"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const path = require("path");
const basePath = path.resolve(__dirname, "../../");
const envPath = path.join(basePath, "website.env");
require("dotenv").config({ path: envPath });
const axios = require("axios").default;
const querystring = require("querystring");
const Refresh_Token = process.env.REFRESH_TOKEN;
let LastTokenRefreshTime;
let Access_Token;
function RefreshAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = querystring.stringify({
            grant_type: "refresh_token",
            refresh_token: Refresh_Token,
        });
        return axios
            .post("https://www.reddit.com/api/v1/access_token", payload, {
            headers: {
                Authorization: "Basic " +
                    Buffer.from("ZHmLbNUoaVSVdw" + ":" + "W0bNZeU8oYaUxCzqcWuf89JLMnqMVg", "utf8").toString("base64"),
                "User-Agent": "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1",
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": payload.length,
            },
        })
            .then((result) => {
            const res_Data = result.data;
            if (res_Data.error) {
                console.log("Unable to receive Bearer token: " + res_Data.error);
                throw new Error(res_Data.error);
            }
            else {
                Access_Token = res_Data.access_token;
                LastTokenRefreshTime = Date.now();
                return res_Data;
            }
        })
            .catch((err) => {
            console.log("Error requesting access token:\n" + err);
            throw new Error(err);
        });
    });
}
function GetAuthenticationToken() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                if (typeof Access_Token === "undefined" ||
                    CheckAccessTokenTimeLimitReached()) {
                    yield RefreshAccessToken()
                        .then(() => {
                        resolve(Access_Token);
                        return;
                    })
                        .catch(() => {
                        console.log("There was an error refreshing the token! - RedditAuthentication.js");
                        reject(false);
                        return;
                    });
                }
                else {
                    resolve(Access_Token);
                    return;
                }
            });
        });
    });
}
function CheckAccessTokenTimeLimitReached() {
    if (typeof LastTokenRefreshTime === "undefined") {
        console.log("last token time is undefined! -  CheckAccessTokenTimeLimitReached()");
        return false;
    }
    let timePassed = Date.now() - LastTokenRefreshTime;
    let tokenTime = new Date(LastTokenRefreshTime);
    tokenTime.setHours(tokenTime.getHours() + 1);
    if (timePassed > tokenTime) {
        console.log("new token required!");
        return true;
    }
    else {
        console.log("token is still viable!");
        return false;
    }
}
module.exports = {
    GetAutheticationToken: GetAuthenticationToken,
};
//# sourceMappingURL=RedditAuthentication.js.map