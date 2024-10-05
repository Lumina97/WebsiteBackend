import { expect, test, expectTypeOf } from "vitest";
import { GetImageLinksFromSubreddit } from "../RedditAPI/RedditLinksGatherer";

test("Get Image Links valid subreddit", async () => {
  const Links = await GetImageLinksFromSubreddit("wallpaper");

  expectTypeOf(Links).toMatchTypeOf<[]>;
});

test("Get Image Links empty subreddit", async () => {
  await expect(GetImageLinksFromSubreddit("")).rejects.toThrow(
    "Subreddit was either not defined or an empty string"
  );
});

test("Get Image Links invalid subreddit", async () => {
  await expect(
    GetImageLinksFromSubreddit("dsafgdhgfhgjkhlhggfhgffaS")
  ).rejects.toThrow("There has been an issue with the image request");
});
