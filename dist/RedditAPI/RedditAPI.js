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
const RedditLinksGatherer = require("./RedditLinksGatherer");
const RedditAuthentication = require("./RedditAuthentication");
const log = require("../Config").log;
function GetAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                yield RedditAuthentication.GetAutheticationToken()
                    .then((result) => {
                    resolve(result);
                })
                    .catch(() => {
                    reject("Failed to get access token - RedditAPI.");
                });
            });
        });
    });
}
module.exports = {
    GetAllImageLinks: function (subreddit) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(function (resolve, reject) {
                return __awaiter(this, void 0, void 0, function* () {
                    let access_token;
                    try {
                        const result = yield GetAccessToken();
                        access_token = result;
                    }
                    catch (error) {
                        reject("Error Getting access token!");
                        return;
                    }
                    yield RedditLinksGatherer.GetImageLinksFromSubreddit(subreddit, access_token)
                        .then((result) => {
                        resolve(result);
                    })
                        .catch((err) => {
                        log.warn("There was an error while gathering subreddit images!");
                        log.warn(err);
                        return reject(err);
                    });
                });
            });
        });
    },
};
//# sourceMappingURL=RedditAPI.js.map