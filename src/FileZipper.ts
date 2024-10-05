import fs from "fs";
import path from "path";
import archiver from "archiver";
import log from "./Logging";
import { imageFilePath } from "./globals";

const root = imageFilePath;
path.normalize(root);

async function ZipFile(ID: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const filepath = path.join(root, ID) + ".zip";
    const output = fs.createWriteStream(filepath);
    const archive = archiver.create("zip", {
      zlib: { level: 9 },
    });

    output.on("close", () => {
      log.info(archive.pointer() + " total bytes");
      log.info("Archiver has been finalized and the output file has closed");
      resolve(filepath);
    });

    output.on("end", () => {
      log.info("Data has been drained!");
    });

    archive.on("warning", (err: any) => {
      if (err.code === "ENOENT") {
        log.warn("Warning while creating archive!");
        log.warn(err);
      } else {
        log.error("Error while creating archive!");
        log.error(err);
        reject(err);
      }
    });

    archive.on("error", (err: Error) => {
      log.error("Error while creating archive!");
      log.error(err);
      reject(err);
    });

    archive.pipe(output);

    const file = path.join(root, ID);
    archive.directory(file, "images");

    archive.finalize();
  });
}

export const CreateZipFromUserID = async (ID: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await ZipFile(ID);
      log.info("Created archive! Returning path: " + result);
      resolve(result);
    } catch (err) {
      log.error("Error creating archive! \n " + err + "\n");
      reject(err);
    }
  });
};
