// Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../styles/leaderboard.css';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    async function fetchLeaderboardData() {
      try {
        const response = await fetch('http://localhost:5000/api/leaderboard');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    }
    fetchLeaderboardData();
  }, []);

  // Sort descending by SELO points
  const sortedData = leaderboardData.sort((a, b) => b.selo_points - a.selo_points);
  // Get top three entries for the podium stage.
  const podium = sortedData.slice(0, 3);

  return (
    <div className="min-h-screen leaderboard-bg text-white">
      <Header />
      <div className="pt-24 px-4 pb-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text animate-fade-in">
            Riftes Leaderboard
          </h1>
          <p className="text-xl text-blue-300 mt-4 hover-glow">
            Who dominates the SELO points?
          </p>
        </div>

        {/* Podium Stage */}
        <div className="flex justify-center items-end mb-12 podium-stage">
          {podium.length > 0 && (
            <>
              <div className="podium-item mx-4 flex flex-col items-center">
                <div className="podium-label text-xl font-semibold text-blue-300 hover-glow">
                  {podium[1]?.display_name || ""}
                </div>
                <div className="podium-rect" style={{ height: '80px', width: '100px' }}></div>
                <div className="text-3xl mt-2">🥈</div>
              </div>
              <div className="podium-item mx-4 flex flex-col items-center">
                <div className="podium-label text-xl font-semibold text-blue-300 hover-glow">
                  {podium[0]?.display_name || ""}
                </div>
                <div className="podium-rect" style={{ height: '120px', width: '100px' }}></div>
                <div className="text-3xl mt-2">🥇</div>
              </div>
              <div className="podium-item mx-4 flex flex-col items-center">
                <div className="podium-label text-xl font-semibold text-blue-300 hover-glow">
                  {podium[2]?.display_name || ""}
                </div>
                <div className="podium-rect" style={{ height: '60px', width: '100px' }}></div>
                <div className="text-3xl mt-2">🥉</div>
              </div>
            </>
          )}
        </div>

        {/* Leaderboard Table: List all users including top three */}
        <div className="max-w-4xl mx-auto">
          <table className="w-full leaderboard-table">
            <thead>
              <tr className="border-b border-blue-600">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">SELO Points</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((user, index) => (
                <tr
                  key={user.id}
                  className="transition-transform duration-300 transform hover:scale-105 hover-glow"
                >
                  <td className="py-3 px-4 border-b border-blue-600">{index + 1}</td>
                  <td className="py-3 px-4 border-b border-blue-600 flex items-center space-x-2">
                    <span className="text-2xl">👤</span>
                    <span className="font-medium">{user.display_name}</span>
                  </td>
                  <td className="py-3 px-4 border-b border-blue-600">{user.selo_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
