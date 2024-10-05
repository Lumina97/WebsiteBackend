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
exports.DownloadFilesFromLinksAndZip = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const Logging_1 = __importDefault(require("./Logging"));
const FileZipper_1 = require("./FileZipper");
const uuid_1 = require("uuid");
const globals_1 = require("./globals");
const root = globals_1.imageFilePath;
path_1.default.normalize(root);
//=====================FILE DOWNLOAD======================
function DownloadFilesFromLinks(links, ID) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (links) {
                Logging_1.default.info("Have image links");
                Logging_1.default.info("Starting download...");
                //======================DOWNLOAD FILES
                for (const link of links) {
                    if (link.includes("https")) {
                        Logging_1.default.info("Starting HTTPS Download...");
                        yield DownloadHTTPSFile(link, ID).catch((err) => {
                            Logging_1.default.warn("Error downloading file, \t" + err);
                        });
                    }
                    else if (link.includes("http")) {
                        Logging_1.default.info("Starting HTTP Download...");
                        yield DownloadHTTPFile(link, ID).catch((err) => {
                            Logging_1.default.warn("Error downloading file, \t" + err);
                        });
                    }
                }
                resolve(ID);
            }
            else {
                Logging_1.default.error("Error with image links! - FileDownloader.ts - DownloadFilesFromLinks()");
                reject(false);
            }
        }));
    });
}
function CreateDirectory(destination) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            Logging_1.default.info("Checking file directory...");
            if (!fs_1.default.existsSync(destination)) {
                fs_1.default.mkdir(destination, { recursive: true }, (error) => {
                    if (error) {
                        Logging_1.default.error("Error creating directory! : " + error);
                        reject(error);
                    }
                    else {
                        Logging_1.default.info("Created directory: " + destination);
                        resolve();
                    }
                });
            }
            else {
                resolve(); // Resolve if the directory already exists
            }
        });
    });
}
function DownloadHTTPSFile(link, ID) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            Logging_1.default.info("HTTPS DOWNLOAD: " + link);
            const baseDest = path_1.default.join(root, ID);
            path_1.default.normalize(baseDest);
            const fileLocationArray = link.split("/");
            const fileLocation = fileLocationArray[fileLocationArray.length - 1];
            Logging_1.default.info("File location: " + fileLocation);
            yield CreateDirectory(baseDest).catch((err) => {
                reject(err);
            });
            const dest = path_1.default.join(baseDest, fileLocation);
            path_1.default.normalize(dest);
            const req = https_1.default.get(link, (res) => {
                const fileStream = fs_1.default.createWriteStream(dest);
                res.pipe(fileStream);
                // Handle fileStream write errors
                fileStream.on("error", (error) => {
                    Logging_1.default.error("Error downloading file: ");
                    Logging_1.default.error(error);
                    reject();
                });
                // Done downloading
                fileStream.on("finish", () => {
                    fileStream.close();
                    Logging_1.default.info("Downloaded: " + fileLocation);
                    resolve();
                });
            });
            // Handle HTTPS download errors
            req.on("error", (error) => {
                Logging_1.default.error("Error downloading file");
                Logging_1.default.error(error);
                reject();
            });
        }));
    });
}
function DownloadHTTPFile(link, ID) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const baseDest = path_1.default.join(root, ID);
            path_1.default.normalize(baseDest);
            const fileLocationArray = link.split("/");
            const fileLocation = fileLocationArray[fileLocationArray.length - 1];
            const dest = path_1.default.join(baseDest, fileLocation);
            path_1.default.normalize(dest);
            yield CreateDirectory(baseDest).catch((err) => {
                reject(err);
            });
            const req = http_1.default.get(link, (res) => {
                const fileStream = fs_1.default.createWriteStream(dest);
                res.pipe(fileStream);
                // Handle fileStream write errors
                fileStream.on("error", (error) => {
                    Logging_1.default.error("Error downloading file: ");
                    Logging_1.default.error(error);
                    reject();
                });
                // Done downloading
                fileStream.on("finish", () => {
                    fileStream.close();
                    Logging_1.default.info("Downloaded: " + fileLocation);
                    resolve();
                });
            });
            // Handle HTTP download errors
            req.on("error", (error) => {
                Logging_1.default.error("Error downloading file");
                Logging_1.default.error(error);
                reject();
            });
        }));
    });
}
function processFiles(fileLinks, ID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const downloadedFiles = yield DownloadFilesFromLinks(fileLinks, ID);
            return (0, FileZipper_1.CreateZipFromUserID)(downloadedFiles);
        }
        catch (error) {
            throw error; // Or handle the error as needed
        }
    });
}
const DownloadFilesFromLinksAndZip = (fileLinks) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const date = `${today.getHours()}_${today.getMinutes()}_${today.getSeconds()}`;
    const ID = path_1.default.join((0, uuid_1.v4)(), String(date));
    return processFiles(fileLinks, ID);
});
exports.DownloadFilesFromLinksAndZip = DownloadFilesFromLinksAndZip;
//# sourceMappingURL=FileDownloader.js.map