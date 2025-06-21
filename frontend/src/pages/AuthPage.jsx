import React, { useState, useContext } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../auth/AuthContext';

function AuthPage() {
  const { login, googleLogin } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(err);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      await googleLogin(response.credential);
    } catch (err) {
      setError(err);
    }
  };

  return (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-stone-500 via-fuchsia-200 to-stone-500">
    <div className="bg-white px-10 py-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 className="text-2xl font-extrabold text-center text-fuchsia-950 mb-6">Login to Visit Dashboard</h2>

      {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

      <div className="mb-6">
        <GoogleOAuthProvider clientId="845596916456-0jo02etn3adbko3sn780192trp46tv35.apps.googleusercontent.com">
          <div className="flex justify-center">
            <div className="rounded-full overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed')}
            theme="filled_black"
            size="large"
            shape="pill"
            width="280"
        />
      </div>
    </div>
  </GoogleOAuthProvider>
</div>


      <div className="flex items-center justify-between mb-6">
        <hr className="border-t border-gray-300 w-full" />
        <span className="px-3 text-gray-500 text-sm font-medium">OR</span>
        <hr className="border-t border-gray-300 w-full" />
      </div>

      <div className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-stone-600 hover:bg-fuchsia-900 text-white font-semibold py-2 rounded-md shadow-md transition duration-300"
        >
          Login / Sign Up
        </button>
      </div>
    </div>
  </div>
);

}

export default AuthPage;