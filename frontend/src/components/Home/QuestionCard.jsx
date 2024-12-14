/* eslint-disable react/prop-types */
import { useState } from 'react';
import axios from 'axios';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  SaveIcon, 
  CheckCircleIcon, 
  AlertCircleIcon 
} from 'lucide-react';

const QuestionCard = ({ question, onSave, onQuestionUpdate }) => {
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/v1/questions/save_question', { questionData: question });
      console.log('Question saved:', response.data.data._id);
      
      // Create a new question object with the saved ID
      const savedQuestion = {
        ...question,
        id: response.data.data._id
      };

      // Update the question in the parent component's state
      onQuestionUpdate(savedQuestion);
      
      // Optional: Callback for any additional actions
      onSave && onSave(savedQuestion);
      
      // Set save status to success
      setSaveStatus('success');
    } catch (error) {
      console.error('Error saving question:', error);
      setSaveStatus('error');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-auto transition-all duration-300 transform hover:scale-105">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500 font-medium">
          Question Type: {question.type.replace('_', ' ').toUpperCase()}
        </span>
        <span className="text-sm text-gray-500 font-medium">
          Marks: {question.marks}
        </span>
      </div>
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {question.question}
      </h2>
      
      {question.type === 'mcq' && (
        <div className="space-y-2 mb-4">
          {question.options.map((option, idx) => (
            <div 
              key={idx} 
              className="bg-gray-100 p-3 rounded-md text-gray-700 hover:bg-blue-50 transition-colors"
            >
              {String.fromCharCode(65 + idx)}. {option}
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
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={handleSave} 
          disabled={question.id}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg 
            ${question.id 
              ? 'bg-green-500 text-white cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'}
          `}
        >
          {question.id ? (
            <>
              <CheckCircleIcon size={20} /> Saved
            </>
          ) : (
            <>
              <SaveIcon size={20} /> Save Question
            </>
          )}
        </button>
        
        {saveStatus === 'error' && (
          <div className="text-red-500 flex items-center gap-2">
            <AlertCircleIcon size={20} /> 
            Save Failed
          </div>
        )}
      </div>
    </div>
  );
};

const PdfQuestionCarousel = ({ questions: initialQuestions }) => {
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleQuestionUpdate = (updatedQuestion) => {
    // Update the questions array with the saved question
    const updatedQuestions = questions.map(q => 
      q === questions[currentIndex] ? updatedQuestion : q
    );
    setQuestions(updatedQuestions);
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

  if (questions.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen p-6">
      <div className="relative w-full max-w-2xl">
        <QuestionCard 
          question={questions[currentIndex]} 
          onQuestionUpdate={handleQuestionUpdate}
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
      </div>
    </div>
  );
};

export default PdfQuestionCarousel;