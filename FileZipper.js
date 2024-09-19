const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const log = require("./Config").log;

const root = path.join(__dirname, "Images");
path.normalize(root);

async function ZipFile(ID) {
  return new Promise(async function (resolve, reject) {
    var filepath = path.join(root, ID);
    path.normalize(filepath);
    filepath += ".zip";
    const output = fs.createWriteStream(filepath);
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    output.on("close", function () {
      log.info(archive.pointer() + " total bytes");
      log.info("archiver has been finalized and the output file  has closed");
      resolve(filepath);
    });

    output.on("end", function () {
      log.info("data has been drained!");
    });

    archive.on("warning", function (err) {
      if (err.code === "ENOENT") {
        log.warn("warning while creating archive!");
        log.warn(err);
      } else {
        log.info("Error while creating archive!");
        log.error(err);
        reject(false);
        return;
      }
    });

    archive.on("error", function (err) {
      log.info("Error while creating archive!");
      log.info(err);
      reject(false);
      return;
    });

    archive.pipe(output);

    const file = path.join(root, ID);
    path.normalize(file);
    archive.directory(file, "images");

    archive.finalize();
  });
}

module.exports = {
  CreateZipFromUserID: async function (ID) {
    return new Promise(async function (resolve, reject) {
      await ZipFile(ID)
        .then((result) => {
          log.info("Created archive! Returning path: " + result);
          resolve(result);
        })
        .catch((err) => {
          log.error("Error creating archive! \n " + err + "\n");
          reject(false);
          return;
        });
    });
  },
};
