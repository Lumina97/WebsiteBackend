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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuthenticationToken = GetAuthenticationToken;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
const Logging_1 = __importDefault(require("../Logging"));
const basePath = path_1.default.resolve(__dirname, "../../");
const envPath = path_1.default.join(basePath, "website.env");
dotenv_1.default.config({ path: envPath });
const Refresh_Token = process.env.REFRESH_TOKEN;
let LastTokenRefreshTime;
let Access_Token;
function RefreshAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = querystring_1.default.stringify({
            grant_type: "refresh_token",
            refresh_token: Refresh_Token,
        });
        try {
            Logging_1.default.info(`Requesting access token with refresh token: ${Refresh_Token}`);
            const result = yield axios_1.default.post("https://www.reddit.com/api/v1/access_token", payload, {
                headers: {
                    Authorization: "Basic " +
                        Buffer.from("ZHmLbNUoaVSVdw" + ":" + "W0bNZeU8oYaUxCzqcWuf89JLMnqMVg", "utf8").toString("base64"),
                    "User-Agent": "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": String(payload.length),
                },
            });
            const res_Data = result.data;
            if (res_Data.error) {
                Logging_1.default.error("Unable to receive Bearer token: " + res_Data.error);
                throw new Error(res_Data.error);
            }
            else {
                Access_Token = res_Data.access_token;
                LastTokenRefreshTime = Date.now();
                return res_Data;
            }
        }
        catch (err) {
            Logging_1.default.error("Error requesting access token:");
            Logging_1.default.error(err);
            throw new Error(String(err));
        }
    });
}
function GetAuthenticationToken() {
    return __awaiter(this, void 0, void 0, function* () {
        Logging_1.default.info(`current access_token ${Access_Token}`);
        if (typeof Access_Token === "undefined" ||
            CheckAccessTokenTimeLimitReached()) {
            try {
                yield RefreshAccessToken();
                return Access_Token;
            }
            catch (error) {
                Logging_1.default.error("There was an error refreshing the token! - RedditAuthentication.ts");
                Logging_1.default.error(error);
                throw new Error("Failed to refresh token");
            }
        }
        else {
            return Access_Token;
        }
    });
}
function CheckAccessTokenTimeLimitReached() {
    if (typeof LastTokenRefreshTime === "undefined") {
        Logging_1.default.info("Last token time is undefined! - CheckAccessTokenTimeLimitReached()");
        return false;
    }
    const timePassed = Date.now() - LastTokenRefreshTime;
    const tokenTime = new Date(LastTokenRefreshTime);
    tokenTime.setHours(tokenTime.getHours() + 1);
    if (timePassed > tokenTime.getTime()) {
        Logging_1.default.info("New token required!");
        return true;
    }
    else {
        Logging_1.default.info("Token is still viable!");
        return false;
    }
}
//# sourceMappingURL=RedditAuthentication.js.map