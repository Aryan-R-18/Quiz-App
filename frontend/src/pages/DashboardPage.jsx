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
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-stone-500 via-fuchsia-200 to-stone-500 px-4">
    <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md animate-fade-in-up transition-all duration-500">
      <h2 className="text-3xl font-bold text-center text-stone-700 mb-8 tracking-tight">
        👋 Welcome, {user.name}
      </h2>

      {/* Level Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-pink-950 mb-2">
          Select Difficulty Level:
        </label>
        <div className="relative">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            disabled={isGenerating}
            className="appearance-none w-full bg-gray-50 border border-gray-300 text-gray-800 px-4 py-2 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition cursor-pointer disabled:opacity-60"
          >
            <option value="easy">🟢 Easy</option>
            <option value="medium">🟡 Medium</option>
            <option value="hard">🔴 Hard</option>
          </select>
          <div className="absolute top-2.5 right-3 pointer-events-none text-gray-500">
            ▼
          </div>
        </div>
      </div>

      {/* Generate Quiz Button */}
      <button
        onClick={handleGenerateQuiz}
        disabled={isButtonDisabled}
        className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 text-white ${
          isButtonDisabled
            ? 'bg-gray-300 cursor-not-allowed text-gray-600'
            : 'bg-gradient-to-r from-stone-500 to-fuchsia-600 hover:from-fuchsia-400 hover:to-stone-400'
        }`}
      >
        {isGenerating
          ? '✨ Generating Quiz...'
          : cooldownRemaining > 0
          ? `⏳ Wait ${cooldownRemaining}s`
          : '🎯 Generate Quiz'}
      </button>

      {/* Cooldown Notice */}
      {cooldownRemaining > 0 && !isGenerating && (
        <p className="text-sm text-red-600 mt-4 text-center animate-pulse">
          You can generate another quiz in {cooldownRemaining} seconds.
        </p>
      )}

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full bg-gradient-to-r from-fuchisa-500 to-stone-600 hover:from-stone-700 hover:to-fuchsia-400 text-white font-semibold py-3 mt-6 rounded-xl shadow-lg transition duration-300"
      >
        🚪 Logout
      </button>
    </div>
  </div>
);

}

export default DashboardPage;