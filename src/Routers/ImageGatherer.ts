import { Router } from "express";
import log from "../Config";
import FileDownloader from "../FileDownloader";
import RedditAPI from "../RedditAPI/RedditAPI";

const ImageGathererRouter = Router();
var downloadRequestDict: { [key: string]: string } = {};

ImageGathererRouter.post(
  "/api/downloadFilesFromLinks",
  async (request, response) => {
    const links = request.body.links;

    await FileDownloader.DownloadFilesFromLinksAndZip(links, request.session.id)
      .then((result) => {
        // @ts-ignore
        downloadRequestDict[request.session.id] = result;
        try {
          let data = JSON.stringify({ id: request.session.id });
          log.info(`Returning data: ${request.session.id}`);
          response.json(data);
        } catch (error) {
          log.error("ERROR:\n" + error);
        }
      })
      .catch((reason) => {
        response.status(400).send({ error: reason });
        log.error(reason);
      });
  }
);

ImageGathererRouter.get("/api/download", async function (request, response) {
  log.info("Download GET request");
  for (const [key, value] of Object.entries(downloadRequestDict)) {
    log.info(key, value);
    if (key == request.session.id) {
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

ImageGathererRouter.post(
  "/api/ImageLoader",
  async function (request, response) {
    const data = request.body;
    if (!data.subreddit) {
      log.warn("Subreddit was empty!");
      response.json({ ERROR: "Subreddit was empty!" });
      return;
    }

    await RedditAPI.GetAllImageLinks(data.subreddit)
      .then((result) => {
        let returnData;
        try {
          returnData = JSON.stringify({ links: result });
          response.json(returnData);
        } catch (error) {
          log.warn("Error parsing json! \n" + error);
          throw new Error("There was an error getting your data!");
        }
      })
      .catch((error) => {
        log.error(`${error} | imageGatherer.js`);
        response.status(400).send();
      });
  }
);

export { ImageGathererRouter };
