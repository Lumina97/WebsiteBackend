const axios = require("axios");
const querystring = require("querystring");

const oAuthURL = "https://oauth.reddit.com";
const imagePostAmount = 100;
let Access_Token;

async function GetRedditPosts(subreddit) {
  console.log(
    `Getting posts from ${subreddit} - LinksGatherer.js - GetRedditPosts()`
  );

  const params = querystring.stringify({
    limit: imagePostAmount,
  });

  let urlink = oAuthURL + "/r/" + subreddit + "/new" + "?" + params;
  urlink = urlink.replace(/\s+/g, "");

  const config = {
    method: "get",
    url: urlink,
    headers: {
      Authorization: "BEARER " + Access_Token,
      "User-Agent":
        "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1",
    },
  };

  return axios(config)
    .then((result) => {
      const postArray = result.data.data.children;
      if (typeof postArray === undefined || postArray.length === 0) {
        console.log("Subreddit does not exist! - LinksGatherer.js");
        return "Error: Subreddit does not exist!";
      }

      const image_links = [];
      let amountOfImages = 0;

      let bHasAnyImageLinks = false;
      for (let post of postArray) {
        if (
          post.kind == "t3" &&
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
          console.log("URL: " + post.data.url);
          bHasAnyImageLinks = true;
          amountOfImages++;
        } else {
          console.log("Not an image post");
        }
      }

      if (bHasAnyImageLinks === false) {
        console.log(
          "No image links found! - LinksGatherer.js - GetRedditPosts()"
        );
        throw new Error("No images in specified search!");
      } else {
        console.log(
          "Found " +
            amountOfImages +
            " links! - LinksGatherer.js - GetRedditPosts()"
        );
        return image_links;
      }
    })
    .catch((err) => {
      console.log(`RedditLinksGatherer - Error - ${err}`);
      throw new Error(err);
    });
}

module.exports = {
  GetImageLinksFromSubreddit: async function (subreddit, access_token) {
    Access_Token = access_token;

    // validate input
    if (typeof subreddit === "undefined") {
      console.log(
        "Passed in subreddit was undefined! - DownloadImagesFromSubreddit() "
      );
      throw new Error("There's been an issue getting images.");
    }

    //wait to get links
    return GetRedditPosts(subreddit)
      .then((result) => {
        return result;
      })
      .catch(() => {
        throw new Error("There's been an issue getting images.");
      });
  },
};
