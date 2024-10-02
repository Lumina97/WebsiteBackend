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
exports.GetImageLinksFromSubreddit = void 0;
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
const Config_1 = __importDefault(require("../Config"));
const oAuthURL = "https://oauth.reddit.com";
const imagePostAmount = 100;
let Access_Token;
function GetRedditPosts(subreddit) {
    return __awaiter(this, void 0, void 0, function* () {
        Config_1.default.info(`Getting posts from ${subreddit} - LinksGatherer.ts - GetRedditPosts()`);
        const params = querystring_1.default.stringify({
            limit: imagePostAmount,
        });
        const urlink = `${oAuthURL}/r/${subreddit}/new?${params}`.replace(/\s+/g, "");
        const config = {
            method: "get",
            url: urlink,
            headers: {
                Authorization: "Bearer " + Access_Token,
                "User-Agent": "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1",
            },
        };
        try {
            const result = yield (0, axios_1.default)(config);
            const postArray = result.data.data.children;
            if (!postArray || postArray.length === 0) {
                Config_1.default.error("Subreddit does not exist! - LinksGatherer.ts");
                throw new Error("Subreddit does not exist!");
            }
            const image_links = [];
            let amountOfImages = 0;
            let bHasAnyImageLinks = false;
            for (let post of postArray) {
                if (post.kind === "t3" &&
                    (post.data.url.includes(".jpg") ||
                        post.data.url.includes(".png") ||
                        post.data.url.includes(".jpeg"))) {
                    let thumbnail = "";
                    if (post.data.preview) {
                        const resolutions = post.data.preview.images[0].resolutions;
                        if (resolutions.length > 0) {
                            thumbnail = resolutions[2].url.replace(/&amp;/g, "&");
                        }
                    }
                    image_links.push([thumbnail, post.data.url]);
                    Config_1.default.info("URL: " + post.data.url);
                    bHasAnyImageLinks = true;
                    amountOfImages++;
                }
                else {
                    Config_1.default.info("Not an image post");
                }
            }
            if (!bHasAnyImageLinks) {
                Config_1.default.error("No image links found! - LinksGatherer.ts - GetRedditPosts()");
                throw new Error("No images in specified search!");
            }
            else {
                Config_1.default.info("Found " +
                    amountOfImages +
                    " links! - LinksGatherer.ts - GetRedditPosts()");
                return image_links;
            }
        }
        catch (err) {
            Config_1.default.error(`RedditLinksGatherer - Error - ${err}`);
            throw new Error(String(err));
        }
    });
}
const GetImageLinksFromSubreddit = function (subreddit, access_token) {
    return __awaiter(this, void 0, void 0, function* () {
        Access_Token = access_token;
        // validate input
        if (typeof subreddit === "undefined") {
            Config_1.default.error("Passed in subreddit was undefined! - DownloadImagesFromSubreddit() ");
            throw new Error("There's been an issue getting images.");
        }
        //wait to get links
        try {
            return GetRedditPosts(subreddit);
        }
        catch (_a) {
            throw new Error("There's been an issue getting images.");
        }
    });
};
exports.GetImageLinksFromSubreddit = GetImageLinksFromSubreddit;
//# sourceMappingURL=RedditLinksGatherer.js.map