'use client';

import { useState } from 'react';

export default function StaffLogin() {
  // state variables
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // handle login form submission
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // clear previous error message
    setError('');

    if (!staffId.trim()) {
      setError('Please enter your Staff ID or Email');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    //disable form controls while login request is process
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Login attempt:', { staffId, password });

      // display login message
      alert(`Login successful for ${staffId}`);
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // forget password
  const handleForgotPassword = () => {
    alert('Redirect to password reset page');
  };

  //page design
  return (
    <div className="min-h-screen bg-gray-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 md:p-10">
        {/* Title */}
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-900">
          Department Staff login
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Staff ID / Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="staffId"
              className="block text-lg font-semibold text-gray-900"
            >
              Staff ID/ Email
            </label>
            <input
              id="staffId"
              type="text"
              placeholder="enter your staffID or email"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors disabled:opacity-50"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-lg font-semibold text-gray-900"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors disabled:opacity-50 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 text-xl"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-full transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className="mt-8 text-center">
          <button
            onClick={handleForgotPassword}
            className="text-gray-900 font-semibold hover:text-blue-600 transition-colors text-lg"
          >
            Forget Password
          </button>
        </div>
      </div>
    </div>
  );
}
