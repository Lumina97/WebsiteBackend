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
exports.CreateZipFromUserID = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const archiver_1 = __importDefault(require("archiver"));
const Config_1 = __importDefault(require("./Config")); // Ensure `log` is properly typed in Config
const root = path_1.default.join(__dirname, "Images");
path_1.default.normalize(root);
function ZipFile(ID) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const filepath = path_1.default.join(root, ID) + ".zip";
            const output = fs_1.default.createWriteStream(filepath);
            const archive = archiver_1.default.create("zip", {
                zlib: { level: 9 },
            });
            output.on("close", () => {
                Config_1.default.info(archive.pointer() + " total bytes");
                Config_1.default.info("Archiver has been finalized and the output file has closed");
                resolve(filepath);
            });
            output.on("end", () => {
                Config_1.default.info("Data has been drained!");
            });
            archive.on("warning", (err) => {
                if (err.code === "ENOENT") {
                    Config_1.default.warn("Warning while creating archive!");
                    Config_1.default.warn(err);
                }
                else {
                    Config_1.default.error("Error while creating archive!");
                    Config_1.default.error(err);
                    reject(err);
                }
            });
            archive.on("error", (err) => {
                Config_1.default.error("Error while creating archive!");
                Config_1.default.error(err);
                reject(err);
            });
            archive.pipe(output);
            const file = path_1.default.join(root, ID);
            archive.directory(file, "images");
            archive.finalize();
        });
    });
}
const CreateZipFromUserID = (ID) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield ZipFile(ID);
            Config_1.default.info("Created archive! Returning path: " + result);
            resolve(result);
        }
        catch (err) {
            Config_1.default.error("Error creating archive! \n " + err + "\n");
            reject(err);
        }
    }));
});
exports.CreateZipFromUserID = CreateZipFromUserID;
//# sourceMappingURL=FileZipper.js.map