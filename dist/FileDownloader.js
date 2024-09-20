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
const fs = require("fs");
const https = require("https");
const http = require("http");
const log = require("./Config").log;
const FileZipper = require("./FileZipper");
const root = path.join(__dirname, "Images");
path.normalize(root);
//=====================FILE DOWNLOAD======================
function DownloadFilesFromLinks(links, ID) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                if (typeof links !== "undefined") {
                    log.info("have image links");
                    log.info("Starting download...");
                    //======================DOWNLOAD FILES
                    for (let i = 0; i < links.length; i++) {
                        if (links[i].includes("https")) {
                            log.info("Starting HTTPS Download...");
                            yield DownloadHTTPSFile(links[i], ID).catch((err) => {
                                log.warn();
                                "Error downloading file, \t" + err;
                                links[i] = null;
                            });
                        }
                        else if (links[i].includes("http")) {
                            log.info("Starting HTTP Download...");
                            yield DownloadHTTPFile(links[i], ID).catch((err) => {
                                log.warn("Error downloading file, \t" + err);
                                links[i] = null;
                            });
                        }
                    }
                    resolve(ID);
                }
                else {
                    log.error("Error With image links! - FileDownloader.js - DownloadFilesFromLinks()");
                    reject(false);
                    return;
                }
            });
        });
    });
}
function CreateDirectory(Destination) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                log.info("Checking file directory...");
                if (fs.existsSync(Destination) == false) {
                    yield fs.mkdir(Destination, { recursive: true }, (error) => {
                        if (error) {
                            log.error("error creating directory! : " + error);
                            reject(error);
                        }
                        else
                            resolve();
                        log.info("Created directory: " + Destination);
                    });
                }
            });
        });
    });
}
function DownloadHTTPSFile(link, ID) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                log.info("HTTPS DOWNLOAD: " + link);
                const baseDest = path.join(root, ID);
                path.normalize(baseDest);
                const fileLocationArray = link.split("/");
                const fileLocation = fileLocationArray[fileLocationArray.length - 1];
                log.info("file location: " + fileLocation);
                CreateDirectory(baseDest).catch((err) => {
                    reject(err);
                });
                let dest = path.join(baseDest, fileLocation);
                path.normalize(dest);
                const req = https.get(link, function (res) {
                    const fileStream = fs.createWriteStream(dest);
                    res.pipe(fileStream);
                    //handle filestream write errors
                    fileStream.on("error", function (error) {
                        log.error("Error downloading file: ");
                        log.error(error);
                        reject();
                        return;
                    });
                    // done downloading
                    fileStream.on("finish", function () {
                        fileStream.close();
                        log.info("Downloaded: " + fileLocation);
                        resolve();
                        return;
                    });
                });
                //handle https download errors
                req.on("error", function (error) {
                    log.error("Error downloading file");
                    log.error(error);
                    reject();
                    return;
                });
            });
        });
    });
}
function DownloadHTTPFile(link, ID) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                const baseDest = path.join(root, ID, SubRedditToScan);
                path.normalize(baseDest);
                const fileLocationArray = link.split("/");
                const fileLocation = fileLocationArray[fileLocationArray.length - 1];
                let dest = path.join(baseDest, fileLocation);
                path.normalize(dest);
                CreateDirectory(baseDest).catch((err) => {
                    reject(err);
                });
                const req = http.get(link, function (res) {
                    const fileStream = fs.createWriteStream(dest);
                    res.pipe(fileStream);
                    //handle fileStream write errors
                    fileStream.on("error", function (error) {
                        log.error("Error downloading file: ");
                        log.error(error);
                        reject();
                    });
                    // done downloading
                    fileStream.on("finish", function () {
                        fileStream.close();
                        log.info("Downloaded: " + fileLocation);
                        resolve();
                    });
                });
                //handle https download errors
                req.on("error", function (error) {
                    log.error("Error downloading file");
                    log.error(error);
                    reject();
                });
            });
        });
    });
}
function processFiles(fileLinks, ID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const downloadedFiles = yield DownloadFilesFromLinks(fileLinks, ID);
            const zipResult = yield FileZipper.CreateZipFromUserID(downloadedFiles);
            return zipResult;
        }
        catch (error) {
            throw error; // Or handle the error as needed
        }
    });
}
module.exports = {
    DownloadFilesFromLinksAndZip: function (fileLinks, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            var today = new Date();
            var date = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
            const ID = path.join(String(userID), String(date));
            return new Promise(function (resolve, reject) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield processFiles(fileLinks, ID)
                        .then((result) => resolve(result))
                        .catch((err) => {
                        if (err)
                            log.error("Error downloading file! :" + err);
                        reject(false);
                    });
                });
            });
        });
    },
};
//# sourceMappingURL=FileDownloader.js.map