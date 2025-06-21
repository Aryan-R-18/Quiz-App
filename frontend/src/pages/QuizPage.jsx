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
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl animate-fade-in-up transition-all duration-500">
      <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-8">
        📝 Quiz - {quizData.level?.toUpperCase()}
      </h2>

      {quizData.questions.map((q, index) => (
        <div key={index} className="mb-8">
          <p className="text-lg font-semibold text-gray-800 mb-3">
            {index + 1}. {q.question}
          </p>
          <div className="grid gap-3">
            {q.options.map((option, i) => {
              const isSelected = answers[index.toString()] === i;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(index, i)}
                  className={`w-full px-4 py-2 text-left rounded-xl border transition duration-300 shadow-sm
                    ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold'
                        : 'bg-gray-100 hover:bg-indigo-100 text-gray-800'
                    }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 mt-4 rounded-xl shadow-md transition duration-300"
      >
        ✅ Submit Quiz
      </button>
    </div>
  </div>
);

}

export default QuizPage;
