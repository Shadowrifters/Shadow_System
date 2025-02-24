import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/authmodal.css'; // Import the custom CSS

const AuthModal = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black/80 z-50 grid-pattern">
      <div className="modal cyber-border p-6 rounded-lg shadow-lg relative w-11/12 max-w-md">
        <button
          className="absolute top-2 right-2 text-white text-xl"
          onClick={onClose}
        >
          &#x2715;
        </button>
        <div className="flex flex-col items-center space-y-6 mt-4">
          <button
            className="w-full text-white py-2 rounded cyber-button"
            onClick={() => navigate('/signin')}
          >
            Sign In
          </button>
          <button
            className="w-full text-white py-2 rounded cyber-button"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
