import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const Header = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Always display header. If no user, show "*******" as the display name.
  const displayName =
    user && user.user_metadata && user.user_metadata.display_name
      ? user.user_metadata.display_name
      : "*******";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/home');
  };

  return (
    <>
      {/* Inline CSS for neon glow animation */}
      <style>
        {`
          @keyframes neon {
            0% {
              color: #00f;
              text-shadow: 0 0 5px #00f, 0 0 10px #00f, 0 0 20px #00f;
            }
            50% {
              color: #0ff;
              text-shadow: 0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff;
            }
            100% {
              color: #00f;
              text-shadow: 0 0 5px #00f, 0 0 10px #00f, 0 0 20px #00f;
            }
          }
          .neon-text {
            animation: neon 3s infinite;
            font-weight: bold;
          }
        `}
      </style>
      <header className="fixed w-full bg-black/90 backdrop-blur-md z-50 border-b border-blue-500/30">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="cyber-text text-2xl gradient-text">SHADOWRIFTERS</h1>
          <div className="flex items-center space-x-4">
            {/* Display the profile name (or "*******" if not signed in) with neon glow */}
            <div className="neon-text text-2xl">
              {displayName}
            </div>
            {/* Only show the menu if the user is signed in */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setMenuVisible(!menuVisible)}
                  className="text-blue-400 hover:text-purple-400 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                {menuVisible && (
                  <div className="absolute right-0 mt-2 bg-black/90 backdrop-blur-lg rounded-lg p-4 space-y-3 border border-blue-500/30 animate-fade-in">
                    <Link
                      to="/home"
                      className="block text-blue-400 hover:text-purple-400 px-4 py-2 rounded transition-all hover:bg-blue-900/20"
                    >
                      Home
                    </Link>
                    <Link
                      to="/pre_game_stuff"
                      className="block text-blue-400 hover:text-purple-400 px-4 py-2 rounded transition-all hover:bg-blue-900/20"
                    >
                      Game
                    </Link>
                    <Link
                      to="/performance"
                      className="block text-blue-400 hover:text-purple-400 px-4 py-2 rounded transition-all hover:bg-blue-900/20"
                    >
                      Performance
                    </Link>
                    <Link
                      to="/leaderboard"
                      className="block text-blue-400 hover:text-purple-400 px-4 py-2 rounded transition-all hover:bg-blue-900/20"
                    >
                      Leaderboard
                    </Link>
                    <Link
                      to="/feedback"
                      className="block text-blue-400 hover:text-purple-400 px-4 py-2 rounded transition-all hover:bg-blue-900/20"
                    >
                      Feedback
                    </Link>
                    <Link
                      to="/donate"
                      className="block text-blue-400 hover:text-purple-400 px-4 py-2 rounded transition-all hover:bg-blue-900/20"
                    >
                      Donate
                    </Link>
                    <Link
                      to="/updates"
                      className="block text-blue-400 hover:text-purple-400 px-4 py-2 rounded transition-all hover:bg-blue-900/20"
                    >
                      Updates
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left text-blue-400 hover:text-purple-400 px-4 py-2 rounded transition-all hover:bg-blue-900/20"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
