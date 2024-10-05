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
const Logging_1 = __importDefault(require("../Logging"));
const FileDownloader_1 = require("../FileDownloader");
const RedditAPI_1 = require("../RedditAPI/RedditAPI");
const ImageGathererRouter = (0, express_1.Router)();
exports.ImageGathererRouter = ImageGathererRouter;
ImageGathererRouter.post("/api/downloadFilesFromLinks", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const links = request.body.links;
    yield (0, FileDownloader_1.DownloadFilesFromLinksAndZip)(links)
        .then((result) => {
        if (result === undefined)
            throw new Error("FileDownload returned with an error");
        try {
            let data = JSON.stringify({ path: result });
            Logging_1.default.info(`Returning data: ${data}`);
            response.json(data);
        }
        catch (error) {
            Logging_1.default.error("ERROR:\n" + error);
        }
    })
        .catch((reason) => {
        response.status(400).send({ error: reason });
        Logging_1.default.error(reason);
    });
}));
ImageGathererRouter.post("/api/download", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const { path } = request.body;
        Logging_1.default.info(path);
        response.status(200).download(path, (err) => {
            if (err) {
                Logging_1.default.error("Error occurred while downloading the file:", err);
                response.status(500).send("Error occurred while downloading the file");
            }
            else {
                Logging_1.default.info("download completed!");
            }
        });
    });
});
ImageGathererRouter.post("/api/ImageLoader", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = request.body;
        if (!data.subreddit) {
            Logging_1.default.warn("Subreddit was empty!");
            response.json({ ERROR: "Subreddit was empty!" });
            return;
        }
        yield (0, RedditAPI_1.GetAllImageLinks)(data.subreddit)
            .then((result) => {
            let returnData;
            try {
                returnData = JSON.stringify({ links: result });
                response.json(returnData);
            }
            catch (error) {
                Logging_1.default.warn("Error parsing json! \n" + error);
                throw new Error("There was an error getting your data!");
            }
        })
            .catch((error) => {
            Logging_1.default.error(`${error} | imageGatherer.ts`);
            response.status(400).send();
        });
    });
});
//# sourceMappingURL=ImageGatherer.js.map