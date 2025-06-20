import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { submitQuiz } from '../api/quizapi';

function QuizPage() {
  const { state } = useLocation();
  const { quizData } = state || {};
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  const handleAnswer = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex.toString()]: optionIndex, // Ensure keys are strings
    }));
  };

  const handleSubmit = async () => {
    try {
      console.log("📤 Submitting:", quizData.quiz_id, answers);
      const result = await submitQuiz(quizData.quiz_id, answers);
      navigate('/result', { state: { result, quizData } });
    } catch (error) {
      console.error('❌ Failed to submit quiz:', error);
    }
  };

  if (!quizData) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">
          Quiz - {quizData.level?.toUpperCase()}
        </h2>
        {quizData.questions.map((q, index) => (
          <div key={index} className="mb-6">
            <p className="font-semibold">{index + 1}. {q.question}</p>
            <div className="space-y-2 mt-2">
              {q.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(index, i)}
                  className={`w-full p-2 border rounded text-left ${
                    answers[index.toString()] === i
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
}

export default QuizPage;
