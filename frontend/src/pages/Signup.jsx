// Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [codeNameStatus, setCodeNameStatus] = useState('');
  const [error, setError] = useState('');
  const [verificationMode, setVerificationMode] = useState(false);

  const checkCodeNameAvailability = async (e) => {
    const codename = e.target.value.trim();
    if (!codename) {
      setCodeNameStatus('');
      return;
    }
    try {
      const res = await fetch(`https://shadow-system.vercel.app/api/check-codename?codename=${encodeURIComponent(codename)}`);
      const data = await res.json();
      if (!res.ok) {
        setCodeNameStatus('Error checking availability.');
      } else {
        setCodeNameStatus(data.available ? 'Code name is available.' : 'Code name is already taken.');
      }
    } catch (err) {
      console.error(err);
      setCodeNameStatus('Network error.');
    }
  };

  const initiateProtocol = async (e) => {
    e.preventDefault();
    setError('');
    const form = e.target;
    const codename = form.codename.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;

    // Ensure codename is available before proceeding.
    if (!codename || codeNameStatus.toLowerCase().includes('taken')) {
      setError('Please choose an available codename.');
      return;
    }

    try {
      const res = await fetch('https://shadow-system.vercel.app/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codename, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        // Switch to verification mode
        setVerificationMode(true);
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    }
  };

  const updateStrength = (e) => {
    const password = e.target.value;
    const strengthBar = document.querySelector('.password-strength');
    const strength = Math.min(password.length * 10, 100);
    if (strengthBar) {
      strengthBar.style.width = strength + '%';
      strengthBar.style.background =
        strength < 50 ? '#ef4444' : strength < 75 ? '#f59e0b' : '#10b981';
    }
  };

  const checkPassword = () => {
    const pass = document.getElementById('password')?.value;
    const confirmPass = document.getElementById('confirm-password')?.value;
    const matchText = document.getElementById('password-match');
    if (pass && confirmPass && matchText) {
      if (pass === confirmPass) {
        matchText.textContent = 'CIPHERS SYNCHRONIZED ✓';
        matchText.style.color = '#10b981';
      } else {
        matchText.textContent = 'CIPHER MISMATCH ⚠';
        matchText.style.color = '#ef4444';
      }
      matchText.classList.remove('invisible');
    }
  };

  if (verificationMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <h2 className="text-2xl mb-4">Verify Your Email</h2>
        <p className="mb-6">
          A verification email has been sent in the name of Shadow.<br />
          Please check your inbox—and if you don't see it, check your spam folder.
        </p>
        <button
          onClick={() => navigate('/signin')}
          className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded font-bold"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black grid-pattern min-h-screen flex items-center justify-center">
      <div className="cyber-border p-8 max-w-md w-full mx-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1
              className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold mb-4"
              style={{ fontFamily: "'Agency FB'", textShadow: '0 0 10px #3b82f6' }}
            >
              NEXUS GATE
            </h1>
            <p className="text-blue-400 text-sm mb-4">Initiate Protocol 0x7A3F</p>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-6"></div>
          </div>

          {error && <p className="text-center text-red-500 mb-4">{error}</p>}

          <form className="space-y-6" onSubmit={initiateProtocol}>
            <div>
              <label className="block text-blue-400 text-sm mb-2">CODENAME</label>
              <input
                type="text"
                name="codename"
                className="cyber-input w-full p-3 text-sm"
                placeholder="Enter your neural interface ID"
                onBlur={checkCodeNameAvailability}
                required
              />
              {codeNameStatus && (
                <p
                  className="text-xs mt-1"
                  style={{ color: codeNameStatus.toLowerCase().includes('available') ? '#10b981' : '#ef4444' }}
                >
                  {codeNameStatus}
                </p>
              )}
            </div>

            <div>
              <label className="block text-blue-400 text-sm mb-2">CRYPTIC SIGNAL</label>
              <input
                type="email"
                name="email"
                className="cyber-input w-full p-3 text-sm"
                placeholder="transmission@nexus.gate"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-blue-400 text-sm mb-2">CIPHER SEQUENCE</label>
              <input
                type="password"
                name="password"
                id="password"
                className="cyber-input w-full p-3 text-sm"
                placeholder="••••••••"
                onInput={updateStrength}
                required
              />
              <div className="password-strength mt-1 bg-blue-500"></div>
            </div>

            <div>
              <label className="block text-blue-400 text-sm mb-2">CONFIRM CIPHER</label>
              <input
                type="password"
                id="confirm-password"
                className="cyber-input w-full p-3 text-sm"
                placeholder="••••••••"
                onInput={checkPassword}
                required
              />
              <p id="password-match" className="text-right text-xs mt-1 invisible"></p>
            </div>

            <button
              type="submit"
              className="cyber-button w-full text-black font-bold py-3 px-6 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 active:transform active:translate-y-1"
            >
              INITIALIZE CONNECTION
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-400 text-sm">
              Existing construct?{' '}
              <a href="/signin" className="text-purple-400 hover:text-purple-300 underline">
                Access Neural Link
              </a>
            </p>
          </div>
        </div>
      </div>
      <div id="matrix" className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-10 z-[-1]"></div>
    </div>
  );
};

export default Signup;
