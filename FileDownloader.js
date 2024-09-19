const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
const log = require("./Config").log;
const FileZipper = require("./FileZipper");

const root = path.join(__dirname, "Images");
path.normalize(root);

//=====================FILE DOWNLOAD======================

async function DownloadFilesFromLinks(links, ID) {
  return new Promise(async function (resolve, reject) {
    if (typeof links !== "undefined") {
      log.info("have image links");
      log.info("Starting download...");

      //======================DOWNLOAD FILES
      for (let i = 0; i < links.length; i++) {
        if (links[i].includes("https")) {
          log.info("Starting HTTPS Download...");
          await DownloadHTTPSFile(links[i], ID).catch((err) => {
            log.warn();
            "Error downloading file, \t" + err;
            links[i] = null;
          });
        } else if (links[i].includes("http")) {
          log.info("Starting HTTP Download...");
          await DownloadHTTPFile(links[i], ID).catch((err) => {
            log.warn("Error downloading file, \t" + err);
            links[i] = null;
          });
        }
      }
      resolve(ID);
    } else {
      log.error(
        "Error With image links! - FileDownloader.js - DownloadFilesFromLinks()"
      );
      reject(false);
      return;
    }
  });
}

async function CreateDirectory(Destination) {
  return new Promise(async function (resolve, reject) {
    log.info("Checking file directory...");
    if (fs.existsSync(Destination) == false) {
      await fs.mkdir(Destination, { recursive: true }, (error) => {
        if (error) {
          log.error("error creating directory! : " + error);
          reject(error);
        } else resolve();
        log.info("Created directory: " + Destination);
      });
    }
  });
}

async function DownloadHTTPSFile(link, ID) {
  return new Promise(async function (resolve, reject) {
    log.info("HTTPS DOWNLOAD: " + link);
    const baseDest = path.join(root, ID);
    path.normalize(baseDest);

    const fileLocationArray = link.split("/");
    const fileLocation = fileLocationArray[fileLocationArray.length - 1];
    log.info("file location: " + fileLocation);
    CreateDirectory(baseDest).catch((err) => {
      reject(err);
    });

    let dest = path.join(baseDest, fileLocation);
    path.normalize(dest);

    const req = https.get(link, function (res) {
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);

      //handle filestream write errors
      fileStream.on("error", function (error) {
        log.error("Error downloading file: ");
        log.error(error);
        reject();
        return;
      });

      // done downloading
      fileStream.on("finish", function () {
        fileStream.close();
        log.info("Downloaded: " + fileLocation);
        resolve();
        return;
      });
    });
    //handle https download errors
    req.on("error", function (error) {
      log.error("Error downloading file");
      log.error(error);
      reject();
      return;
    });
  });
}

async function DownloadHTTPFile(link, ID) {
  return new Promise(async function (resolve, reject) {
    const baseDest = path.join(root, ID, SubRedditToScan);
    path.normalize(baseDest);

    const fileLocationArray = link.split("/");
    const fileLocation = fileLocationArray[fileLocationArray.length - 1];

    let dest = path.join(baseDest, fileLocation);
    path.normalize(dest);
    CreateDirectory(baseDest).catch((err) => {
      reject(err);
    });

    const req = http.get(link, function (res) {
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);

      //handle fileStream write errors
      fileStream.on("error", function (error) {
        log.error("Error downloading file: ");
        log.error(error);
        reject();
      });

      // done downloading
      fileStream.on("finish", function () {
        fileStream.close();
        log.info("Downloaded: " + fileLocation);
        resolve();
      });
    });
    //handle https download errors
    req.on("error", function (error) {
      log.error("Error downloading file");
      log.error(error);
      reject();
    });
  });
}

async function processFiles(fileLinks, ID) {
  try {
    const downloadedFiles = await DownloadFilesFromLinks(fileLinks, ID);
    const zipResult = await FileZipper.CreateZipFromUserID(downloadedFiles);
    return zipResult;
  } catch (error) {
    throw error; // Or handle the error as needed
  }
}

module.exports = {
  DownloadFilesFromLinksAndZip: async function (fileLinks, userID) {
    var today = new Date();
    var date =
      today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const ID = path.join(String(userID), String(date));
    return new Promise(async function (resolve, reject) {
      await processFiles(fileLinks, ID)
        .then((result) => resolve(result))
        .catch((err) => {
          if (err) log.error("Error downloading file! :" + err);
          reject(false);
        });
    });
  },
};
