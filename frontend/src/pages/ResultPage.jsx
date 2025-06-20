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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Quiz Results</h2>
        <p className="text-lg mb-6 text-center">
          ✅ Your Score: <strong>{result.score} / {quizData.questions.length}</strong>
        </p>

        <h3 className="text-xl font-semibold mb-4">📝 Review</h3>
        {quizData.questions.map((q, index) => {
          const userAnswerIndex = result.answers?.[index];
          const isCorrect = userAnswerIndex === q.correct_answer;

          return (
            <div key={index} className="mb-4 p-3 bg-gray-100 rounded">
              <p className="font-semibold">{index + 1}. {q.question}</p>
              <p>✔ Correct: <strong>{q.options[q.correct_answer]}</strong></p>
              <p>
                {userAnswerIndex !== undefined ? (
                  <>
                    {isCorrect ? '✔' : '❌'} Your Answer: <strong>{q.options[userAnswerIndex]}</strong>
                  </>
                ) : (
                  <>❌ Your Answer: <strong>Not answered</strong></>
                )}
              </p>
            </div>
          );
        })}

        <h3 className="text-xl font-semibold mt-8 mb-4">🤖 Ask the Help Bot</h3>
        <div className="space-y-4">
          <select
            value={questionIndex}
            onChange={(e) => setQuestionIndex(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a question</option>
            {quizData.questions.map((_, i) => (
              <option key={i} value={i}>
                Question {i + 1}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={botQuestion}
            onChange={(e) => setBotQuestion(e.target.value)}
            placeholder="Ask something about this question..."
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleBotAsk}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Ask Bot
          </button>
          {botResponse && (
            <div className="mt-4 p-4 bg-yellow-100 rounded text-sm whitespace-pre-wrap">
              <strong>Bot:</strong> {botResponse}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultPage;
