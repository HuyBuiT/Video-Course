import express from "express";
import * as fs from "node:fs/promises";
import {
  createOrUpdatePart,
  getPartByNameAndCourseId,
  getPartByCourseId,
} from "../db/part";
import {
  createOrUpdateLesson,
  getLessonsByLessonId,
  getLessonsByPartId,
} from "../db/lesson";
import { createCourse, getAllCourses, getCourseByName } from "../db/course";
import { ObjectId } from "mongodb";

const scanFolderInCourse = async (courseId: ObjectId, courseName: string) => {
  try {
    const folder = await fs.readdir("./Source_video/" + courseName);
    for (const f of folder) {
      try {
        const partData = {
          name: f,
          courseId: courseId.toString(),
          path: `./Source_video/${courseName}/${f}`,
        };
        const create = await createOrUpdatePart(partData);
        const childrenFolder = await fs.readdir(`./Source_video/${courseName}/${f}`);
        const filtered = childrenFolder.filter((file) => file.endsWith(".mp4")); // lesson
        const part = await getPartByNameAndCourseId(f, courseId.toString());
        const partId = part?._id;
        if (partId) {
          for (const lesson of filtered) {
            const lessonName = lesson.split(".")[0];

            const lessonData = {
              name: lessonName,
              partId: partId.toString(),
              file: `Source_video/${courseName}/${f}/${lessonName}.mp4`,
              en: `Source_video/${courseName}/${f}/${lessonName}_en.vtt`,
            };
            const createdLesson = await createOrUpdateLesson(lessonData);
          }
        }
      } catch (error) {
        console.error(`Error processing '${f}': ${error}`);
        // Handle or log the error as per your requirements
      }
    }

  } catch (error) {
    console.error(error);

  }
};

export const scanFolder = async(req: express.Request, res: express.Response) => {
  try {
    const courses = await fs.readdir("./Source_video");
    for (const course of courses) {
      try {
        const courseObject = await getCourseByName(course);
        if(courseObject) {
          await scanFolderInCourse(courseObject._id, courseObject.name);
        } else {
          await createCourse(course, true);
          const courseObject = await getCourseByName(course);
          if(courseObject) {
            await scanFolderInCourse(courseObject._id, courseObject.name);
          }
        }

      } catch (error) {
        console.error(error);
      }
    }
    res.status(200).send({ status: 200, Success: String });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 500, Error: String });
    return;
  }
}

export const getParts = async (req: express.Request, res: express.Response) => {
  try {
    const courseId = req.params.id;
    const listParts = await getPartByCourseId(courseId);
    // Extracting the 'path' property from each part
    const paths = listParts.map((part) => ({
      _id: part._id,
      name: part.name,
      path: part.path,
    }));
    res.status(200).send(paths);
  } catch (error) {
    res.status(400).send(`getParts error:, ${error}`);
  }
};

export const getLessons = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const partId = req.params.id;
    const listLessons = await getLessonsByPartId(partId);
    // Extracting the 'path' property from each part
    const paths = listLessons.map((lesson) => ({
      _id: lesson._id,
      name: lesson.name,
      path: lesson.file,
      en: lesson.en,
    }));
    res.status(200).send(paths);
  } catch (error) {
    res.status(400).send(`getLessons error:, ${error}`);
  }
};

export const getCourses = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const listCourse = await getAllCourses();
    // Extracting the 'path' property from each part
    const course = listCourse.map((course) => ({
      _id: course._id,
      name: course.name,
    }));
    res.status(200).send(course);
  } catch (error) {
    res.status(400).send(`getLessons error:, ${error}`);
  }
};

export const getVideo = async (req: express.Request, res: express.Response) => {
  try {
    const lessonId = req.params.id;
    const video = await getLessonsByLessonId(lessonId);
    res.status(200).send(video);
  } catch (error) {
    res.status(400).send(`getLessons error:, ${error}`);
  }
};
