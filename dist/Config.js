"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentLogFile = void 0;
const pino_1 = __importDefault(require("pino"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function getFormattedDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function getFormattedHour() {
    const currentHour = new Date().getHours();
    return String(currentHour).padStart(2, "0");
}
const rootDirectory = path_1.default.resolve(__dirname, "..");
const baseDirectory = path_1.default.join(rootDirectory, "Log");
const todayDirectory = path_1.default.join(baseDirectory, getFormattedDate());
const hourDirectory = path_1.default.join(todayDirectory, getFormattedHour());
exports.currentLogFile = hourDirectory + ".log";
if (!fs_1.default.existsSync(todayDirectory)) {
    fs_1.default.mkdirSync(todayDirectory, { recursive: true });
}
const transport = pino_1.default.transport({
    targets: [
        {
            level: "trace",
            target: "pino/file",
            options: {
                destination: exports.currentLogFile,
            },
        },
        {
            level: "trace",
            target: "pino-pretty",
            options: {},
        },
    ],
});
// Create the Pino logger with pretty-printing for console
const log = (0, pino_1.default)(transport);
exports.default = log;
//# sourceMappingURL=Config.js.map