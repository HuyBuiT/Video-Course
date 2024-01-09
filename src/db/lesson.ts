import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    partId: {
        type: String,
        ref: "Part",
        required: true
    },
    file: {
        type: String,
        required: true
    },
    en: {
        type: String
    },
    vn: {
        type: String
    }
},
{ timestamps: true }
);
export const LessonModel = mongoose.model('Lesson', LessonSchema);

export const getLessonByNameAndPartId = async (name: string, partId: string) => {
    try {
        const lesson = await LessonModel.findOne({ name, partId });
        return lesson;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Could not get lesson by name and partId: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
};

export const createOrUpdateLesson = async (data: { name: string, partId: string, file: string, en?: string, vn?: string }) => {
    try {
        const { name, partId, file, en, vn } = data;

        const existingLesson = await getLessonByNameAndPartId(name, partId);

        if (!existingLesson) {
            const newLesson = new LessonModel(data);
            const createdLesson = await newLesson.save();
            return createdLesson;
        } else {
            const updatedLesson = await updateLesson(name, {partId, file, en, vn } ); 
            return updatedLesson;
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Could not create lesson: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
};

export const updateLesson = async (name: string, updatedFields: object) => {
    try {
        const updatedLesson = await LessonModel.findOneAndUpdate(
            { name: name },
            { $set: updatedFields },
            { new: true } // To return the updated document
        );
        if (!updatedLesson) {
            throw new Error("Lesson not found");
        }
        return updatedLesson;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Could not update lesson: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
};
