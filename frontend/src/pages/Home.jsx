import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import '../styles/home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auto-close auth modal when user signs in.
  useEffect(() => {
    if (user) {
      setShowAuthModal(false);
    }
  }, [user]);

  // Typewriter effect for warning text.
  useEffect(() => {
    const warningElement = document.getElementById('warningText');
    const warningText = "⚠ FRACTURED TIMELINE: SHADOW WARRIOR 2137, YOUR MISSION BEGINS ⚠";
    let index = 0;
    let timeoutId;
    if (warningElement) {
      warningElement.textContent = "";
      function typeWriter() {
        if (index < warningText.length) {
          warningElement.textContent += warningText.charAt(index);
          index++;
          timeoutId = setTimeout(typeWriter, 50);
        }
      }
      typeWriter();
    }
    return () => clearTimeout(timeoutId);
  }, []);

  // Arrow key scrolling effect.
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid interfering with form inputs.
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowUp') {
        window.scrollBy({ top: -100, behavior: 'smooth' });
      } else if (e.key === 'ArrowDown') {
        window.scrollBy({ top: 100, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Clicking the button will navigate to the game if signed in; otherwise, open the auth modal.
  const handleEnterWorld = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      navigate('/game');
    }
  };

  return (
    <>
      <Header />
      <main className="donation-bg pt-32 pb-20 px-6 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-8">
            {/* Warning text with typewriter effect; neon effect removed for plain red color */}
            <div id="warningText" className="cyber-text text-2xl md:text-3xl text-red-400 mb-8"></div>
            {/* Always show the "Enter the World" button below the warning text */}
            <button
              className="enter-world-button text-lg font-bold text-blue-400 animate-pulse"
              onClick={handleEnterWorld}
            >
              Enter the World
            </button>
          </div>
          {/* Display additional game content only when the user is signed in */}
          {user && (
            <div className="space-y-12">
              <section className="opacity-0 animate-fade-in delay-500">
                <p className="text-xl text-blue-300 leading-relaxed">
                  You are not here to merely exist.<br />
                  You are a warrior of the Shadow System from 2137, destined to mend a fractured timeline. 
                  <span className="inline-block animate-float">🌀</span>
                </p>
              </section>
              <section className="opacity-0 animate-fade-in delay-1000">
                <p className="text-xl text-blue-300 leading-relaxed">
                  Temporal rifts have shattered reality. In this broken continuum, you'll negotiate and even barter with foes—each encounter adapting to your choices.
                  <span className="inline-block animate-float">⚡</span>
                </p>
              </section>
              <section className="opacity-0 animate-fade-in delay-1500">
                <div className="space-y-6">
                  <h3 className="text-2xl gradient-text">
                    First Destination:
                    <span className="text-purple-400"> The Arcane Enclave</span>
                  </h3>
                  <p className="text-lg text-blue-300">
                    <span className="inline-block animate-float emoji">✨</span> Step into a realm where wizards and mages command ancient magic and guard timeless secrets. Here, you must negotiate with mystical beings to harness their arcane power and begin restoring time.
                  </p>
                </div>
              </section>
              <section className="opacity-0 animate-fade-in delay-2000">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div className="glass-effect p-6 rounded-xl hover:border-purple-400/50 transition-colors">
                    <div className="text-4xl mb-4 animate-float">🤖</div>
                    <h4 className="gradient-text text-lg mb-2">Shadow Sentience</h4>
                    <p className="text-blue-300">Ancient intelligence guides you through the chaos.</p>
                  </div>
                  <div className="glass-effect p-6 rounded-xl hover:border-purple-400/50 transition-colors">
                    <div className="text-4xl mb-4 animate-float">🧠</div>
                    <h4 className="gradient-text text-lg mb-2">Adaptive Adversary</h4>
                    <p className="text-blue-300">Face AI-controlled foes that evolve with every decision you make.</p>
                  </div>
                  <div className="glass-effect p-6 rounded-xl hover:border-purple-400/50 transition-colors">
                    <div className="text-4xl mb-4 animate-float">⏳</div>
                    <h4 className="gradient-text text-lg mb-2">Temporal Flux</h4>
                    <p className="text-blue-300">Every action sends ripples through the broken continuum.</p>
                  </div>
                </div>
              </section>
              <section className="opacity-0 animate-fade-in delay-2500">
                <div className="text-center">
                  <h4 className="gradient-text text-2xl mb-4">THE ENIGMA OF THE FRACTURED TIMELINE</h4>
                  <p className="text-lg text-blue-300 leading-relaxed">
                    In the labyrinth of shattered time, secrets are bartered like currency and AI-controlled adversaries adjust to your every move. Only a warrior from the Shadow System can restore the flow of history.
                  </p>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};

export default Home;
