import express from "express";
import * as fs from 'node:fs/promises';
import { createOrUpdatePart,getPartByNameAndCourseId } from "../db/part";
import { createOrUpdateLesson } from "../db/lesson";
export const scanFolder =async (req:express.Request, res: express.Response) => {
    try {
        const folder = await fs.readdir("./Source video");
        const courseId = req.body.courseId;
        for (const f of folder) {
            try {
                const partData ={
                    name: f,
                    courseId: courseId,
                    path: `./Source video/${f}`
                }
                const create = await createOrUpdatePart(partData);
                const childrenFolder = await fs.readdir(`./Source video/${f}`);
                const filtered = childrenFolder.filter((file) => file.endsWith('.mp4')); // lesson
                const part = await getPartByNameAndCourseId(f, courseId.toString());
                const partId = part?._id;
                if (partId) {
                    for (const lesson of filtered){
                        const lessonName = lesson.split('.')[0];
                
                            const lessonData = {
                                name: lessonName,
                                partId: partId.toString(),
                                file: `./Source video/${f}/${lessonName}.mp4`,
                                en: `./Source video/${f}/${lessonName}_en.srt`
            
                            }
                            const createdLesson = await createOrUpdateLesson(lessonData)
                    }
                }
            } catch (error) {
                console.error(`Error processing '${f}': ${error}`);
                // Handle or log the error as per your requirements
            }
        }
        res.status(200).send("success");
    } catch (error) {
        console.error(error);
        res.status(400).send("error");
    }
}
