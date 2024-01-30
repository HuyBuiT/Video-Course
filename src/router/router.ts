import express from "express";
import * as scan from "../controller/scanFolder";
import * as user from "../controller/user";
import fs from 'fs';
import axios from"axios";
import cron from "node-cron";
const router = express.Router();
//For user
router.post("/signup", user.signUpUser);
router.post("/login",user.loginUser);
router.get("/logout", user.logoutUser);
router.get("/users/:_id", user.getUserById);
router.get("/current_user", user.getCurrentUser);

// For video
router.post("/scan", scan.scanFolder);
router.get("/parts/:id", scan.getParts);
router.get("/lessons/:id", scan.getLessons);
router.get("/courses", scan.getCourses);
router.get("/video/:id", scan.getVideo);
router.get('/play_video', async (req: express.Request, res: express.Response) => {
    //const videoPath = `Source video/02 - App Design/001 App overview.mp4`;
  const videoId = req.query.id as string;
  try {
    const response = await axios.get(`http://localhost:5500/api/video/${videoId}`);
    const videoPath = response.data.file;
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
  } catch (error) {
    console.error('Error fetching video path:', error);
    res.status(500).send('Internal Server Error');
  }
  
});

router.get("/caption", (req: express.Request, res: express.Response) => {
  const captionPath = req.query.path as string;

  fs.readFile(captionPath, 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading caption file:", err);
        res.status(500).send("Internal Server Error");
    } else {
        // Assuming the caption file is in VTT format
        res.header('Content-Type', 'text/vtt');
        res.send(data);
    }
  });
})

// Schedule the /scan API to run every day at a specific time (e.g., 8:00 AM)
cron.schedule('19 15 * * *', async () => {
  const courseId = "659bcc06ea253d5fdcb633cb";
  try {
    console.log('Running scheduled task: /scan');
    // Call the /scan API here
    const response = await axios.post('http://localhost:5500/api/scan', { courseId });
    console.log('Scheduled task completed:', response.data);
  } catch (error) {
    console.error('Error running scheduled task:', error);
  }
});

module.exports = router;