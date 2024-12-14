import Tesseract from 'tesseract.js';
async function performOCR(imagePath) {
    try {
        const result = await Tesseract.recognize(
            imagePath,
            'eng',
            {
                // Basic configuration
                tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz()[]{}.,:-IVX',

                // More reliable recognition mode
                tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
                pageSegMode: Tesseract.PSM.AUTO,

                // Logging
                logger: m => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR Progress: ${(m.progress * 100).toFixed(2)}%`);
                    }
                }
            }
        );

        // Simple text cleaning
        const cleanText = result.data.text

        return cleanText;

    } catch (error) {
        console.error('OCR Error:', error);
        throw error;
    }
}

export { performOCR };