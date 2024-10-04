import path from "path";
import dotenv from "dotenv";
import axios, { AxiosResponse } from "axios";
import querystring from "querystring";
import log from "../Logging";

const basePath = path.resolve(__dirname, "../../");
const envPath = path.join(basePath, "website.env");
dotenv.config({ path: envPath });

const Refresh_Token: string | undefined = process.env.REFRESH_TOKEN;
let LastTokenRefreshTime: number | undefined;
let Access_Token: string | undefined;

async function RefreshAccessToken(): Promise<any> {
  const payload = querystring.stringify({
    grant_type: "refresh_token",
    refresh_token: Refresh_Token,
  });

  try {
    log.info(`Requesting access token with refresh token: ${Refresh_Token}`);
    const result: AxiosResponse = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      payload,
      {
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
          "Content-Length": String(payload.length),
        },
      }
    );

    const res_Data = result.data;

    if (res_Data.error) {
      log.error("Unable to receive Bearer token: " + res_Data.error);
      throw new Error(res_Data.error);
    } else {
      Access_Token = res_Data.access_token;
      LastTokenRefreshTime = Date.now();

      return res_Data;
    }
  } catch (err) {
    log.error("Error requesting access token:\n" + err);
    throw new Error(String(err));
  }
}

export async function GetAuthenticationToken(): Promise<string> {
  if (
    typeof Access_Token === "undefined" ||
    CheckAccessTokenTimeLimitReached()
  ) {
    try {
      await RefreshAccessToken();
      return Access_Token as string;
    } catch {
      log.error(
        "There was an error refreshing the token! - RedditAuthentication.ts"
      );
      throw new Error("Failed to refresh token");
    }
  } else {
    return Access_Token as string;
  }
}

function CheckAccessTokenTimeLimitReached(): boolean {
  if (typeof LastTokenRefreshTime === "undefined") {
    log.info(
      "Last token time is undefined! - CheckAccessTokenTimeLimitReached()"
    );
    return false;
  }

  const timePassed = Date.now() - LastTokenRefreshTime;
  const tokenTime = new Date(LastTokenRefreshTime);
  tokenTime.setHours(tokenTime.getHours() + 1);

  if (timePassed > tokenTime.getTime()) {
    log.info("New token required!");
    return true;
  } else {
    log.info("Token is still viable!");
    return false;
  }
}
