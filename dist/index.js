"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ImageGatherer_1 = require("./Routers/ImageGatherer");
const Admin_1 = require("./Routers/Admin");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const uuid_1 = require("uuid");
const compression_1 = __importDefault(require("compression"));
const Config_1 = __importDefault(require("./Config"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const envPath = path_1.default.join(__dirname, "website.env");
dotenv_1.default.config({ path: envPath });
app.use((0, compression_1.default)());
app.use(express_1.default.json());
const oneDay = 1000 * 60 * 60 * 24;
const secretKey = process.env.SESSION_SECRET || "someRaNdOmSeCRet";
app.use((0, cors_1.default)());
app.options("*", (0, cors_1.default)()); // Handle preflight requests
// Add this before your route definitions
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET"],
}));
app.use(ImageGatherer_1.ImageGathererRouter);
app.use(Admin_1.AdminRoute);
app.use((0, express_session_1.default)({
    name: "SessionCookie",
    genid: () => {
        Config_1.default.info("session id created");
        return (0, uuid_1.v4)();
    },
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    store: new express_session_1.default.MemoryStore(),
    cookie: { secure: false, maxAge: oneDay },
}));
const port = 3000;
app.listen(port, () => Config_1.default.info("listening on " + port));
//# sourceMappingURL=index.js.map