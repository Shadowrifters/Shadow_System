import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import '../styles/analysis.css';
import { supabase } from '../supabaseClient';

const AnalysisPage = () => {
  // In a real app, the transcript should come from your game’s conversation.
  // Here we set a default dummy transcript.
  const [transcript] = useState("This is the user's game conversation transcript.");
  
  const [user, setUser] = useState(null);
  const [analysisResponse, setAnalysisResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // First, retrieve the current user from Supabase auth.
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setError("User not signed in.");
        setLoading(false);
        return;
      }
      setUser(user);
    };
    fetchUser();
  }, []);

  // Once the user is available, call the analysis endpoint only once.
  useEffect(() => {
    if (!user) return;
    const displayName = user.user_metadata?.display_name;
    if (!displayName) {
      setError("Display name not set. Please complete registration.");
      setLoading(false);
      return;
    }
    const fetchAnalysis = async () => {
      try {
        const res = await fetch('https://shadow-system.vercel.app/api/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript, displayName })
        });
        const json = await res.json();
        if (json.status === 'success') {
          setAnalysisResponse(json);
        } else {
          setError(json.error || 'Analysis failed.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    // Call only once when the user is loaded.
    fetchAnalysis();
  }, [user]); // no transcript dependency so that the call is not repeated

  if (loading) {
    return (
      <div className="matrix-bg min-h-screen text-white">
        <Header />
        <div className="pt-24 px-4 pb-8 text-center">
          Loading analysis...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matrix-bg min-h-screen text-white">
        <Header />
        <div className="pt-24 px-4 pb-8 text-center">
          Error: {error}
        </div>
      </div>
    );
  }

  // analysisResponse is expected to contain:
  // - data: the updated DB record with score data
  // - fullAnalysis: the complete JSON output from the analysis AI (with feedback)
  const { data: dbData, fullAnalysis } = analysisResponse;
  const overallScore = fullAnalysis.overallScore || dbData.overall_score;

  // Remove overallScore from the metrics object so it isn’t rendered twice.
  const metrics = { ...fullAnalysis };
  delete metrics.overallScore;

  return (
    <div className="matrix-bg min-h-screen text-white">
      <Header />
      <div className="pt-24 px-4 pb-8">
        <div className="top-text-container">
          <h1 className="cyber-text gradient-text text-3xl">Sales Conversation Analysis</h1>
          <p className="text-white">Overall Score: {overallScore}</p>
        </div>
        <div className="metrics-list">
          {Object.keys(metrics).map((metricKey) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
