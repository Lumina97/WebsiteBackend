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
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const log = require("./Config").log;
const root = path.join(__dirname, "Images");
path.normalize(root);
function ZipFile(ID) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                var filepath = path.join(root, ID);
                path.normalize(filepath);
                filepath += ".zip";
                const output = fs.createWriteStream(filepath);
                const archive = archiver("zip", {
                    zlib: { level: 9 },
                });
                output.on("close", function () {
                    log.info(archive.pointer() + " total bytes");
                    log.info("archiver has been finalized and the output file  has closed");
                    resolve(filepath);
                });
                output.on("end", function () {
                    log.info("data has been drained!");
                });
                archive.on("warning", function (err) {
                    if (err.code === "ENOENT") {
                        log.warn("warning while creating archive!");
                        log.warn(err);
                    }
                    else {
                        log.info("Error while creating archive!");
                        log.error(err);
                        reject(false);
                        return;
                    }
                });
                archive.on("error", function (err) {
                    log.info("Error while creating archive!");
                    log.info(err);
                    reject(false);
                    return;
                });
                archive.pipe(output);
                const file = path.join(root, ID);
                path.normalize(file);
                archive.directory(file, "images");
                archive.finalize();
            });
        });
    });
}
module.exports = {
    CreateZipFromUserID: function (ID) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(function (resolve, reject) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield ZipFile(ID)
                        .then((result) => {
                        log.info("Created archive! Returning path: " + result);
                        resolve(result);
                    })
                        .catch((err) => {
                        log.error("Error creating archive! \n " + err + "\n");
                        reject(false);
                        return;
                    });
                });
            });
        });
    },
};
//# sourceMappingURL=FileZipper.js.map