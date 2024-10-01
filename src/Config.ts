import pino from "pino";
import path from "path";
import fs from "fs";

function getFormattedDate(): string {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getFormattedHour(): string {
  const currentHour = new Date().getHours();
  return String(currentHour).padStart(2, "0");
}

const rootDirectory = path.resolve(__dirname, "..");
const baseDirectory = path.join(rootDirectory, "Log");
const todayDirectory = path.join(baseDirectory, getFormattedDate());
const hourDirectory = path.join(todayDirectory, getFormattedHour());
export let currentLogFile = hourDirectory + ".log";

if (!fs.existsSync(todayDirectory)) {
  fs.mkdirSync(todayDirectory, { recursive: true });
}

const transport = pino.transport({
  targets: [
    {
      level: "trace",
      target: "pino/file",
      options: {
        destination: currentLogFile,
      },
    },
    {
      level: "trace",
      target: "pino-pretty",
      options: {},
    },
  ],
});

// Create the Pino logger with pretty-printing for console
const log = pino(transport);

export default log;
