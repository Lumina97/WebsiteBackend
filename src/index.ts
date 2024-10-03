import { ImageGathererRouter } from "./Routers/ImageGatherer";
import { AdminRoute } from "./Routers/Admin";
import path from "path";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import { v4 as uuidv4 } from "uuid";
import compression from "compression";
import log from "./Logging";
import cors from "cors";

const app = express();
const envPath = path.join(__dirname, "website.env");
dotenv.config({ path: envPath });
app.use(compression());
app.use(express.json());

const oneDay = 1000 * 60 * 60 * 24;
const secretKey = process.env.SESSION_SECRET || "someRaNdOmSeCRet";

app.use(cors());
app.options("*", cors()); // Handle preflight requests
// Add this before your route definitions
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET"],
  })
);

app.use(ImageGathererRouter);
app.use(AdminRoute);
app.use(
  session({
    name: "SessionCookie",
    genid: () => {
      log.info("session id created");
      return uuidv4();
    },
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    store: new session.MemoryStore(),
    cookie: { secure: false, maxAge: oneDay },
  })
);

const port = 3000;
app.listen(port, () => log.info("listening on " + port));
