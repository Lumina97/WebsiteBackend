"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logDirectory = path_1.default.join(__dirname, "Log");
const logFilePath = path_1.default.join(logDirectory, "app.log");
// Create the log directory if it does not exist
if (!fs_1.default.existsSync(logDirectory)) {
    fs_1.default.mkdirSync(logDirectory);
}
const transport = pino_1.default.transport({
    targets: [
        {
            level: "trace",
            target: "pino/file",
            options: {
                destination: logFilePath,
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