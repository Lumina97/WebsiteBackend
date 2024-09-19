const path = require("path");
const envPath = path.join(__dirname, "website.env");
require("dotenv").config({ path: envPath });
const axios = require("axios").default;
const log = require("../Config").log;

const querystring = require("querystring");

let LastTokenRefreshTime;
let Refresh_Token;
let Access_Token;

async function RefreshAccessToken() {
  return new Promise(async function (resolve, reject) {
    const payload = querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: Refresh_Token,
    });

    const response = await axios
      .post("https://www.reddit.com/api/v1/access_token", payload, {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              "ZHmLbNUoaVSVdw" + ":" + "W0bNZeU8oYaUxCzqcWuf89JLMnqMVg",
              "utf8"
            ).toString("base64"),
          "User-Agent":
            "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1",
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": payload.length,
        },
      })
      .catch((err) => {
        log.error("Error requesting access token:\n" + err);
        reject(false);
        return;
      });

    try {
      const res_Data = response.data;

      if (res_Data.error) {
        log.fatal("Unable to receive Bearer token: " + res_Data.error);
        reject(false);
        return;
      } else {
        Refresh_Token = res_Data.refresh_token;
        Access_Token = res_Data.access_token;
        LastTokenRefreshTime = Date.now();

        resolve(res_Data);
        return;
      }
    } catch {}
    reject(false);
  });
}

async function RefreshToken() {
  return new Promise(async function (resolve, reject) {
    Refresh_Token = process.env.REFRESH_TOKEN;
    await RefreshAccessToken()
      .then(function () {
        resolve(true);
        return;
      })
      .catch(() => {
        log.fatal("Could not Refresh Token! - RedditAPI.js - RefreshToken()");
        reject(false);
        return;
      });
  });
}

async function GetAuthenticationToken() {
  return new Promise(async function (resolve, reject) {
    if (
      typeof Access_Token === "undefined" ||
      CheckAccessTokenTimeLimitReached()
    ) {
      await RefreshToken()
        .then(() => {
          resolve(Access_Token);
          return;
        })
        .catch(() => {
          log.fatal(
            "There was an error refreshing the token! - RedditAuthentication.js"
          );
          reject(false);
          return;
        });
    } else {
      resolve(Access_Token);
      return;
    }
  });
}

function CheckAccessTokenTimeLimitReached() {
  if (typeof LastTokenRefreshTime === "undefined") {
    log.info(
      "last token time is undefined! -  CheckAccessTokenTimeLimitReached()"
    );
    return false;
  }

  let timePassed = Date.now() - LastTokenRefreshTime;
  let tokenTime = new Date(LastTokenRefreshTime);
  tokenTime.setHours(tokenTime.getHours() + 1);

  if (timePassed > tokenTime) {
    log.info("new token required!");
    return true;
  } else {
    log.info("token is still viable!");
    return false;
  }
}

module.exports = {
  GetAutheticationToken: GetAuthenticationToken,
};
