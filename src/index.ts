import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import { error } from "console";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import  * as fs from "fs";
const router = require("./router/router");
dotenv.config();
const app: Express = express();
const server = http.createServer(app);
const port = process.env.PORT;
// * CookieParser
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :status :response-time ms'));
// * Database connection
mongoose.Promise = Promise;
if (process.env.DB_URL) {
  mongoose.connect(process.env.DB_URL);
  mongoose.connection.on('error', (error: Error) => console.log(error));
  mongoose.connection.once('open', () => {
    console.log('MongoDB connected successfully!');
  });
} else {
  console.error("DB_URL is missing in the environment variables.");
  process.exit(1);
}

app.get("/", (req, res) => {
  res.send("Video course");
});
app.get('/video', (req: express.Request, res: express.Response) => {
  const videoPath = `Source video/02 - App Design/001 App overview.mp4`;
  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;
  const videoRange = req.headers.range;

  if (videoRange) {
    const parts = videoRange.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });

    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, headers);
    file.pipe(res);
  } else {
    const headers = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(200, headers);
    fs.createReadStream(videoPath).pipe(res);
  }
});
app.use("/api", router);
server.listen(port, () => {
    console.log(`[server]: Server is running through port: ${port}`);
});