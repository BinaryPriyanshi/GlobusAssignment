import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true
        },
        options: {
            type: [String],
        },
        correct_answer: {
            type: String,
            required: true,
        },
        marks: {
            type: Number,
            required: true,
        },
        hint: {
            type: String,
        },
        type: {
            type: String,
            enum: ["mcq", "descriptive","fill_in_the_blank",],
            required: true,
        }

    },
    {
        timestamps: true,
    }
)

export const Questions = mongoose.model("Questions", questionSchema);