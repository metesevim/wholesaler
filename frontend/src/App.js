import React, { useState } from 'react';
import './App.css';

// FRESH SERVER - Changes should now be reflected immediately
function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleAuth = () => {
    if (!username || !password) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    if (isLogin) {
      setMessage(`Logging in as ${username}...`);
      setMessageType('success');
    } else {
      setMessage(`Account created for ${username}!`);
      setMessageType('success');
    }

    setTimeout(() => {
      setUsername('');
      setPassword('');
      setMessage('');
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage('');
    setUsername('');
    setPassword('');
  };

  return (
      <div className="min-h-screen bg-[#101922] grid grid-cols-1 lg:grid-cols-2">
        {/* Left Pane - Image */}
        <div className="relative hidden lg:flex flex-col justify-end bg-[#111a22] p-8">
          <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&auto=format&fit=crop')"
              }}
          >
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          <div className="relative z-10 flex flex-col gap-4 text-white">
            <div className="flex items-center gap-3">

              <p className="text-2xl font-bold">Wholesale Hub - Horecaline</p>
            </div>
            <h1 className="text-4xl font-black leading-tight">Your Partner in Wholesale Efficiency</h1>
            <p className="text-base text-white/80">Log in to access your dashboard and manage your operations
              seamlessly.</p>
          </div>
        </div>

        {/* Right Pane - Form */}
        <div className="flex flex-col items-center justify-center bg-[#101922] p-6 sm:p-8">
          <div className="flex w-full max-w-md flex-col gap-8">
            {/* Heading */}
            <div className="flex flex-col gap-3">
              <p className="text-3xl font-black text-white">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </p>
              <p className="text-base text-[#92adc9]">
                {isLogin ? 'Log in to your Wholesaler Assistant account.' : 'Sign up for a new Wholesaler Assistant account.'}
              </p>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-6">
              {/* Username Field */}
              <label className="flex flex-col w-full">
                <p className="pb-2 text-sm font-medium text-white">Username or Email</p>
                <div className="relative w-full">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="h-12 w-full rounded-lg border border-[#324d67] bg-[#192633] pl-10 pr-4 text-base text-white placeholder-[#92adc9] focus:border-[#137fec] focus:outline-none"
                      placeholder="Enter your username or email"
                  />
                </div>
              </label>

              {/* Password Field */}
              <label className="flex flex-col w-full">
                <p className="pb-2 text-sm font-medium text-white">Password</p>
                <div className="relative w-full">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="h-12 w-full rounded-lg border border-[#324d67] bg-[#192633] pl-10 pr-10 text-base text-white placeholder-[#92adc9] focus:border-[#137fec] focus:outline-none"
                      placeholder="Enter your password"
                  />
                  <button
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#92adc9] hover:text-white transition-colors"
                  >
                    {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                  </button>
                </div>
              </label>

              {/* Message */}
              {message && (
                  <div className={`p-3 rounded-lg text-sm ${
                      messageType === 'error'
                          ? 'bg-red-900/20 text-red-400 border border-red-800/50'
                          : 'bg-green-900/20 text-green-400 border border-green-800/50'
                  }`}>
                    {message}
                  </div>
              )}

              {/* Forgot Password */}
              <p className="text-sm font-medium text-[#137fec] underline hover:text-[#1a8fff] cursor-pointer self-start">
                Forgot Password?
              </p>

              {/* Submit Button */}
              <button
                  onClick={handleAuth}
                  className="h-12 w-full rounded-lg bg-[#137fec] text-base font-bold text-white transition-colors hover:bg-[#1a8fff]"
              >
                {isLogin ? 'Login' : 'Sign Up'}
              </button>

              {/* Toggle Mode */}
              <p className="text-sm text-center text-[#92adc9]">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span onClick={toggleMode} className="font-medium text-[#137fec] underline hover:text-[#1a8fff] cursor-pointer">
                {isLogin ? 'Sign Up' : 'Login'}
              </span>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}

export default App;