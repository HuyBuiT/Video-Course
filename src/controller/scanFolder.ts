import express from "express";
import * as fs from 'node:fs/promises';
import { createOrUpdatePart,getPartByNameAndCourseId, getPartByCourseId } from "../db/part";
import { createOrUpdateLesson, getLessonsByLessonId, getLessonsByPartId } from "../db/lesson";
import { getAllCourses } from "../db/course";
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
                                file: `Source video/${f}/${lessonName}.mp4`,
                                en: `/Source video/${f}/${lessonName}_en.srt`
            
                            }
                            const createdLesson = await createOrUpdateLesson(lessonData)
                    }
                }
            } catch (error) {
                console.error(`Error processing '${f}': ${error}`);
                // Handle or log the error as per your requirements
            }
        }
        res.status(200).send({status: 200, "Success": String});
    } catch (error) {
        console.error(error);
        res.status(400).send("error");
    }
}

export const getParts =async (req:express.Request, res:express.Response) => {
    try {
        const courseId = req.params.id;
        const listParts= await getPartByCourseId(courseId);
        // Extracting the 'path' property from each part
        const paths = listParts.map((part) => ({_id: part._id,name: part.name, path: part.path}));
        res.status(200).send(paths);
    } catch (error) {
        res.status(400).send(`getParts error:, ${error}`);
    }
}

export const getLessons =async (req:express.Request, res: express.Response) => {
    try {
        const partId = req.params.id;
        const listLessons= await getLessonsByPartId(partId);
        // Extracting the 'path' property from each part
        const paths = listLessons.map((lesson) => ({_id: lesson._id,name: lesson.name, path: lesson.file, en: lesson.en}));
        res.status(200).send(paths);
    } catch (error) {
        res.status(400).send(`getLessons error:, ${error}`);
    }
}

export const getCourses =async (req:express.Request, res: express.Response) => {
    try {
        const listCourse = await getAllCourses()
        // Extracting the 'path' property from each part
        const course = listCourse.map((course) => ({_id: course._id,name: course.name}));
        res.status(200).send(course);
    } catch (error) {
        res.status(400).send(`getLessons error:, ${error}`);
    }
}

export const getVideo =async (req:express.Request, res: express.Response) => {
    try {
        const lessonId = req.params.id;
        const video = await getLessonsByLessonId(lessonId);
        res.status(200).send(video);
    } catch (error) {
        res.status(400).send(`getLessons error:, ${error}`);
    }
}