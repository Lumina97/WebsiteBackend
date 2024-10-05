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
exports.GetAllImageLinks = void 0;
const RedditLinksGatherer_1 = require("./RedditLinksGatherer");
const RedditAuthentication_1 = require("./RedditAuthentication");
const Logging_1 = __importDefault(require("../Logging"));
function GetAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield (0, RedditAuthentication_1.GetAuthenticationToken)();
                resolve(result);
            }
            catch (_a) {
                reject("Failed to get access token - RedditAPI.");
            }
        }));
    });
}
const GetAllImageLinks = (subreddit) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        let access_token;
        try {
            access_token = yield GetAccessToken();
        }
        catch (error) {
            Logging_1.default.error("RedditAPI - Error Getting access token!");
            reject("Error Getting access token!");
            return;
        }
        (0, RedditLinksGatherer_1.GetImageLinksFromSubreddit)(subreddit, access_token)
            .then((result) => {
            resolve(result);
        })
            .catch((error) => {
            Logging_1.default.error("RedditAPI - There was an error while gathering subreddit images!");
            reject(error);
        });
    }));
});
exports.GetAllImageLinks = GetAllImageLinks;
//# sourceMappingURL=RedditAPI.js.map