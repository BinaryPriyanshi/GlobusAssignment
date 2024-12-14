import { Questions } from "../models/questions.model.js";
import { ApiError } from "../util/apiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { evaluateAnswer, parseGroqResponse } from "../util/groqTalk.js";


const saveQuestion = asyncHandler(async (req, res) => {
    const {questionData} = req.body;
    if (!questionData) {
        throw new ApiError(400, "Question is required");
    }

    console.log(questionData);

    // Save question to database
    const savedQuestion = await Questions.create( questionData );

    if(!savedQuestion) {
        throw new ApiError(500, "Failed to save question");
    }

    const apiResponse = new ApiResponse(200, savedQuestion, "Question saved successfully");

    res.status(200).json(apiResponse);
})

const getQuestions = asyncHandler(async (req, res) => {
    const questions = await Questions.find().select(['-hint','-correct_answer']).limit(10);

    if(!questions) {
        throw new ApiError(500, "Failed to fetch questions");
    }

    const apiResponse = new ApiResponse(200, questions, "Questions fetched successfully");

    res.status(200).json(apiResponse);
})
const getAllQuestions = asyncHandler(async (req, res) => {
    const questions = await Questions.find();

    if(!questions) {
        throw new ApiError(500, "Failed to fetch questions");
    }

    const apiResponse = new ApiResponse(200, questions, "Questions fetched successfully");

    res.status(200).json(apiResponse);
})

const evaluateQuestion = asyncHandler(async (req, res) => {
    const {questionId, answer} = req.body;
    if (!questionId || !answer) {
        throw new ApiError(400, "Question ID and answer are required");
    }

    const question = await Questions.findById(questionId);

    if(!question) {
        throw new ApiError(404, "Question not found");
    }

    let isCorrect = false;

    if(question.type != 'descriptive' && question.correct_answer === answer) {
        isCorrect = true;
    }
    else if(question.type === 'descriptive') {
        // Perform NLP based answer evaluation
        isCorrect = await evaluateAnswer(question.correct_answer, answer,question.question).then(response => response.content);
        isCorrect = parseGroqResponse(isCorrect).isCorrect;
    }

    const marks = isCorrect ? question.marks : 0;

    const apiResponse = new ApiResponse(200, {isCorrect,marks}, "Question evaluated successfully");

    res.status(200).json(apiResponse);
})

export {
    saveQuestion,
    getQuestions,
    evaluateQuestion,
    getAllQuestions
}