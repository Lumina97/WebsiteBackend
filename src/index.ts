import { ImageGathererRouter } from "./Routers/ImageGatherer";
import { AdminRoute } from "./Routers/Admin";
import express from "express";
import compression from "compression";
import log from "./Logging";
import cors from "cors";

const app = express();

app.use(compression());
app.use(express.json());

app.use(cors());
app.options("*", cors());
app.use(
  cors({
    origin: "https://www.eriknivala.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

setInterval(() => {
  log.info("Health check");
}, 60000);

app.use(ImageGathererRouter);
app.use(AdminRoute);

const port = process.env.PORT || 10000;
app.listen(port, () => log.info("listening on " + port));
