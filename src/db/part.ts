import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const PartSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    courseId: {
        type: String,
        ref: "Course",
        required: true
    },
    path: {
        type: String,
        required: true
    }
},
{ timestamps: true }
);

export const PartModel = mongoose.model('Part', PartSchema);

export const getPartByNameAndCourseId = async (name: string, courseId: string) => {
    try {
        const part = await PartModel.findOne({ name, courseId });
        return part;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Could not get part by name and courseId: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
};

export const updatePart = async (id: ObjectId, updatedFields: object) => {
    try {
        const updatedPart = await PartModel.findOneAndUpdate(
            { _id: id },
            { $set: updatedFields },
            { new: true } // To return the updated document
        );
        if (!updatedPart) {
            throw new Error("Part not found");
        }
        return updatedPart;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Could not update part: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
};
export const createOrUpdatePart = async (data: { name: string, courseId: string, path: string }) => {
    try {
        const { name, courseId, path } = data;

        const existingPart = await getPartByNameAndCourseId(name, courseId);

        if (!existingPart) {
            const newPart = new PartModel(data);
            const createdPart = await newPart.save();
            return createdPart;
        } else {
            const updatedPart = await updatePart(existingPart._id, { name, courseId, path }); // Call the updatePart function
            return updatedPart;
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Could not create/update part: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
};
export const getPartByCourseId = async (courseId: string) => {
    try {
      const parts = await PartModel.find({ courseId });
  
      return parts;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Could not get parts by course ID: ${error.message}`);
      } else {
        throw new Error('An unknown error occurred');
      }
    }
};
  