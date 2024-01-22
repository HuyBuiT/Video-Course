import express from "express";
import * as scan from "../controller/scanFolder";
import fs from 'fs';
import path from 'path';
const router = express.Router();

router.post("/scan", scan.scanFolder);
router.get("/parts/:id", scan.getParts);
router.get("/lessons/:id", scan.getLessons);
router.get("/courses", scan.getCourses);
router.get("/video/:id", scan.getVideo);
router.get('/video', (req: express.Request, res: express.Response) => {
    //const videoPath = `Source video/02 - App Design/001 App overview.mp4`;
    const videoPath = req.query.path as string;
//   console.log("2");
//   const decodedFilePath = decodeURIComponent(req.params.file);
//   const videoPath = path.join(__dirname, decodedFilePath);
  
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

module.exports = router;