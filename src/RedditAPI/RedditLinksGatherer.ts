import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import log from "../Logging";

async function GetRedditPosts(subreddit: string): Promise<[string, string][]> {
  log.info(
    `Getting posts from ${subreddit} - LinksGatherer.ts - GetRedditPosts()`
  );

  const link = `https://www.reddit.com/r/${subreddit}/new/.json`;

  const config: AxiosRequestConfig = {
    method: "get",
    url: link,
    // headers: {
    //   "User-Agent":
    //     "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1",
    // },
  };

  try {
    const result: AxiosResponse = await axios(config)
      .then((result) => result)
      .catch((error) => {
        if (error.response) {
          log.error(error.response.data);
        }
        throw new Error("There was an issue with the reddit request");
      });
    const postArray = result.data.data.children;

    if (!postArray || postArray.length === 0) {
      log.error("Subreddit does not exist! - LinksGatherer.ts");
      throw new Error("Subreddit does not exist!");
    }

    const image_links: [string, string][] = [];
    let amountOfImages = 0;
    let bHasAnyImageLinks = false;

    for (let post of postArray) {
      if (
        post.kind === "t3" &&
        (post.data.url.includes(".jpg") ||
          post.data.url.includes(".png") ||
          post.data.url.includes(".jpeg"))
      ) {
        let thumbnail = "";
        if (post.data.preview) {
          const resolutions = post.data.preview.images[0].resolutions;
          if (resolutions.length > 0) {
            thumbnail = resolutions[2].url.replace(/&amp;/g, "&");
          }
        }

        image_links.push([thumbnail, post.data.url]);
        log.info("URL: " + post.data.url);
        bHasAnyImageLinks = true;
        amountOfImages++;
      } else {
        log.info("Not an image post");
      }
    }

    if (!bHasAnyImageLinks) {
      log.error("No image links found! - LinksGatherer.ts - GetRedditPosts()");
      throw new Error("No images in specified search!");
    } else {
      log.info(
        "Found " +
          amountOfImages +
          " links! - LinksGatherer.ts - GetRedditPosts()"
      );
      return image_links;
    }
  } catch (err) {
    log.error(`RedditLinksGatherer - Error - ${err}`);
    throw new Error(`There has been an issue with the image request`);
  }
}

export const GetImageLinksFromSubreddit = async function (
  subreddit: string
): Promise<[string, string][]> {
  // validate input
  if (typeof subreddit === "undefined" || subreddit === "") {
    log.error(
      "Passed in subreddit was undefined! - DownloadImagesFromSubreddit() "
    );
    throw new Error("Subreddit was either not defined or an empty string");
  }

  //wait to get links
  try {
    return GetRedditPosts(subreddit);
  } catch {
    throw new Error("There's been an issue getting images.");
  }
};
