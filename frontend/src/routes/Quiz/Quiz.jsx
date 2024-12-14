/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect} from 'react';
import axios from 'axios';
import { 
  ClockIcon, 
  CheckIcon, 
  SkipForwardIcon,
  AlertTriangleIcon
} from 'lucide-react';

const QuizComponent = ({ quizId }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes default
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch quiz questions on component mount
  useEffect(() => {
    const fetchQuizQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:3000/api/v1/questions/get_questions`);
        setQuestions(response.data.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching quiz questions:', err);
        setError('Failed to load quiz questions');
        setIsLoading(false);
      }
    };

    fetchQuizQuestions();
  }, [quizId]);

  // Timer logic
  useEffect(() => {
    if (timeRemaining > 0 && !isQuizCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeRemaining === 0) {
      handleQuizCompletion();
    }
  }, [timeRemaining, isQuizCompleted]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Render input based on question type
  const renderQuestionInput = () => {
    const currentQuestion = questions[currentQuestionIndex];

    switch (currentQuestion.type) {
      case 'mcq':
        return (
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  setSelectedOption(option);
                  setUserAnswer(option);
                }}
                className={`
                  p-3 rounded-md cursor-pointer transition-all duration-200
                  ${selectedOption === option 
                    ? 'bg-blue-100 border-2 border-blue-500' 
                    : 'bg-gray-100 hover:bg-gray-200'}
                `}
              >
                {String.fromCharCode(65 + idx)}. {option}
              </div>
            ))}
          </div>
        );
      
      case 'descriptive':
        return (
          <div className="mb-6">
            <textarea 
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Write your answer here..."
              className="w-full p-3 border rounded-md min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {currentQuestion.hint && (
              <div className="mt-2 text-sm text-gray-600">
                <strong>Hint:</strong> {currentQuestion.hint}
              </div>
            )}
          </div>
        );
      
      case 'fill_in_the_blank':
        return (
          <div className="mb-6">
            <input 
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {currentQuestion.hint && (
              <div className="mt-2 text-sm text-gray-600">
                <strong>Hint:</strong> {currentQuestion.hint}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  // Handle question submission
  const handleSubmit = async () => {
    if (!userAnswer) return;

    try {
      const response = await axios.post('http://localhost:3000/api/v1/questions/evaluate_question', {
        questionId: questions[currentQuestionIndex]._id,
        answer: userAnswer
      }).then(res => res.data);
      // Update score if correct
      if (response.data.isCorrect) {
        console.log('Correct Answer!');
        setTotalScore(prev => prev + Number(response.data.marks));
      }
      console.log('Total Score:', totalScore);

      // Move to next question or complete quiz
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setUserAnswer('');
        setSelectedOption(null);
      } else {
        handleQuizCompletion();
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  // Handle skipping a question
  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setSelectedOption(null);
    } else {
      handleQuizCompletion();
    }
  };

  // Handle quiz completion
  const handleQuizCompletion = async () => {
    setIsQuizCompleted(true);
    setQuizResults(totalScore)
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <AlertTriangleIcon size={48} className="text-blue-500 mx-auto" />
          </div>
          <p className="text-gray-600">Loading Quiz...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  // Render quiz completed state
  if (isQuizCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Completed!</h2>
          <div className="text-xl mb-4">
            <span className="font-semibold">Total Score:</span> {totalScore}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  // Current question
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
        {/* Timer and Progress */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center text-gray-600">
            <ClockIcon size={24} className="mr-2" />
            <span className="font-medium">{formatTime(timeRemaining)}</span>
          </div>
          <div className="text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Question Type and Marks */}
        <div className="flex justify-between mb-4">
          <span className="text-sm text-gray-500 font-medium">
            Type: {currentQuestion.type.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-sm text-gray-500 font-medium">
            Marks: {currentQuestion.marks}
          </span>
        </div>

        {/* Question */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {currentQuestion.question}
        </h2>

        {/* Question Input Based on Type */}
        {renderQuestionInput()}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
          >
            <SkipForwardIcon size={20} /> Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!userAnswer}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            <CheckIcon size={20} /> Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizComponent;