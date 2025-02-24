// Signin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../styles/signin.css';

const Signin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const matrix = document.getElementById('matrix');
    const chars = '01';
    const interval = setInterval(() => {
      if (matrix) {
        matrix.innerHTML = Array(60).fill()
          .map(() =>
            `<span class="text-green-500" style="opacity:${Math.random()}; margin-left:${Math.random() * 100}%">
              ${chars[Math.floor(Math.random() * chars.length)]}
             </span>`
          )
          .join('');
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const authenticateUser = async (e) => {
    e.preventDefault();
    setError('');
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="bg-black grid-pattern min-h-screen flex items-center justify-center relative">
      <div className="cyber-border p-8 max-w-md w-full mx-4 relative z-10 bg-gray-900 bg-opacity-80 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
            style={{ fontFamily: "'Agency FB'", textShadow: '0 0 10px #3b82f6' }}
          >
            NEXUS GATE
          </h1>
          <p className="text-blue-400 text-sm mb-4">Access Neural Network</p>
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-6"></div>
        </div>
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}
        <form className="space-y-6" onSubmit={authenticateUser}>
          <div>
            <label className="block text-blue-400 text-sm mb-2">Email</label>
            <input
              type="email"
              name="email"
              className="cyber-input w-full p-3 text-sm rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-blue-400 text-sm mb-2">Cipher Sequence</label>
            <input
              type="password"
              name="password"
              className="cyber-input w-full p-3 text-sm rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="mr-2"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              <label htmlFor="remember" className="text-blue-400 text-sm">
                Remember Me
              </label>
            </div>
            <a href="#" className="text-purple-400 hover:text-purple-300 underline text-sm">
              Forgot Password?
            </a>
          </div>
          <button
            type="submit"
            className="cyber-button w-full text-black font-bold py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-md hover:from-blue-500 hover:to-purple-500 transition transform active:translate-y-1"
          >
            AUTHENTICATE
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-blue-400 text-sm">
            New construct?{' '}
            <a href="/signup" className="text-purple-400 hover:text-purple-300 underline">
              Initiate Protocol
            </a>
          </p>
        </div>
      </div>
      <div id="matrix" className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 z-0"></div>
    </div>
  );
};

export default Signin;
