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
exports.ImageGathererRouter = void 0;
const express_1 = require("express");
const Config_1 = __importDefault(require("../Config"));
const FileDownloader_1 = __importDefault(require("../FileDownloader"));
const RedditAPI_1 = __importDefault(require("../RedditAPI/RedditAPI"));
const ImageGathererRouter = (0, express_1.Router)();
exports.ImageGathererRouter = ImageGathererRouter;
var downloadRequestDict = {};
ImageGathererRouter.post("/api/downloadFilesFromLinks", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const links = request.body.links;
    yield FileDownloader_1.default.DownloadFilesFromLinksAndZip(links, request.session.id)
        .then((result) => {
        // @ts-ignore
        downloadRequestDict[request.session.id] = result;
        try {
            let data = JSON.stringify({ id: request.session.id });
            Config_1.default.info(`Returning data: ${request.session.id}`);
            response.json(data);
        }
        catch (error) {
            Config_1.default.error("ERROR:\n" + error);
        }
    })
        .catch((reason) => {
        response.status(400).send({ error: reason });
        Config_1.default.error(reason);
    });
}));
ImageGathererRouter.get("/api/download", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        Config_1.default.info("Download GET request");
        for (const [key, value] of Object.entries(downloadRequestDict)) {
            Config_1.default.info(key, value);
            if (key == request.session.id) {
                Config_1.default.info("Found request!");
                const path = value;
                Config_1.default.info(path);
                response.download(path, (err) => {
                    if (err) {
                        Config_1.default.error("Error occurred while downloading the file:", err);
                        response
                            .status(500)
                            .send("Error occurred while downloading the file");
                    }
                });
                delete downloadRequestDict[key];
            }
        }
    });
});
ImageGathererRouter.post("/api/ImageLoader", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = request.body;
        if (!data.subreddit) {
            Config_1.default.warn("Subreddit was empty!");
            response.json({ ERROR: "Subreddit was empty!" });
            return;
        }
        yield RedditAPI_1.default.GetAllImageLinks(data.subreddit)
            .then((result) => {
            let returnData;
            try {
                returnData = JSON.stringify({ links: result });
                response.json(returnData);
            }
            catch (error) {
                Config_1.default.warn("Error parsing json! \n" + error);
                throw new Error("There was an error getting your data!");
            }
        })
            .catch((error) => {
            Config_1.default.error(`${error} | index.js`);
            response.status(400).send();
        });
    });
});
//# sourceMappingURL=ImageGatherer.js.map