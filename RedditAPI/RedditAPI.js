const RedditLinksGatherer = require("./RedditLinksGatherer");
const RedditAuthentication = require("./RedditAuthentication");
const log = require("../Config").log;

async function GetAccessToken() {
  return new Promise(async function (resolve, reject) {
    await RedditAuthentication.GetAutheticationToken()
      .then((result) => {
        resolve(result);
      })
      .catch(() => {
        reject("Failed to get access token - RedditAPI.");
      });
  });
}

module.exports = {
  GetAllImageLinks: async function (subreddit, session) {
    return new Promise(async function (resolve, reject) {
      if (session === undefined) {
        reject("Session was invalid");
        return;
      }
      SubRedditToScan = subreddit;

      let access_token;
      try {
        const result = await GetAccessToken();
        access_token = result;
      } catch (error) {
        reject("Error Getting access token!");
        return;
      }

      await RedditLinksGatherer.GetImageLinksFromSubreddit(
        subreddit,
        access_token
      )
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          log.warn("There was an error while gathering subreddit images!");
          log.warn(err);
          reject(err);
          return;
        });
    });
  },
};
