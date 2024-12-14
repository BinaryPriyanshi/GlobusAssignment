import { ApiError } from "../util/apiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { replyFromGroq } from "../util/groqTalk.js";

const generalTalk = asyncHandler(async (req, res) => {
    const message = req.body.message;
    if (!message) {
        throw new ApiError(400, "Message is required");
    }


    let response = await replyFromGroq(message);
    response = response.content
    .replace(/```/g, '')         // Remove all triple backticks
    .replace(/\n/g, '')           // Remove all newlines
    .replace(/  /g, '')           // Remove double spaces
    // .replace(/\\/g, '')          // Remove backslashes
    .replace(/\s{2,}/g, ' ')

    response = response.replace(/\\"/g, '"');
    response = response.replace('json', '');

    const jsonResp = JSON.parse(response);
    const apiResponse = new ApiResponse(200, jsonResp, "Groq replied successfully");

    res.status(200).json(apiResponse);
})

export { generalTalk };