import React, { useState, useContext, useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { generateQuiz } from '../api/quizApi';

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Hello, {user.name}</h2>
        <div className="mb-4">
          <label className="block mb-2">Select Level:</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isGenerating} // Disable select while generating
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <button
          onClick={handleGenerateQuiz}
          className={`w-full p-2 rounded mb-4 ${
            isButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
          disabled={isButtonDisabled}
        >
          {isGenerating
            ? 'Generating Quiz...'
            : cooldownRemaining > 0
              ? `Please wait ${cooldownRemaining}s`
              : 'Generate Quiz'}
        </button>

        {/* Optional: Add a more prominent message if the user hits the cooldown */}
        {cooldownRemaining > 0 && !isGenerating && (
          <p className="text-sm text-red-600 mt-2 text-center">
            You can generate another quiz in {cooldownRemaining} seconds.
          </p>
        )}

        <button
          onClick={logout}
          className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;