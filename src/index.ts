import { ImageGathererRouter } from "./Routers/ImageGatherer";
import path from "path";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import { v4 as uuidv4 } from "uuid";
import compression from "compression";
import log from "./Config";
import cors from "cors";

const app = express();
const envPath = path.join(__dirname, "website.env");
dotenv.config({ path: envPath });
app.use(compression());
app.use(express.json({ limit: "1mb" }));

const oneDay = 1000 * 60 * 60 * 24;
const secretKey = process.env.SESSION_SECRET || "someRaNdOmSeCRet";

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors()); // Handle preflight requests

app.use(ImageGathererRouter);
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
