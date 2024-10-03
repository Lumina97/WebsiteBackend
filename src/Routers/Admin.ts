import { Router, Request, Response, response } from "express";
import fs from "fs";
import { currentLogFile, TLogType } from "../Logging";

const AdminRoute = Router();
let lastSentLogEntry: TLogType;

const getNewLogs = (logData: string) => {
  const newLogs: string[] = [];
  const logLines = logData.trim().split("\n");
  if (!lastSentLogEntry) lastSentLogEntry = JSON.parse(logLines[0]);

  const logJson = logLines.map((line) => JSON.parse(line));
  const newestLog = logJson[logJson.length - 1];

  if (newestLog !== lastSentLogEntry) {
    let temp = newestLog;
    let index = 1;
    while (
      temp.time > lastSentLogEntry.time &&
      logJson.length - 1 > index &&
      newestLog !== lastSentLogEntry
    ) {
      newLogs.push(logLines[logLines.length - index]);
      index++;
      temp = logJson[logJson.length - index];
    }
    lastSentLogEntry = newestLog;
  }
  return newLogs;
};

AdminRoute.get("/api/admin/logs", (request: Request, response: Response) => {
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Connection", "keep-alive");

  fs.readFile(currentLogFile, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading log file:", err);
      response.status(500).send("Error reading log file");
      return;
    }

    getNewLogs(data)
      .reverse()
      .map((log) => {
        response.write(`data: ${log}\n\n`);
        response.flush();
      });
  });

  fs.watchFile(currentLogFile, (_current, _previous) => {
    fs.readFile(currentLogFile, "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading log file:", err);
        return;
      }
      getNewLogs(data)
        .reverse()
        .map((log) => {
          response.write(`data: ${log}\n\n`);
          response.flush();
        });
    });
  });

  request.on("close", () => {
    response.end();
  });
});

export { AdminRoute };
