import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export const generateQuiz = async (level) => {
  const response = await api.post('/quiz/generate', { level });
  return response.data;
};

export const submitQuiz = async (quizId, answers) => {
  const response = await api.post('/quiz/submit', {
    quiz_id: quizId,
    answers, // Ensure: { "0": 2, "1": 1, ... }
  });
  return response.data;
};

export const getBotResponse = async (quizId, questionIndex, question) => {
  const response = await api.post('/bot/ask', {
    quiz_id: quizId,
    question_index: questionIndex,
    question: question,
  });
  return response.data;
};
