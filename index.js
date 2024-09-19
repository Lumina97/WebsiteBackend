const path = require("path");
const envPath = path.join(__dirname, "website.env");
require("dotenv").config({ path: envPath });

const express = require("express");
const session = require("express-session");
const RedditAPI = require("./RedditAPI/RedditAPI");
const FileDownloader = require("./FileDownloader");
const { v4: uuidv4 } = require("uuid");
const compression = require("compression");
const log = require("./Config").log;
const app = express();

app.use(compression());
app.use(express.json({ limit: "1mb" }));

const oneDay = 1000 * 60 * 60 * 24;
const secretKey = process.env.SESSION_SECRET;
var downloadRequestDict = {};

app.use(express.static(path.join(__dirname, "../frontend/dist")));

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
    store: new session.MemoryStore({
      checkPeriod: 86400000,
    }),
    cookie: { secure: false, maxAge: oneDay },
  })
);

// #region ImageGatherer
app.post("/api/downloadFilesFromLinks", async (request, response) => {
  checkRequestUserID(request);

  const links = request.body.links;

  await FileDownloader.DownloadFilesFromLinksAndZip(
    links,
    request.session.userid
  )
    .then((result) => {
      downloadRequestDict[request.session.userid] = result;
      try {
        let data = JSON.stringify({ id: request.session.userid });
        log.info(`Returning data: ${request.session.userid}`);
        response.json(data);
      } catch (error) {
        log.error("ERROR:\n" + error);
      }
    })
    .catch((reason) => {
      response.status(400).send({ error: reason });
      log.error(reason);
    });
});

app.get("/api/download", async function (request, response) {
  log.info("Download GET request");
  for (const [key, value] of Object.entries(downloadRequestDict)) {
    log.info(key, value);
    if (key == request.session.userid) {
      log.info("Found request!");
      const path = value;
      log.info(path);
      response.download(path, (err) => {
        if (err) {
          log.error("Error occurred while downloading the file:", err);
          response
            .status(500)
            .send("Error occurred while downloading the file");
        }
      });
      delete downloadRequestDict[key];
    }
  }
});

app.post("/api/ImageLoader", async function (request, response) {
  checkRequestUserID(request);

  const data = request.body;
  if (data.subreddit === false) {
    log.warn("Subreddit was empty!");
    response.json({ ERROR: "Subreddit was empty!" });
    return;
  }

  await RedditAPI.GetAllImageLinks(data.subreddit, session)
    .then((result) => {
      let returnData;
      try {
        returnData = JSON.stringify({ links: result });
        response.json(returnData);
        return;
      } catch (error) {
        log.warn("Error parsing json! \n" + error);
        response.json({ error: "There was an error getting your data!" });
        return;
      }
    })
    .catch((error) => {
      log.error(`${error} | index.js`);
      response.status(400).send();
      return;
    });
});
//#endregion

const checkRequestUserID = (request) => {
  request.session.userid || (request.session.userid = uuidv4());
};

app.use((req, res, next) => {
  if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
    next();
  } else {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html")); // React index.html
  }
});

const port = 3000;
app.listen(port, () => log.info("listening on " + port));
