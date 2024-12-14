import { useState, useEffect, useRef } from 'react';

// Language list from the original script
const languages = [
  { name: "English", code: "eng" },
  { name: "Portuguese", code: "por" },
  // ... full list of languages (truncated for brevity)
  { name: "Yiddish", code: "yid" },
];

const PDF2TextOCR = () => {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "eng");
  const [images, setImages] = useState([]);
  const [extractedTexts, setExtractedTexts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // Load external scripts
  useEffect(() => {
    // Dynamically load PDF.js
    const pdfScript = document.createElement('script');
    pdfScript.src = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/build/pdf.min.js";
    pdfScript.async = true;
    document.body.appendChild(pdfScript);

    // Dynamically load Tesseract.js
    const tesseractScript = document.createElement('script');
    tesseractScript.src = "https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/0.1.1/tesseract.min.js";
    tesseractScript.async = true;
    document.body.appendChild(tesseractScript);

    // Configure PDF.js worker
    pdfScript.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/build/pdf.worker.js";
    };

    return () => {
      document.body.removeChild(pdfScript);
      document.body.removeChild(tesseractScript);
    };
  }, []);

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("loadend", (event) =>
        resolve(new Uint8Array(event.target.result))
      );
      reader.readAsArrayBuffer(file);
    });
  };

  const convertToImage = async (pdf) => {
    const images = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: canvas.getContext("2d"),
        viewport: viewport,
      }).promise;
      
      images.push(canvas.toDataURL("image/png"));
    }
    return images;
  };

  const convertToText = async (images) => {
    if (!window.Tesseract) {
      throw new Error("Tesseract.js not loaded");
    }
    
    const worker = await window.Tesseract.createWorker();
    await worker.loadLanguage(language);
    await worker.initialize(language);

    const texts = [];
    for (const image of images) {
      const {
        data: { text },
      } = await worker.recognize(image);
      texts.push(text);
    }

    await worker.terminate();
    return texts;
  };

  const convertFile = async (file) => {
    try {
      setIsLoading(true);
      setError(null);
      setImages([]);
      setExtractedTexts([]);

      // Ensure PDF.js is available
      if (!window.pdfjsLib) {
        throw new Error("PDF.js not loaded");
      }

      const pdf = await window.pdfjsLib.getDocument({ data: file }).promise;
      const convertedImages = await convertToImage(pdf);
      const extractedTexts = await convertToText(convertedImages);

      setImages(convertedImages);
      setExtractedTexts(extractedTexts);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await convertFile(await readFile(file));
    }
  };

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    localStorage.setItem("language", selectedLanguage);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">pdf2text-ocr</h1>
      <p className="mb-2">
        A simple tool for converting PDF to text using OCR. 
        Files are converted locally in the browser and are never uploaded to external servers.
      </p>
      
      <div className="mb-4">
        <p>Select the language and a file:</p>
        <select 
          value={language}
          onChange={handleLanguageChange}
          className="border p-2 mr-4 mb-2"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="mb-2"
        />
      </div>

      {isLoading && (
        <div className="text-center text-blue-500">Loading...</div>
      )}

      {error && (
        <div className="text-red-500">Error: {error}</div>
      )}

      <div ref={containerRef}>
        {extractedTexts.map((text, index) => (
          <section key={index} className="mb-4 bg-gray-100 p-2 rounded">
            <pre className="whitespace-pre-wrap">{text}</pre>
          </section>
        ))}
      </div>
    </div>
  );
};

export default PDF2TextOCR;