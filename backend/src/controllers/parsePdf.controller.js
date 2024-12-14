if (!Promise.withResolvers) {
    Promise.withResolvers = function () {
        const resolveReject = {};
        resolveReject.promise = new Promise((resolve, reject) => {
            resolveReject.resolve = resolve;
            resolveReject.reject = reject;
        });
        return resolveReject;
    };
}


import { ApiError } from '../util/apiError.js';
import { ApiResponse } from '../util/ApiResponse.js';
import { asyncHandler } from '../util/asyncHandler.js';
import { performOCR } from '../util/tesseract.js';
import fs from "fs/promises";
import path from "path";
import pdfjs from 'pdfjs-dist';
import { createCanvas } from 'canvas';
import { convertToJson } from '../util/groqTalk.js';


// Polyfill for Promise.withResolvers if not already defined

/**
 * Convert PDF to images
 * @param {string} pdfPath - Path to the PDF file
 * @param {Object} [options] - Conversion options
 * @returns {Promise<string[]>} Array of image paths
 */
const convertPdfToImages = async (pdfPath, options = {}) => {
    try {
        // Ensure images directory exists
        const savePath = options.savePath || path.resolve("./images");
        await fs.mkdir(savePath, { recursive: true });

        const loadingTask = pdfjs.getDocument(pdfPath);
        const pdf = await loadingTask.promise;
        const imagePaths = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 });
            
            // Create canvas
            const canvas = createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');

            // Render page to canvas
            await page.render({ canvasContext: context, viewport }).promise;

            // Generate image path
            const imagePath = path.join(savePath, `page_${pageNum}.png`);
            
            // Write canvas to file
            const buffer = canvas.toBuffer('image/png');
            await fs.writeFile(imagePath, buffer);
            
            imagePaths.push(imagePath);
            console.log(`Page ${pageNum} converted to image: ${imagePath}`);
        }

        return imagePaths;
    } catch (error) {
        throw new ApiError(500, `Failed to convert PDF to images: ${error.message}`);
    }
};

/**
 * Perform OCR on multiple images
 * @param {string[]} imagePaths - Array of image paths
 * @returns {Promise<Object[]>} Array of extracted texts with image paths
 */
const parseImages = async (imagePaths) => {
    try {
        const parsedTexts = [];
        for (const imagePath of imagePaths) {
            const text = await performOCR(imagePath);
            parsedTexts.push({
                imagePath,
                extractedText: text
            });
        }
        return parsedTexts;
    } catch (error) {
        throw new ApiError(500, `OCR processing failed: ${error.message}`);
    }
};


const mergedStrings = (strings) => {
    let mergedString = '';
    strings.forEach((string) => {
        mergedString += string;
    });
    return mergedString;
}

/**
 * Main PDF parsing route handler
 */
const parsePdf = asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) {
        throw new ApiError(400, "No file uploaded");
    }

    // Convert PDF to images
    const images = await convertPdfToImages(file.path);

    // Perform OCR on images
    const parsedContent = await parseImages(images);

    // Optional: Clean up temporary image files
    const cleanupPromises = images.map(imagePath => 
        fs.unlink(imagePath).catch(err => 
            console.warn(`Failed to delete temp image ${imagePath}:`, err)
        )
    );
    await Promise.allSettled(cleanupPromises);

    const mergedString = mergedStrings(parsedContent.map((content) => content.extractedText));
    let resp = await convertToJson(mergedString);
    resp = resp.content
    .replace(/```/g, '')         // Remove all triple backticks
    .replace(/\n/g, '')           // Remove all newlines
    .replace(/  /g, '')           // Remove double spaces
    // .replace(/\\/g, '')          // Remove backslashes
    .replace(/\s{2,}/g, ' ')

    resp = resp.replace(/\\"/g, '"');
    resp = resp.replace('json', '');

    const jsonResp = JSON.parse(resp);

    const response = new ApiResponse(200, {
        jsonResp
    }, "PDF parsed successfully");

    res.status(200).json(response);
});



export { parsePdf, convertPdfToImages, parseImages };