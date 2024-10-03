import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import log from "./Logging";
import { CreateZipFromUserID } from "./FileZipper";
import { v4 as uuidv4 } from "uuid";
import { imageFilePath } from "./globals";

const root = imageFilePath;
path.normalize(root);

//=====================FILE DOWNLOAD======================

async function DownloadFilesFromLinks(
  links: string[],
  ID: string
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    if (links) {
      log.info("Have image links");
      log.info("Starting download...");

      //======================DOWNLOAD FILES
      for (const link of links) {
        if (link.includes("https")) {
          log.info("Starting HTTPS Download...");
          await DownloadHTTPSFile(link, ID).catch((err) => {
            log.warn("Error downloading file, \t" + err);
          });
        } else if (link.includes("http")) {
          log.info("Starting HTTP Download...");
          await DownloadHTTPFile(link, ID).catch((err) => {
            log.warn("Error downloading file, \t" + err);
          });
        }
      }
      resolve(ID);
    } else {
      log.error(
        "Error with image links! - FileDownloader.ts - DownloadFilesFromLinks()"
      );
      reject(false);
    }
  });
}

async function CreateDirectory(destination: string): Promise<void> {
  return new Promise((resolve, reject) => {
    log.info("Checking file directory...");
    if (!fs.existsSync(destination)) {
      fs.mkdir(destination, { recursive: true }, (error) => {
        if (error) {
          log.error("Error creating directory! : " + error);
          reject(error);
        } else {
          log.info("Created directory: " + destination);
          resolve();
        }
      });
    } else {
      resolve(); // Resolve if the directory already exists
    }
  });
}

async function DownloadHTTPSFile(link: string, ID: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    log.info("HTTPS DOWNLOAD: " + link);
    const baseDest = path.join(root, ID);
    path.normalize(baseDest);

    const fileLocationArray = link.split("/");
    const fileLocation = fileLocationArray[fileLocationArray.length - 1];
    log.info("File location: " + fileLocation);

    await CreateDirectory(baseDest).catch((err) => {
      reject(err);
    });

    const dest = path.join(baseDest, fileLocation);
    path.normalize(dest);

    const req = https.get(link, (res) => {
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);

      // Handle fileStream write errors
      fileStream.on("error", (error) => {
        log.error("Error downloading file: ");
        log.error(error);
        reject();
      });

      // Done downloading
      fileStream.on("finish", () => {
        fileStream.close();
        log.info("Downloaded: " + fileLocation);
        resolve();
      });
    });

    // Handle HTTPS download errors
    req.on("error", (error) => {
      log.error("Error downloading file");
      log.error(error);
      reject();
    });
  });
}

async function DownloadHTTPFile(link: string, ID: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const baseDest = path.join(root, ID);
    path.normalize(baseDest);

    const fileLocationArray = link.split("/");
    const fileLocation = fileLocationArray[fileLocationArray.length - 1];

    const dest = path.join(baseDest, fileLocation);
    path.normalize(dest);

    await CreateDirectory(baseDest).catch((err) => {
      reject(err);
    });

    const req = http.get(link, (res) => {
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);

      // Handle fileStream write errors
      fileStream.on("error", (error) => {
        log.error("Error downloading file: ");
        log.error(error);
        reject();
      });

      // Done downloading
      fileStream.on("finish", () => {
        fileStream.close();
        log.info("Downloaded: " + fileLocation);
        resolve();
      });
    });

    // Handle HTTP download errors
    req.on("error", (error) => {
      log.error("Error downloading file");
      log.error(error);
      reject();
    });
  });
}

async function processFiles(fileLinks: string[], ID: string): Promise<string> {
  try {
    const downloadedFiles = await DownloadFilesFromLinks(fileLinks, ID);
    return CreateZipFromUserID(downloadedFiles);
  } catch (error) {
    throw error; // Or handle the error as needed
  }
}

export const DownloadFilesFromLinksAndZip = async (
  fileLinks: string[]
): Promise<string> => {
  const today = new Date();
  const date = `${today.getHours()}_${today.getMinutes()}_${today.getSeconds()}`;
  const ID = path.join(uuidv4(), String(date));
  return processFiles(fileLinks, ID);
};
