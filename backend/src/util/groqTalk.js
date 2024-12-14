import { ChatGroq } from "@langchain/groq";
import { convertQuestionsToJson, evaluateAnswerPrompt, questionGenerationPrompt } from "./prompts.js";

const groqTalk = new ChatGroq({
  model: "llama-3.3-70b-versatile",
});

const replyFromGroq = async (message) => {
  const response = await groqTalk.invoke([
    ["system",questionGenerationPrompt],
        ["user", message],
    ]);

    return response;
};

const convertToJson = async (message) => {
    const response = await groqTalk.invoke([
        ["system",convertQuestionsToJson],
        ["user", message],
    ]);

    return response;
}

const evaluateAnswer = async (correctAnswer, userAnswer,question) => {
    const response = await groqTalk.invoke([
        ["system",evaluateAnswerPrompt],
        ["user", `question: ${question}`],
        ["user", `correct_answer: ${correctAnswer}`],
        ["user", `student_answer: ${userAnswer}`],
    ]).then((res) => {
        return res;
    });

    return response;
}

const parseGroqResponse = (response) => {
  let res = response.replace(/```/g, '')         // Remove all triple backticks
    .replace(/\n/g, '')           // Remove all newlines
    .replace(/  /g, '')           // Remove double spaces
    .replace(/\\/g, '')          // Remove backslashes
    .replace(/\s{2,}/g, ' ')

    res = res.replace(/\\"/g, '"');
    res= res.replace('json', '');

    return JSON.parse(res);
}

export {
    replyFromGroq,
    convertToJson,
    evaluateAnswer,
    parseGroqResponse
}
