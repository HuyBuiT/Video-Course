import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isFree: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true }
);

export const CourseModel = mongoose.model('Course', CourseSchema);

export const getCourseByName = async (name: string) => {
    try {
        const course = await CourseModel.findOne({ name });
        return course;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Could not get course by name: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
};

export const createCourse = async (name: string, isFree: boolean) => {
    try {
        // Check if the course with the same name already exists
        const existingCourse = await getCourseByName(name);

        if (!existingCourse) {
            const newCourse = new CourseModel({
                name: name,
                isFree: isFree
            });
    
            const createdCourse = await newCourse.save();
            return createdCourse;
        } else {
            return ;
        }

        
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Could not create course: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
};

// Function to update an existing course by its name
export const updateCourse = async (name: string, updatedFields: Object) => {
    try {
        const updatedCourse = await CourseModel.findOneAndUpdate(
            { name: name },
            { $set: updatedFields },
            { new: true } // To return the updated document
        );
        if (!updatedCourse) {
            throw new Error("Course not found");
        }
        return updatedCourse;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Could not get course by name: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
};