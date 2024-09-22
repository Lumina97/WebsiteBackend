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
      console.log(archive.pointer() + " total bytes");
      console.log(
        "archiver has been finalized and the output file  has closed"
      );
      resolve(filepath);
    });

    output.on("end", function () {
      console.log("data has been drained!");
    });

    archive.on("warning", function (err) {
      if (err.code === "ENOENT") {
        console.log("warning while creating archive!");
        console.log(err);
      } else {
        console.log("Error while creating archive!");
        console.log(err);
        reject(false);
        return;
      }
    });

    archive.on("error", function (err) {
      console.log("Error while creating archive!");
      console.log(err);
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
          console.log("Created archive! Returning path: " + result);
          resolve(result);
        })
        .catch((err) => {
          console.log("Error creating archive! \n " + err + "\n");
          reject(false);
          return;
        });
    });
  },
};
