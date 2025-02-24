import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { QRCodeCanvas } from 'qrcode.react';
import '../styles/donation.css';

// Updated crypto data without image logos
const cryptoAddresses = [
  {
    "coin": "Bitcoin",
    "symbol": "BTC",
    "address": "bc1qghp8cw9c8xmqnyrqxsmzqk5pu3jzxajkl6p37e",
    "network": "Bitcoin"
  },
  {
    "coin": "Bitcoin",
    "symbol": "BTC",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "Merlin"
  },
  {
    "coin": "BNB",
    "symbol": "BNB",
    "address": "bnb1w05vmqh394m0fkwxhmafflssxx0m2g7hyjn3ud",
    "network": "BNB Beacon Chain"
  },
  {
    "coin": "BNB",
    "symbol": "BNB",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "BNB Greenfield"
  },
  {
    "coin": "BNB",
    "symbol": "BNB",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "BNB Smart Chain"
  },
  {
    "coin": "BNB",
    "symbol": "BNB",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "OpBNB"
  },
  {
    "coin": "Callisto",
    "symbol": "CLO",
    "address": "0x4001D56daa9d57567D6b96A4De56C2131CA3e29E",
    "network": "Callisto"
  },
  {
    "coin": "Celo",
    "symbol": "CELO",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "Celo"
  },
  {
    "coin": "Cosmos Hub",
    "symbol": "ATOM",
    "address": "cosmos1s03dl0uav2y9efg0xkmvdg0rad3sl9atyy045q",
    "network": "Cosmos Hub"
  },
  {
    "coin": "DigiByte",
    "symbol": "DGB",
    "address": "dgb1qx5u9a54p09dr72yhcr08r54xup07ne6gt68vl2",
    "network": "DigiByte"
  },
  {
    "coin": "Dogecoin",
    "symbol": "DOGE",
    "address": "DTyr1PK2dV1J56qLGMtRMm8Bz3YzWVM4i3",
    "network": "Dogecoin"
  },
  {
    "coin": "Ethereum",
    "symbol": "ETH",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "Base"
  },
  {
    "coin": "Ethereum",
    "symbol": "ETH",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "Blast"
  },
  {
    "coin": "Ethereum",
    "symbol": "ETH",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "Blast"
  },
  {
    "coin": "Ethereum",
    "symbol": "ETH",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "Ethereum"
  },
  {
    "coin": "Ethereum",
    "symbol": "ETH",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "Linea"
  },
  {
    "coin": "Ethereum",
    "symbol": "ETH",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "Manta Pacific"
  },
  {
    "coin": "Ethereum",
    "symbol": "ETH",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "OP Mainnet"
  },
  {
    "coin": "Ethereum",
    "symbol": "ETH",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "Polygon zkEVM"
  },
  {
    "coin": "Ethereum",
    "symbol": "ETH",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "Scroll"
  },
  {
    "coin": "Ethereum",
    "symbol": "ETH",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "zkLink Nova Mainnet"
  },
  {
    "coin": "Ethereum",
    "symbol": "ETH",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "zkSync Era"
  },
  {
    "coin": "Ethereum Classic",
    "symbol": "ETC",
    "address": "0x55Db17EC65332fb10172aAE2604ca8428DD024E1",
    "network": "Ethereum Classic"
  },
  {
    "coin": "Internet Computer",
    "symbol": "ICP",
    "address": "b8fbac6f395c9ef0934ba5f3dfaa1a6c30613c2ab1e28e5a2208419b279d2ff4",
    "network": "Internet Computer"
  },
  {
    "coin": "Litecoin",
    "symbol": "LTC",
    "address": "ltc1qs7437tvr8xjjn9x8exc0x3uuh87mrwjkm7yfun",
    "network": "Litecoin"
  },
  {
    "coin": "Neon",
    "symbol": "NEON",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "Neon"
  },
  {
    "coin": "Osmosis",
    "symbol": "OSMO",
    "address": "osmo1s03dl0uav2y9efg0xkmvdg0rad3sl9atvlu9zj",
    "network": "Osmosis"
  },
  {
    "coin": "Polygon",
    "symbol": "POL",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "Polygon"
  },
  {
    "coin": "Qtum",
    "symbol": "QTUM",
    "address": "Qekw9ZSqyqmjJdDSFpq56XchhvcbsxuQVV",
    "network": "Qtum"
  },
  {
    "coin": "Ravencoin",
    "symbol": "RVN",
    "address": "RF8SwwYZY9avPAdLgGWfXBZLQ8Da3nKz8",
    "network": "Ravencoin"
  },
  {
    "coin": "Solana",
    "symbol": "SOL",
    "address": "VKVQ54TRF7qjgMrG3fS8imsUFWuNrx5L4s68YZ6UXrG",
    "network": "Solana"
  },
  {
    "coin": "Stellar",
    "symbol": "XLM",
    "address": "GCCH74XWMBJLW3GPK5W7GPSQ3JGNOCYJ2VRLXZTG2JDYGE5TILQ",
    "network": "Stellar"
  },
  {
    "coin": "Theta Fuel",
    "symbol": "TFUEL",
    "address": "0x420058D18b620700421977399468AFDBdA4FFBe6",
    "network": "Theta"
  },
  {
    "coin": "THORChain",
    "symbol": "RUNE",
    "address": "thor1h5qvlyadkwfxakgwzdr87vt5gx3h5967qp2ans",
    "network": "THORChain"
  },
  {
    "coin": "TON",
    "symbol": "TON",
    "address": "UQBE88au7pIyE1E2xOlAMDY7MWLmgBT4H4vn8VlEa5gzocWB",
    "network": "TON"
  },
  {
    "coin": "Tron",
    "symbol": "TRX",
    "address": "TDCtFJUmTzgA7pRhNnP6rfsYxcn4kdso9w",
    "network": "Tron"
  },
  {
    "coin": "Trust Wallet",
    "symbol": "TWT",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "BNB Smart Chain (BEP20)"
  },
  {
    "coin": "Uniswap",
    "symbol": "UNI",
    "address": "0x2A9ABB1e177f6055743F694F39B863f7b10a85Ca",
    "network": "Ethereum"
  },
  {
    "coin": "XRP",
    "symbol": "XRP",
    "address": "raQAfCCKhLSZzV7nZwNLpLxrnkZQj7GBZt",
    "network": "XRP"
  },
  {
    "coin": "Zcash",
    "symbol": "ZEC",
    "address": "t1NV4aR8MUaLK6UQFt9z8DZ3HNNQEMFbMeK",
    "network": "Zcash"
  }
];

// Helper function to generate a crypto URI for QR code
function generateCryptoURI(coin, address) {
  const amount = "0.005";
  const label = "Shadowrifter";
  const message = "Support Shadowrifter";
  const scheme = coin.toLowerCase();
  return `${scheme}:${address}?amount=${amount}&label=${encodeURIComponent(label)}&message=${encodeURIComponent(message)}`;
}

const CryptoCard = ({ coin, symbol, address, network }) => {
  const [showQR, setShowQR] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
      .then(() => alert("Copied to clipboard!"))
      .catch(() => alert("Failed to copy!"));
  };

  const toggleQR = () => {
    setShowQR(prev => !prev);
  };

  return (
    <div className="crypto-card flex flex-col sm:flex-row justify-between items-center bg-black bg-opacity-70 p-6 rounded border border-blue-600 transition-transform duration-300 transform hover:scale-105">
      <div className="flex flex-col w-full">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-blue-400 hover-glow">
            {coin} ({symbol})
          </span>
        </div>
        <span className="text-lg text-blue-300 break-all">{address}</span>
        <span className="text-md font-bold text-blue-300 mt-1">
          Network: {network}
        </span>
      </div>
      <div className="button-group flex flex-row items-center space-x-2 mt-4 sm:mt-0">
        <button 
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded font-semibold hover-glow"
          onClick={handleCopy}
        >
          Copy
        </button>
        <button 
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded font-semibold hover-glow"
          onClick={toggleQR}
        >
          {showQR ? "Hide QR" : "Show QR"}
        </button>
      </div>
      {showQR && (
        <div className="qr-code mt-4 sm:mt-0">
          <QRCodeCanvas 
            value={generateCryptoURI(coin, address)}
            size={128}
            fgColor="#00bfff"
            bgColor="#000"
          />
        </div>
      )}
    </div>
  );
};

const NetworkDropdown = ({ selectedNetwork, setSelectedNetwork }) => {
  const [open, setOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedOptionRef = useRef(null);

  const uniqueNetworks = Array.from(new Set(cryptoAddresses.map(item => item.network)));
  const options = ["All", ...uniqueNetworks];
  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  useEffect(() => {
    if (open && selectedOptionRef.current) {
      selectedOptionRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, open, filteredOptions]);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[selectedIndex]) {
        setSelectedNetwork(filteredOptions[selectedIndex]);
        setOpen(false);
        setDropdownSearch("");
      }
    }
  };

  return (
    <div className="relative inline-block text-left network-dropdown" onKeyDown={handleKeyDown} tabIndex={0}>
      <button 
        onClick={() => setOpen(prev => !prev)}
        className="inline-flex justify-center w-full rounded-md border border-blue-600 shadow-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-bold text-black hover-glow"
      >
        {selectedNetwork === "All" ? "All Networks" : selectedNetwork}
        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="dropdown-container origin-top-right absolute right-0 mt-2 w-full max-w-xs rounded-md shadow-lg bg-black bg-opacity-80 ring-1 ring-blue-600 ring-opacity-5 focus:outline-none animate-dropdown">
          <div className="py-1">
            <input 
              type="text"
              placeholder="Search..."
              value={dropdownSearch}
              onChange={(e) => setDropdownSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 mb-2 bg-gray-800 text-white rounded border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {filteredOptions.map((option, index) => (
              <div 
                key={index}
                ref={index === selectedIndex ? selectedOptionRef : null}
                className={`cursor-pointer px-4 py-2 hover:bg-blue-800 ${selectedIndex === index ? "bg-blue-800" : ""}`}
                onClick={() => {
                  setSelectedNetwork(option);
                  setOpen(false);
                  setDropdownSearch("");
                }}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Donation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("All");
  const navigate = useNavigate();

  // Filter by coin name/symbol and network
  const filteredCrypto = cryptoAddresses.filter(item => {
    const coinMatch = item.coin.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      item.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const networkMatch = selectedNetwork === "All" || item.network === selectedNetwork;
    return coinMatch && networkMatch;
  });

  return (
    <div className="min-h-screen donation-bg text-white">
      <Header />
      <div className="pt-24 px-4 pb-8 space-y-12">
        {/* Title and Story */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold gradient-text animate-fade-in hover-glow">
            The Rift Beckons 🌌
          </h1>
          <p className="text-xl text-blue-300 hover-glow">
            I’m the mind behind <span className="highlight">Shadow Systems</span>, just a high schooler with a wild spark—<span className="highlight">ShadowRifters</span> 🔥.
          </p>
          <p className="text-xl text-blue-300 hover-glow">
            Sales? I hunted its secrets, but no one would spill 🤐. Dull YouTube vids 🎥 and free books 📚 zapped my soul 😴. So, I thought up a game—<span className="highlight">AI-driven</span> 🤖, slick ✨, a world where sales mastery feels epic 🎮. That’s <span className="highlight">ShadowRifters</span>.
          </p>
          <p className="text-xl text-blue-300 hover-glow">
            It’s a prototype forged in late nights 🌙, and I’ve got huge plans to make it big—real big 🚀. But I’m out of juice—no resources to push it further. Want it to soar? Toss some <span className="highlight">crypto</span> 💰 (my only wallet) to fuel sharper AI and wilder rifts 🌠.
          </p>
          <p className="text-xl text-blue-300 hover-glow">
            Join the vibe 🤝. Boost the vision <span className="highlight">🌟</span>. Or just chill 😎. Your move.
          </p>
        </div>
        {/* Instruction Button */}
        <div className="max-w-3xl mx-auto text-center">
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold hover-glow"
            onClick={() => navigate('/steps')}
          >
            How to Set Up Your Crypto Wallet?
          </button>
        </div>
        {/* Search Bar and Network Dropdown in one row */}
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <input 
            type="text"
            placeholder="Search crypto coin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 p-3 rounded bg-black bg-opacity-70 border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <NetworkDropdown 
            selectedNetwork={selectedNetwork} 
            setSelectedNetwork={setSelectedNetwork} 
          />
        </div>
        {/* Crypto Cards */}
        <div className="max-w-3xl mx-auto space-y-6">
          {filteredCrypto.length ? (
            filteredCrypto.map((item, index) => (
              <CryptoCard 
                key={index} 
                coin={item.coin} 
                symbol={item.symbol} 
                address={item.address} 
                network={item.network}
              />
            ))
          ) : (
            <p className="text-center text-blue-300">No matching crypto coin found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Donation;
