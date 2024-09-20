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
  GetAllImageLinks: async function (subreddit) {
    return new Promise(async function (resolve, reject) {
      let access_token;
      try {
        const result = await GetAccessToken();
        access_token = result;
      } catch (error) {
        console.log("RedditAPI - Error Getting access token!");
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
          console.log(
            "RedditAPI -  There was an error while gathering subreddit images!"
          );
          console.log(err);
          reject(err);
        });
    });
  },
};
