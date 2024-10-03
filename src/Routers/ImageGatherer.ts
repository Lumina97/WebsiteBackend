import { Router } from "express";
import log from "../Logging";
import { DownloadFilesFromLinksAndZip } from "../FileDownloader";
import { GetAllImageLinks } from "../RedditAPI/RedditAPI";

const ImageGathererRouter = Router();

ImageGathererRouter.post(
  "/api/downloadFilesFromLinks",
  async (request, response) => {
    const links = request.body.links;

    await DownloadFilesFromLinksAndZip(links)
      .then((result) => {
        if (result === undefined)
          throw new Error("FileDownload returned with an error");
        try {
          let data = JSON.stringify({ path: result });
          log.info(`Returning data: ${data}`);
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

ImageGathererRouter.post("/api/download", async function (request, response) {
  const { path } = request.body;
  log.info(path);
  response.status(200).download(path, (err) => {
    if (err) {
      log.error("Error occurred while downloading the file:", err);
      response.status(500).send("Error occurred while downloading the file");
    } else {
      log.info("download completed!");
    }
  });
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

    await GetAllImageLinks(data.subreddit)
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
        log.error(`${error} | imageGatherer.ts`);
        response.status(400).send();
      });
  }
);

export { ImageGathererRouter };
