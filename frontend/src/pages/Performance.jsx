// Performance.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Bar, Radar } from 'react-chartjs-2';
import { supabase } from '../supabaseClient';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import '../styles/performance.css';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

// Guard for process.env (in case process is not defined in the browser)
const SERVER_BASE_URL =
  (typeof process !== "undefined" && process.env.VITE_SERVER_URL) ||
  "https://shadow-system.vercel.app";

const Performance = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error("No user found in supabase auth", error);
        return;
      }
      const dn = user.user_metadata.display_name;
      setDisplayName(dn);
    }
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!displayName) return;
    async function fetchPerformance() {
      try {
        const res = await fetch(`${SERVER_BASE_URL}/api/performance?display_name=${encodeURIComponent(displayName)}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setPerformanceData(data);
      } catch (error) {
        console.error("Error fetching performance data:", error);
      }
    }
    fetchPerformance();
  }, [displayName]);

  if (!performanceData) {
    return (
      <div className="min-h-screen matrix-bg text-white">
        <Header />
        <div className="pt-24 px-4 pb-8 text-center">
          <p>Loading performance data...</p>
        </div>
      </div>
    );
  }

  const fields = [
    { title: 'Overall Score', key: 'overall_score' },
    { title: 'Listening Skills', key: 'listening_score' },
    { title: 'Closing Technique', key: 'closing_score' },
    { title: 'Tone Confidence', key: 'tone_confidence_score' },
    { title: 'Objection Handling', key: 'objection_handling_score' },
    { title: 'Communication Clarity', key: 'communication_clarity_score' },
    { title: 'Follow-up / Next Steps', key: 'follow_up_score' },
    { title: 'Engagement & Interaction', key: 'engagement_score' },
    { title: 'Time Management & Pacing', key: 'time_management_score' },
    { title: 'Adaptability & Flexibility', key: 'adaptability_score' },
    { title: 'Discovery / Needs Analysis', key: 'discovery_score' },
    { title: 'Opening / Rapport Building', key: 'opening_score' },
    { title: 'Value Proposition Delivery', key: 'value_prop_score' },
  ];
  const labels = fields.map(field => field.title);
  const dataValues = fields.map(field => performanceData[field.key]);

  const barChartData = {
    labels,
    datasets: [
      {
        label: 'Performance Metrics',
        data: dataValues,
        backgroundColor: 'rgba(0, 191, 255, 0.3)',
        borderColor: 'rgba(0, 191, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#0ff' } },
      title: {
        display: true,
        text: 'Performance Overview',
        color: '#0ff',
        font: { size: 20 },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: { color: '#0ff' },
        grid: { color: 'rgba(0,191,255,0.15)' },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: '#0ff' },
        grid: { color: 'rgba(0,191,255,0.15)' },
      },
    },
  };

  const radarChartData = {
    labels,
    datasets: [
      {
        label: 'Performance Radar',
        data: dataValues,
        backgroundColor: 'rgba(0, 191, 255, 0.2)',
        borderColor: 'rgba(0, 191, 255, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(0, 191, 255, 1)',
      },
    ],
  };

  const radarChartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#0ff' } },
      title: {
        display: true,
        text: 'Performance Radar',
        color: '#0ff',
        font: { size: 20 },
      },
      tooltip: { enabled: true },
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: { color: '#0ff' },
        grid: { color: 'rgba(0,191,255,0.15)' },
        angleLines: { color: 'rgba(0,191,255,0.15)' },
      },
    },
  };

  return (
    <div className="min-h-screen matrix-bg text-white">
      <Header />
      <div className="pt-24 px-4 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-blue-400 hover-glow">
            Sales Combat Training Dashboard
          </h1>
          <p className="text-lg text-blue-300 hover-glow">
            Enter the arena, hone your skills, and conquer your sales targets.
          </p>
        </div>
        <div className="max-w-xl mx-auto mb-8 space-y-3">
          {fields.map((field, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-black bg-opacity-70 p-3 rounded border border-blue-600 transition-transform transform hover:scale-105 hover:shadow-xl"
            >
              <span className="font-medium text-blue-400 field-text hover-glow">
                {field.title}
              </span>
              <span className="text-2xl text-blue-300 field-text hover-glow">
                {performanceData[field.key]}
              </span>
            </div>
          ))}
        </div>
        <div className="max-w-3xl mx-auto space-y-8 mb-8">
          <div className="bg-black bg-opacity-70 p-4 rounded border border-blue-600 hover:border-blue-400 transition-colors">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
          <div className="bg-black bg-opacity-70 p-4 rounded border border-blue-600 hover:border-blue-400 transition-colors">
            <Radar data={radarChartData} options={radarChartOptions} />
          </div>
        </div>
        <footer className="text-center text-blue-400">
          <p>Play Count: {performanceData.play_count}</p>
          <p>
            Last Updated:{" "}
            {new Date(performanceData.updated_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Performance;
