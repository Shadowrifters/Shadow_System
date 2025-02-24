import React from 'react';
import Header from '../components/Header';
import '../styles/feedback.css';

const Feedback = () => {
  return (
    <div className="min-h-screen feedback-bg text-white">
      <Header />
      {/* Main container with top padding to prevent header overlap */}
      <div className="pt-24 px-4 pb-8">
        {/* Page Title and Description */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold gradient-text animate-fade-in hover-glow">
            Feedback
          </h1>
          <p className="text-xl text-blue-300 mt-4 hover-glow">
            We value your input – let us know what you think!
          </p>
        </div>
        {/* Responsive Iframe Container */}
        <div className="iframe-container mx-auto">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSdvSQvrIQVKSoSIXZIxtIwHWGp6IMTzZTd24oM33mfraitMMw/viewform?embedded=true"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            title="Feedback Form"
            className="responsive-iframe"
          >
            Loading…
          </iframe>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
