import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import { error } from "console";
import cookieParser from "cookie-parser";
import morgan from "morgan";
const router = require("./router/router");
dotenv.config();
const app: Express = express();
const server = http.createServer(app);
const port = process.env.PORT;

// * CookieParser
app.use(cookieParser());

const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend's URL
  credentials: true // Allow credentials (cookies)
};

app.use(cors(corsOptions));
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
app.use("/api", router);
server.listen(port, () => {
    console.log(`[server]: Server is running through port: ${port}`);
});