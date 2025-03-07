import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import '../styles/analysis.css';

const AnalysisPage = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Log the session status on mount.
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        const name = session.user.user_metadata?.display_name || session.user.email || "Unknown User";
        console.log("User is signed in:", name);
      } else {
        console.log("User is not signed in.");
      }
    };
    checkSession();
  }, []);

  // Load final analysis from localStorage on component mount.
  useEffect(() => {
    try {
      const storedAnalysis = localStorage.getItem("finalAnalysis");
      console.log("Stored analysis from localStorage:", storedAnalysis);
      if (storedAnalysis) {
        const parsed = JSON.parse(storedAnalysis);
        // Use fullAnalysis if available.
        const analysis = parsed.fullAnalysis ? parsed.fullAnalysis : parsed;
        setAnalysisData(analysis);
      } else {
        setError("No analysis data available. Please finish a game to generate analysis.");
      }
    } catch (err) {
      console.error("Error parsing analysis data:", err);
      setError("Failed to load analysis data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handler for Play button: if user is signed in, navigate to game; otherwise, open auth modal.
  const handlePlayClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      navigate("/game");
    }
  };

  // Handler for Home button: navigate to home.
  const handleHomeClick = () => {
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="matrix-bg min-h-screen text-white">
        <Header />
        <div className="pt-24 px-4 pb-8 text-center">Loading analysis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matrix-bg min-h-screen text-white">
        <Header />
        <div className="pt-24 px-4 pb-8 text-center">Error: {error}</div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="matrix-bg min-h-screen text-white">
        <Header />
        <div className="pt-24 px-4 pb-8 text-center">No analysis data found.</div>
      </div>
    );
  }

  // Determine overallScore and metrics.
  const overallScore = analysisData.overallScore || (analysisData.data && analysisData.data.overall_score) || "N/A";
  const metrics = { ...analysisData };
  delete metrics.overallScore;
  if (metrics.data) delete metrics.data;

  return (
    <div className="matrix-bg min-h-screen text-white" style={{ position: "relative", paddingBottom: "100px" }}>
      <Header />
      <div className="pt-24 px-4 pb-8">
        <div className="top-text-container">
          <h1 className="cyber-text gradient-text text-3xl">Sales Conversation Analysis</h1>
          <p className="text-white">Overall Score: {overallScore}</p>
        </div>
        <div className="metrics-list">
          {metrics && Object.keys(metrics).length > 0 ? (
            Object.keys(metrics).map((metricKey) => (
              <div key={metricKey} className="metric-item">
                <h2 className="field-text text-xl hover-glow">{metricKey}</h2>
                <p>Score: {metrics[metricKey].score}</p>
                <p>Feedback: {metrics[metricKey].feedback}</p>
                {metrics[metricKey].commonObjections && (
                  <div>
                    <p>Common Objections:</p>
                    <ul className="list-disc ml-6">
                      {metrics[metricKey].commonObjections.map((objection, idx) => (
                        <li key={idx}>{objection}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No detailed metrics available.</p>
          )}
        </div>
      </div>
      {/* Floating Buttons */}
      <div className="floating-buttons">
        <button className="glass-button" onClick={handleHomeClick}>Home</button>
        <button className="enter-world-button" onClick={handlePlayClick}>Play</button>
      </div>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default AnalysisPage;
