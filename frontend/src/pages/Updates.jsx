import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../styles/update.css';

const updates = [
  {
    id: 1,
    title: "Choose Your Arcane Avatar",
    date: "Coming Soon",
    summary: "Select your fighter from a mystical trio: Lightning Mage, Fire Wizard, or Wanderer Magician.",
    details: "Harness elemental forces and step into a realm where magic collides with machinery to define your destiny."
  },
  {
    id: 2,
    title: "Unleash Cybernetic Fury",
    date: "Coming Soon",
    summary: "Experience next-gen attack powers that shatter the digital frontier.",
    details: "Unleash explosive, unique abilities designed to rewrite the rules of combat in a cybernetic arena."
  },
  {
    id: 3,
    title: "Cyberpunk Vanguard",
    date: "Coming Soon",
    summary: "New cyberpunk characters join the fray, blurring the line between man and machine.",
    details: "Embrace edgy designs and unpredictable personas as rebellious avatars take center stage."
  },
  {
    id: 4,
    title: "Streamlined Digital Odyssey",
    date: "Coming Soon",
    summary: "Navigate a reimagined digital realm with an intuitive, fluid interface.",
    details: "Enjoy seamless transitions and effortless control as you traverse our cyber-enhanced universe."
  },
  {
    id: 5,
    title: "Immersive Analytics & Hyper-Real Scenarios",
    date: "Coming Soon",
    summary: "Dive into a world where data and drama collide.",
    details: "Engage with hyper-realistic scenarios powered by advanced analytics for an immersive cyber experience."
  },
  {
    id: 6,
    title: "Customizable Challenge Protocol",
    date: "Coming Soon",
    summary: "Tailor your journey with dynamic levels and adjustable difficulty settings.",
    details: "Customize your challenge to match your skill, ensuring every encounter is as exhilarating as it is unpredictable."
  },
  {
    id: 7,
    title: "Revamped Cyber Interface",
    date: "Coming Soon",
    summary: "Experience a sleek, futuristic overhaul of our user interface.",
    details: "A complete UI makeover that marries cutting-edge aesthetics with flawless functionality across all pages."
  },
  {
    id: 8,
    title: "Universal Authentication Matrix",
    date: "Coming Soon",
    summary: "Seamless sign up and sign in via Google, GitHub, LinkedIn, and more.",
    details: "Step into the digital frontier with frictionless access through a multitude of secure authentication channels."
  },
  {
    id: 9,
    title: "Intergalactic Interaction Hub",
    date: "Coming Soon",
    summary: "Step into an open world designed for dynamic player interactions.",
    details: "Connect, collaborate, and compete in real time within an expansive universe where every encounter counts."
  },
  {
    id: 10,
    title: "Enterprise-Grade Cyber Solutions",
    date: "Coming Soon",
    summary: "Premium features and robust tools for corporate integrations.",
    details: "Elevate your experience with enterprise-level enhancements built for high-end performance and quality."
  }
];

const UpdateItem = ({ update }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="update-card animate-fade-in">
      <h3 className="gradient-text">{update.title}</h3>
      <p className="update-date">{update.date}</p>
      <p>{update.summary}</p>
      {expanded && (
        <p className="update-details">
          {update.details}
        </p>
      )}
      <button className="read-more-btn" onClick={() => setExpanded(!expanded)}>
        {expanded ? "Show Less" : "Read More"}
      </button>
    </div>
  );
};

const Updates = () => {
  // Back to Top button functionality
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header />
      <div className="update-bg">
        <div className="update-container">
          <h1 className="update-title">Upcoming Digital Frontiers</h1>
          {updates.map((update) => (
            <UpdateItem key={update.id} update={update} />
          ))}
          {showTopBtn && (
            <button className="back-to-top-btn" onClick={scrollToTop}>
              Back to Top
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Updates;
