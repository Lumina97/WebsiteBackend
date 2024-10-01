import { Router, Request, Response } from "express";
import fs from "fs";
import { currentLogFile } from "../Config";

const AdminRoute = Router();

AdminRoute.get("/api/admin/logs", (request: Request, response: Response) => {
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Connection", "keep-alive");
  console.log("getting logs");

  fs.readFile(currentLogFile, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading log file:", err);
      response.status(500).send("Error reading log file");
      return;
    }
    response.write(`data: ${data}\n\n`);
  });

  const logInterval = setInterval(() => {
    fs.readFile(currentLogFile, "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading log file:", err);
        return;
      }

      // Split log file content into lines
      const logLines = data.trim().split("\n");
      // Get the last log entry
      const lastLogEntry = logLines[logLines.length - 1];

      // Send the last log entry to the client
      response.write(`data: ${lastLogEntry}\n\n`);
    });
  }, 5000);

  request.on("close", () => {
    // clearInterval(logInterval);
    response.end();
  });
});

export { AdminRoute };
