import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/steps.css';

// Define an array of crypto wallet apps (converted from your HTML template)
const apps = [
  { 
    name: "Coinbase Wallet", 
    img: "https://play-lh.googleusercontent.com/wrgUujbq5kbn4Wd4tzyhQnxOXkjiGqq39N4zBvCHmxpIiKcZw_Pb065KTWWlnoejsg=w240-h480-rw", 
    rating: "⭐ 4.3", 
    downloads: "5M+", 
    play: "https://play.google.com/store/apps/details?id=org.toshi", 
    appstore: "https://apps.apple.com/us/app/coinbase-wallet/id1278383455" 
  },
  { 
    name: "Trust Wallet", 
    img: "https://play-lh.googleusercontent.com/cd5BevWohRqLwsI2_i3k4YIVtcO57cIZCs6l20H1Hcdj0P2rFEcX_7QtgKbTM3Sn_A=s48-rw", 
    rating: "⭐ 4.6", 
    downloads: "50M+", 
    play: "https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp", 
    appstore: "https://apps.apple.com/us/app/trust-crypto-bitcoin-wallet/id1288339409" 
  },
  { 
    name: "Binance", 
    img: "https://play-lh.googleusercontent.com/T1_WHAGs5WZePQejNSqqrxZah4uhBvYr698nTCFhXMjMZo5oSCoko5yW2wtmeO1ClRU=s48-rw", 
    rating: "⭐ 4.5", 
    downloads: "100M+", 
    play: "https://play.google.com/store/apps/details?id=com.binance.dev", 
    appstore: "https://apps.apple.com/us/app/binance-buy-bitcoin-crypto/id1436799971" 
  },
  { 
    name: "MetaMask", 
    img: "https://play-lh.googleusercontent.com/8rzHJpfkdFwA0Lo6_CHUjoNt8OU3EyIe9BZNKGqj0C8BhleguW9LhXHbS46FAtLAJ9r2=s48-rw", 
    rating: "⭐ 4.4", 
    downloads: "10M+", 
    play: "https://play.google.com/store/apps/details?id=io.metamask", 
    appstore: "https://apps.apple.com/us/app/metamask/id1438144202" 
  },
  { 
    name: "Phantom", 
    img: "https://play-lh.googleusercontent.com/obRvW02OTYLzJuvic1ZbVDVXLXzI0Vt_JGOjlxZ92XMdBF_i3kqU92u9SgHvJ5pySdM=w240-h480-rw", 
    rating: "⭐ 4.3", 
    downloads: "1M+", 
    play: "https://play.google.com/store/apps/details?id=app.phantom", 
    appstore: "https://apps.apple.com/us/app/phantom-solana-wallet/id1598432977" 
  },
  { 
    name: "TokenPocket", 
    img: "https://play-lh.googleusercontent.com/hcnLVaagPA_c8TGRDtV4c3R7mkhw3pAlop1WI4zJjjokJ5DErElAqwqkYriYmRRCaaY=w240-h480-rw", 
    rating: "⭐ 4.2", 
    downloads: "5M+", 
    play: "https://play.google.com/store/apps/details?id=vip.mytokenpocket", 
    appstore: "https://apps.apple.com/us/app/tokenpocket/id6443685990" 
  },
  { 
    name: "SafePal", 
    img: "https://play-lh.googleusercontent.com/uT6ByyNvUeLRMDnMKEC91RrbHftl2EBB58r9vZaNbiYf1F5Twa33_Hx0zYvEfCtiG1kE=s48-rw", 
    rating: "⭐ 4.6", 
    downloads: "1M+", 
    play: "https://play.google.com/store/apps/details?id=io.safepal.wallet", 
    appstore: "https://apps.apple.com/us/app/safepal-wallet/id1548297139" 
  },
  { 
    name: "Bitget Wallet", 
    img: "https://play-lh.googleusercontent.com/-EcyFeHtPSGptfsZzgucRU2AOVgnGHyQ2DKx3R-dEbms4g4BzbvHpo8R-P-wrl18XCMk=w240-h480-rw", 
    rating: "⭐ 4.3", 
    downloads: "500K+", 
    play: "https://play.google.com/store/apps/details?id=com.bitget.wallet", 
    appstore: "https://apps.apple.com/us/app/bitget-wallet/id1629265476" 
  }
];

const AppCards = () => {
  return (
    <div className="app-container">
      {apps.map((app, index) => (
        <div key={index} className="app-card visible">
          <img src={app.img} alt={app.name} />
          <h3>{app.name}</h3>
          <div className="app-details">Ratings: {app.rating} <br /> Downloads: {app.downloads}</div>
          <div className="store-links">
            <a href={app.play} target="_blank" rel="noopener noreferrer">Get on Google Play</a>
            <a href={app.appstore} target="_blank" rel="noopener noreferrer">Get on App Store</a>
          </div>
        </div>
      ))}
    </div>
  );
};

const Instruction = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Define steps
  const steps = [
    {
      title: "Step 1: Choose and Install a Crypto Wallet App",
      content: (
        <div>
          <p className="instruction-text">
            Select one of the wallet apps below to get started. These apps will let you securely store, send, and receive crypto.
          </p>
          <AppCards />
        </div>
      )
    },
    {
      title: "Step 2: Set Up Your Wallet",
      content: (
        <div>
          <p className="instruction-text">
            Open your chosen wallet app and follow the on-screen instructions to create your wallet. <span className="highlight">IMPORTANT:</span> Write down your seed phrase and keep it safe – it’s the only way to recover your wallet if you lose access.
          </p>
          <p className="instruction-text">
            Customize your settings, add security features (like a PIN or biometric lock), and explore the app's interface.
          </p>
        </div>
      )
    },
    {
      title: "Step 3: How to Send Crypto",
      content: (
        <div>
          <p className="instruction-text">
            To send crypto, navigate to the send option in your wallet. Enter the recipient’s address manually or scan their QR code.
          </p>
          <p className="instruction-text">
            Verify the amount and transaction fees before confirming. This step ensures your funds are sent securely.
          </p>
        </div>
      )
    },
    {
      title: "Step 4: Ready to Donate",
      content: (
        <div className="final-step">
          <p className="instruction-text">
            You’re all set! Click the button below to go to the donation page and support our vision.
          </p>
          <button 
            className="donate-button"
            onClick={() => navigate('/donate')}
          >
            Donate Now
          </button>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen instruction-bg text-white">
      <Header />
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold gradient-text animate-fade-in hover-glow">
            Crypto Wallet Setup Instructions
          </h1>
          <p className="text-xl text-blue-300 mt-4 hover-glow">
            Follow these step-by-step instructions to create and set up your crypto wallet.
          </p>
        </div>
        <div className="instruction-step max-w-3xl mx-auto mt-8">
          <h2 className="text-3xl font-semibold mb-4 animate-fade-in">{steps[currentStep].title}</h2>
          <div className="step-content animate-fade-in">
            {steps[currentStep].content}
          </div>
        </div>
        <div className="max-w-3xl mx-auto text-center mt-8">
          {currentStep < steps.length - 1 && (
            <button 
              className="next-button px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold hover-glow"
              onClick={nextStep}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Instruction;
