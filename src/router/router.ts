import express from "express";
import * as scan from "../controller/scanFolder";
const router = express.Router();

router.post("/scan", scan.scanFolder);

module.exports = router;