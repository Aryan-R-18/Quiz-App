import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getBotResponse } from '../api/quizapi'; // ✅ Ensure correct import

function ResultPage() {
  const { state } = useLocation();
  const { result, quizData } = state || {};

  const [questionIndex, setQuestionIndex] = useState('');
  const [botQuestion, setBotQuestion] = useState('');
  const [botResponse, setBotResponse] = useState('');

  const handleBotAsk = async () => {
    try {
      const response = await getBotResponse(
        quizData.quiz_id,
        parseInt(questionIndex),
        botQuestion
      );
      setBotResponse(response.answer);
    } catch (error) {
      console.error('Bot error:', error);
      setBotResponse('Error: Could not get response from bot.');
    }
  };

  if (!result || !quizData || !quizData.questions) {
    return (
      <div className="text-center mt-10 text-red-600">
        Something went wrong loading results. Please try again.
      </div>
    );
  }

  return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-3xl animate-fade-in-up transition-all duration-500">
      
      {/* Quiz Header */}
      <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">📊 Quiz Results</h2>
      <p className="text-xl text-center mb-8 text-gray-700">
        ✅ Your Score: <span className="font-bold text-indigo-600">{result.score} / {quizData.questions.length}</span>
      </p>

      {/* Review Section */}
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">📝 Review</h3>
      <div className="space-y-6">
        {quizData.questions.map((q, index) => {
          const userAnswerIndex = result.answers?.[index];
          const isCorrect = userAnswerIndex === q.correct_answer;

          return (
            <div key={index} className="p-4 rounded-xl shadow bg-gray-100">
              <p className="text-lg font-medium text-gray-800 mb-2">
                {index + 1}. {q.question}
              </p>
              <p className="text-sm text-green-700">
                ✔ Correct: <strong>{q.options[q.correct_answer]}</strong>
              </p>
              <p className={`text-sm font-medium mt-1 ${
                isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {userAnswerIndex !== undefined ? (
                  <>
                    {isCorrect ? '✅' : '❌'} Your Answer: <strong>{q.options[userAnswerIndex]}</strong>
                  </>
                ) : (
                  <>❌ Your Answer: <strong>Not answered</strong></>
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* Ask the Bot Section */}
      <h3 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">🤖 Ask the Help Bot</h3>
      <div className="space-y-4">
        <select
          value={questionIndex}
          onChange={(e) => setQuestionIndex(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
        >
          <option value="">Select a question</option>
          {quizData.questions.map((_, i) => (
            <option key={i} value={i}>Question {i + 1}</option>
          ))}
        </select>

        <input
          type="text"
          value={botQuestion}
          onChange={(e) => setBotQuestion(e.target.value)}
          placeholder="Ask something about this question..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
        />

        <button
          onClick={handleBotAsk}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg shadow-md transition duration-300"
        >
          💬 Ask Bot
        </button>

        {botResponse && (
          <div className="mt-4 p-4 bg-yellow-100 rounded-lg text-sm whitespace-pre-wrap shadow-inner border border-yellow-300 animate-fade-in">
            <strong className="text-yellow-800">Bot:</strong> {botResponse}
          </div>
        )}
      </div>
    </div>
  </div>
);

}

export default ResultPage;
