import { useState } from 'react';
import { AiOutlinePlus, AiOutlineFilePdf } from 'react-icons/ai';
import { MdDelete } from 'react-icons/md';
import axios from 'axios';
import PdfQuestionCarousel from './QuestionCard';


function PdfUploader() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [error, setError] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfPreview(URL.createObjectURL(file));
      setError(null);
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const handleRemove = () => {
    setPdfFile(null);
    setPdfPreview(null);
    setError(null);
    setParsedQuestions([]);
  };

  const handleParse = async () => {
    if (!pdfFile) return;

    const formData = new FormData();
    formData.append('file', pdfFile);

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/parse_pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setParsedQuestions(response.data.data.jsonResp.questions || []);
    } catch (err) {
      console.error('Error parsing PDF:', err);
      setError('Failed to parse the PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen p-6 gap-8">
      {parsedQuestions.length > 0 ? (
        <PdfQuestionCarousel questions={parsedQuestions} />
      ) : (
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          {pdfFile ? (
            <div className="flex flex-col items-center gap-4">
              <AiOutlineFilePdf className="text-red-500 text-6xl" />
              <p className="text-gray-800 text-center truncate w-64">{pdfFile.name}</p>
              <button
                onClick={handleRemove}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600"
              >
                <MdDelete /> Remove
              </button>
            </div>
          ) : (
            <label
              htmlFor="pdf-upload"
              className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-400 rounded-lg text-gray-600 cursor-pointer hover:border-blue-500 hover:text-blue-500"
            >
              <AiOutlinePlus className="text-4xl" />
              <span className="mt-2">Upload PDF</span>
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleUpload}
              />
            </label>
          )}
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          {pdfFile && (
            <button
              onClick={handleParse}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Parsing...' : 'Parse Questions'}
            </button>
          )}
        </div>
      )}

      {pdfPreview && !parsedQuestions.length && (
        <div className="w-full max-w-lg h-96 bg-white rounded-lg shadow-md overflow-hidden">
          <iframe
            src={pdfPreview}
            title="PDF Preview"
            className="w-full h-full"
          ></iframe>
        </div>
      )}
    </div>
  );
}

export default PdfUploader;