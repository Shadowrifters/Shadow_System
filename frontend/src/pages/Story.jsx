import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/story.css';

const Story = () => {
  const [storyText, setStoryText] = useState("");
  const [displayed, setDisplayed] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef(null);
  const skipRef = useRef(false);
  const navigate = useNavigate();

  // Retrieve scenario options from localStorage (saved by Pre_Game)
  const savedScenario = JSON.parse(localStorage.getItem("savedScenario") || "{}");

  useEffect(() => {
    async function fetchStory() {
      try {
        const res = await fetch('https://shadow-system.vercel.app/api/story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenarioOptions: savedScenario })
        });
        const data = await res.json();
        setStoryText(data.story);
      } catch (error) {
        console.error("Error fetching story:", error);
        setStoryText("An error occurred while generating the story.");
      }
    }
    fetchStory();
  }, [savedScenario]);

  useEffect(() => {
    if (!storyText) return;
    // Reset skip flag when a new storyText is loaded.
    skipRef.current = false;
    let index = 0;
    intervalRef.current = setInterval(() => {
      // If skip has been triggered, do nothing further.
      if (skipRef.current) {
        clearInterval(intervalRef.current);
        return;
      }
      // If finished, clear the interval.
      if (index >= storyText.length) {
        setIsComplete(true);
        clearInterval(intervalRef.current);
      } else {
        setDisplayed(prev => prev + storyText.charAt(index));
        index++;
      }
    }, 50); // Adjust typing speed as needed
    return () => clearInterval(intervalRef.current);
  }, [storyText]);

  const handleSkip = () => {
    // Signal to the interval callback to stop adding characters.
    skipRef.current = true;
    clearInterval(intervalRef.current);
    setDisplayed(storyText);
    setIsComplete(true);
  };

  const handlePlay = () => {
    navigate("/game");
  };

  return (
    <div className="story-page">
      <Header />
      <div className="story-content">
        <pre className="typewriter" style={{ color: 'limegreen' }}>
          {displayed}
          {!isComplete && <span className="cursor">|</span>}
        </pre>
        {isComplete && (
          <div className="play-container">
            <button className="play-button" onClick={handlePlay}>
              Play
            </button>
          </div>
        )}
      </div>
      {/* Only display Skip button while the text is still being typed */}
      {!isComplete && (
        <button className="skip-button" onClick={handleSkip}>
          Skip
        </button>
      )}
    </div>
  );
};

export default Story;
