import React, { useState, useContext, useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { generateQuiz } from '../api/quizapi';

// Define a cooldown period in milliseconds (e.g., 60 seconds)
// This should be at least 60 seconds to respect minute-based limits,
// but depending on the true free-tier limits, you might need even longer.
const COOLDOWN_PERIOD_MS = 60 * 1000; // 60 seconds

function DashboardPage() {
  const { user, logout } = useContext(AuthContext);
  const [level, setLevel] = useState('easy');
  const [isGenerating, setIsGenerating] = useState(false); // To disable button during generation
  const [lastGenerationTime, setLastGenerationTime] = useState(0); // To track cooldown
  const [cooldownRemaining, setCooldownRemaining] = useState(0); // To display countdown
  const navigate = useNavigate();

  // Effect to update the cooldown timer
  useEffect(() => {
    let timer;
    if (cooldownRemaining > 0) {
      timer = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) { // If 1 second or less remains, clear interval
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // Update every second
    }
    return () => clearInterval(timer); // Cleanup on unmount or if cooldown finishes
  }, [cooldownRemaining]);


  if (!user) return <p className="text-center mt-10">Loading...</p>;

  const handleGenerateQuiz = async () => {
    const currentTime = Date.now();
    const timeSinceLastGeneration = currentTime - lastGenerationTime;

    // Check if we are still in a cooldown period
    if (timeSinceLastGeneration < COOLDOWN_PERIOD_MS) {
      const remainingSeconds = Math.ceil((COOLDOWN_PERIOD_MS - timeSinceLastGeneration) / 1000);
      alert(`Please wait ${remainingSeconds} seconds before generating another quiz to avoid hitting API limits.`);
      setCooldownRemaining(remainingSeconds); // Reset cooldown display if user tried too soon
      return; // Prevent making the API call
    }

    setIsGenerating(true); // Disable button
    setCooldownRemaining(Math.ceil(COOLDOWN_PERIOD_MS / 1000)); // Start cooldown display immediately

    try {
      const quizData = await generateQuiz(level);
      setLastGenerationTime(Date.now()); // Record time of successful generation
      navigate('/quiz', { state: { quizData } });
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      alert('Failed to generate quiz. Please try again later. (This might be due to API limits)'); // Inform the user
      // Even on error, we assume a call was made and enforce cooldown
      setLastGenerationTime(Date.now());
    } finally {
      setIsGenerating(false); // Re-enable button (after cooldown)
      // The cooldownRemaining state will handle the countdown
    }
  };

  const isButtonDisabled = isGenerating || cooldownRemaining > 0;

 return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
    <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md animate-fade-in-up transition-all duration-500">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        👋 Hello, {user.name}
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Level:
        </label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          disabled={isGenerating}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
        >
          <option value="easy">🟢 Easy</option>
          <option value="medium">🟡 Medium</option>
          <option value="hard">🔴 Hard</option>
        </select>
      </div>

      <button
        onClick={handleGenerateQuiz}
        disabled={isButtonDisabled}
        className={`w-full py-2 rounded-lg font-semibold shadow-md transition-all duration-300 ${
          isButtonDisabled
            ? 'bg-gray-300 cursor-not-allowed text-gray-600'
            : 'bg-green-600 hover:bg-lime-400 text-white'
        }`}
      >
        {isGenerating
          ? '✨ Generating Quiz...'
          : cooldownRemaining > 0
          ? `⏳ Wait ${cooldownRemaining}s`
          : '🎯 Generate Quiz'}
      </button>

      {cooldownRemaining > 0 && !isGenerating && (
        <p className="text-sm text-red-600 mt-3 text-center animate-pulse">
          You can generate another quiz in {cooldownRemaining} seconds.
        </p>
      )}

      <button
        onClick={logout}
        className="w-full bg-yellow-800 hover:bg-red-400 text-white py-2 rounded-lg mt-6 shadow-md transition duration-300"
      >
        🚪 Logout
      </button>
    </div>
  </div>
);

}

export default DashboardPage;