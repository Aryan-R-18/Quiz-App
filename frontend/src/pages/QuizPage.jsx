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
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-stone-500 via-fuchsia-200 to-stone-500 p-6">
    <div className="backdrop-blur-xl bg-white/70 p-10 rounded-3xl shadow-2xl w-full max-w-3xl animate-fade-in-up transition-all duration-500 border border-indigo-100">
      <h2 className="text-4xl font-extrabold text-center text-stone-600 mb-10 tracking-tight">
        📝 Quiz - <span className="text-fuchsia-950">{quizData.level?.toUpperCase()}</span>
      </h2>

      {quizData.questions.map((q, index) => (
        <div key={index} className="mb-10">
          <p className="text-xl font-semibold text-gray-900 mb-4">
            {index + 1}. {q.question}
          </p>
          <div className="grid gap-4">
            {q.options.map((option, i) => {
              const isSelected = answers[index.toString()] === i;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(index, i)}
                  className={`w-full px-5 py-3 text-left rounded-2xl border transition-all duration-300 ease-in-out shadow-sm text-base font-medium
                    ${
                      isSelected
                        ? 'bg-gradient-to-r from-fuchsia-400 to-purple-500 text-white shadow-lg scale-[1.01]'
                        : 'bg-white hover:bg-indigo-50 hover:shadow-md text-gray-800'
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
        className="w-full bg-gradient-to-r from-fuchisa-500 to-stone-600 hover:from-stone-700 hover:to-fuchsia-400 text-white font-bold py-4 mt-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
      >
        ✅ Submit Quiz
      </button>
    </div>
  </div>
);

}

export default QuizPage;
