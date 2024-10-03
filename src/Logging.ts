import pino from "pino";
import path from "path";
import { mkdirSync, existsSync } from "fs";

export type TLogType = {
  level: string;
  time: number;
  pid: number;
  hostname: string;
  msg: string;
};

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

const rootDirectory = path.join(__dirname, "..");
const baseDirectory = path.join(rootDirectory, "Log");
const todayDirectory = path.join(baseDirectory, getFormattedDate());
const hourDirectory = path.join(todayDirectory, getFormattedHour());
export let currentLogFile = hourDirectory + ".log";

if (!existsSync(todayDirectory)) {
  mkdirSync(todayDirectory, { recursive: true });
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
log.info(`Logging to ${currentLogFile}`);

export default log;
