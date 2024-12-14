/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  SparklesIcon,
  RefreshCwIcon,
  TrashIcon,
  XIcon
} from 'lucide-react';

const GeneratedQuestionsModal = ({ generatedQuestions, onClose }) => {
  const [currentGeneratedIndex, setCurrentGeneratedIndex] = useState(0);

  const handleNext = () => {
    setCurrentGeneratedIndex((prev) => 
      prev < generatedQuestions.length - 1 ? prev + 1 : prev
    );
  };

  const handlePrevious = () => {
    setCurrentGeneratedIndex((prev) => 
      prev > 0 ? prev - 1 : prev
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl mx-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XIcon />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Generated Questions
        </h2>

        <div className="relative">
          <QuestionDetailsCard 
            question={generatedQuestions[currentGeneratedIndex]} 
            isGenerated={true}
          />
          
          <div className="flex justify-between mt-4">
            <button 
              onClick={handlePrevious}
              disabled={currentGeneratedIndex === 0}
              className={`
                p-2 rounded-full ${currentGeneratedIndex === 0 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}
              `}
            >
              <ChevronLeftIcon />
            </button>
            
            <div className="text-gray-600">
              {currentGeneratedIndex + 1} / {generatedQuestions.length}
            </div>
            
            <button 
              onClick={handleNext}
              disabled={currentGeneratedIndex === generatedQuestions.length - 1}
              className={`
                p-2 rounded-full ${currentGeneratedIndex === generatedQuestions.length - 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}
              `}
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionDetailsCard = ({ question, onDelete, isGenerated = false }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/api/v1/questions/${question._id}`);
      onDelete(question._id);
    } catch (error) {
      console.error('Error deleting question:', error);
      setIsDeleting(false);
    }
  };

  const handleGenerateSimilar = async () => {
    setIsGenerating(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/generate_questions', { 
        message: JSON.stringify(question) 
      });
      const newGeneratedQuestions = response.data.data.generated_questions[0].generated_questions;
      setGeneratedQuestions(newGeneratedQuestions);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating similar question:', error);
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl mx-auto transition-all duration-300 transform hover:scale-105">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <span className="text-sm text-gray-500 font-medium">
              Type: {question.type.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-sm text-gray-500 font-medium">
              Marks: {question.marks}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            Created: {new Date(question.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {question.question}
        </h2>
        
        {question.type === 'mcq' && (
          <div className="space-y-2 mb-4">
            {question.options.map((option, idx) => (
              <div 
                key={idx} 
                className={`
                  p-3 rounded-md text-gray-700 
                  ${option === question.correct_answer 
                    ? 'bg-green-100 border-l-4 border-green-500' 
                    : 'bg-gray-100'}
                `}
              >
                {String.fromCharCode(65 + idx)}. {option}
                {option === question.correct_answer && (
                  <span className="ml-2 text-xs text-green-600">(Correct Answer)</span>
                )}
              </div>
            ))}
          </div>
        )}
        
        {question.hint && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-md mb-4">
            <p className="text-blue-800 italic">
              <strong>Hint:</strong> {question.hint}
            </p>
          </div>
        )}
        
        {!isGenerated && (
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleGenerateSimilar}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              <SparklesIcon size={20} /> 
              {isGenerating ? 'Generating...' : 'Generate Similar'}
            </button>
            
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              <TrashIcon size={20} /> 
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {generatedQuestions.length > 0 && (
        <GeneratedQuestionsModal 
          generatedQuestions={generatedQuestions}
          onClose={() => setGeneratedQuestions([])}
        />
      )}
    </>
  );
};

const AllQuestionsView = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3000/api/v1/questions/get_all_questions');
      setQuestions(response.data.data);
      setCurrentIndex(0);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to fetch questions');
      setIsLoading(false);
    }
  };

  const handleDelete = (deletedQuestionId) => {
    const updatedQuestions = questions.filter(q => q._id !== deletedQuestionId);
    setQuestions(updatedQuestions);
    
    // Adjust current index if needed
    if (currentIndex >= updatedQuestions.length) {
      setCurrentIndex(Math.max(0, updatedQuestions.length - 1));
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev < questions.length - 1 ? prev + 1 : prev
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev > 0 ? prev - 1 : prev
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <RefreshCwIcon className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600 mb-4">No questions found</p>
        <button 
          onClick={fetchQuestions}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen p-6">
      <div className="relative w-full max-w-3xl">
        <QuestionDetailsCard 
          question={questions[currentIndex]} 
          onDelete={handleDelete}
        />
        
        <div className="flex justify-between mt-4">
          <button 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`
              p-2 rounded-full ${currentIndex === 0 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}
            `}
          >
            <ChevronLeftIcon />
          </button>
          
          <div className="text-gray-600">
            {currentIndex + 1} / {questions.length}
          </div>
          
          <button 
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className={`
              p-2 rounded-full ${currentIndex === questions.length - 1 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}
            `}
          >
            <ChevronRightIcon />
          </button>
        </div>

        <div className="mt-4 text-center">
          <button 
            onClick={fetchQuestions}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Refresh Questions
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllQuestionsView;