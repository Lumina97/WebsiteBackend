import { GetImageLinksFromSubreddit } from "./RedditLinksGatherer";
import { GetAuthenticationToken } from "./RedditAuthentication";
import log from "../Config";

async function GetAccessToken(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await GetAuthenticationToken();
      resolve(result);
    } catch {
      reject("Failed to get access token - RedditAPI.");
    }
  });
}

export const GetAllImageLinks = async (
  subreddit: string
): Promise<string[] | [string, string][]> => {
  return new Promise(async (resolve, reject) => {
    let access_token: string;
    try {
      access_token = await GetAccessToken();
    } catch (error) {
      log.error("RedditAPI - Error Getting access token!");
      reject("Error Getting access token!");
      return;
    }

    GetImageLinksFromSubreddit(subreddit, access_token)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        log.error(
          "RedditAPI - There was an error while gathering subreddit images!"
        );
        reject(error);
      });
  });
};
