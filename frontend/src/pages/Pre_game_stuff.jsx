import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import Header from '../components/Header';
import '../styles/pre_game_stuff.css';

const Pre_Game = () => {
  const navigate = useNavigate();
  // Global step controls the current page in the flow.
  const [step, setStep] = useState(0);
  // settingsMode will be either "new" or "load"
  const [settingsMode, setSettingsMode] = useState(null);
  // If loading previous settings, store them here.
  const [loadedSettings, setLoadedSettings] = useState(null);

  // New states for additional options
  const [businessModel, setBusinessModel] = useState("");
  const [offeringType, setOfferingType] = useState("");
  // Reusing productName for the offering’s name (product or service)
  const [productName, setProductName] = useState("");

  // Existing states for other configuration options
  const [language, setLanguage] = useState("");
  const [customLanguage, setCustomLanguage] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [customTargetMarket, setCustomTargetMarket] = useState("");
  const [salesChannel, setSalesChannel] = useState("");
  const [customSalesChannel, setCustomSalesChannel] = useState("");
  // State for the name under which to save these settings
  const [saveName, setSaveName] = useState("");

  // Options arrays
  const businessModelOptions = ["B2B", "B2C"];
  const offeringTypeOptions = ["Product", "Service"];
  const languageOptions = ["English", "Spanish", "French", "Other"];
  const targetMarketOptions = ["Technology", "Healthcare", "Finance", "Other"];
  const salesChannelOptions = ["Online", "Retail", "Wholesale", "Other"];

  // When the user clicks Play, store settings if in new-settings mode and then navigate to Story.
  const handlePlay = (e) => {
    e.preventDefault();
    if (settingsMode === "new") {
      const finalLanguage = language === "Other" ? customLanguage : language;
      const finalTargetMarket = targetMarket === "Other" ? customTargetMarket : targetMarket;
      const finalSalesChannel = salesChannel === "Other" ? customSalesChannel : salesChannel;
      const newSettings = {
        saveName,
        businessModel,
        offeringType,
        offeringName: productName,
        language: finalLanguage,
        targetMarket: finalTargetMarket,
        salesChannel: finalSalesChannel,
      };
      // Save settings in localStorage in JSON format.
      localStorage.setItem("savedScenario", JSON.stringify(newSettings));
      console.log("New Scenario Data Saved:", newSettings);
    } else {
      console.log("Loaded Scenario Data:", loadedSettings);
    }
    // Navigate to the Story page after clicking Play.
    navigate("/game");
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        // Step 0: Select Story Type (Random/Custom)
        return (
          <div className="choice-container glowing-container">
            <h2 className="choice-title">Select Story Type</h2>
            <div className="choice-buttons">
              <button
                className="choice-button"
                onClick={() =>
                  navigate("/game")
                }
              >
                Random
              </button>
              <button className="choice-button" onClick={() => setStep(1)}>
                Custom
              </button>
            </div>
          </div>
        );
      case 1:
        // Step 1: Ask whether to load previous settings or create new ones.
        return (
          <div className="sales-detail-container glowing-container">
            <h2 className="form-title">Settings Options</h2>
            <div className="choice-buttons">
              <button
                className="choice-button"
                onClick={() => {
                  const stored = localStorage.getItem("savedScenario");
                  if (stored) {
                    setLoadedSettings(JSON.parse(stored));
                    setSettingsMode("load");
                    setStep(2);
                  } else {
                    alert("No previous settings found. Please choose New Settings.");
                  }
                }}
              >
                Load Previous Settings
              </button>
              <button
                className="choice-button"
                onClick={() => {
                  setSettingsMode("new");
                  setStep(2);
                }}
              >
                New Settings
              </button>
            </div>
          </div>
        );
      case 2:
        if (settingsMode === "load") {
          // Step 2 (load mode): Show summary of loaded settings.
          return (
            <div className="sales-detail-container glowing-container">
              <h2 className="form-title">Loaded Settings Summary</h2>
              {loadedSettings ? (
                <div className="summary-container">
                  <p>
                    <strong>Save Name:</strong> {loadedSettings.saveName}
                  </p>
                  <p>
                    <strong>Business Model:</strong> {loadedSettings.businessModel}
                  </p>
                  <p>
                    <strong>Offering Type:</strong> {loadedSettings.offeringType}
                  </p>
                  <p>
                    <strong>
                      {loadedSettings.offeringType === "Service"
                        ? "Service Name"
                        : "Product Name"}
                      :
                    </strong>{" "}
                    {loadedSettings.offeringName}
                  </p>
                  <p>
                    <strong>Language:</strong> {loadedSettings.language}
                  </p>
                  <p>
                    <strong>Target Market:</strong> {loadedSettings.targetMarket}
                  </p>
                  <p>
                    <strong>Sales Channel:</strong> {loadedSettings.salesChannel}
                  </p>
                </div>
              ) : (
                <p>No settings loaded.</p>
              )}
              <div className="button-container">
                <button className="next-button" onClick={handlePlay}>
                  Play
                </button>
              </div>
              <div className="button-container">
                <button
                  className="next-button"
                  onClick={() => {
                    // Allow user to make new settings if desired.
                    setSettingsMode("new");
                    // Reset new settings fields.
                    setBusinessModel("");
                    setOfferingType("");
                    setProductName("");
                    setLanguage("");
                    setCustomLanguage("");
                    setTargetMarket("");
                    setCustomTargetMarket("");
                    setSalesChannel("");
                    setCustomSalesChannel("");
                    setSaveName("");
                    setStep(2); // Now use the new-settings flow.
                  }}
                >
                  New Settings
                </button>
              </div>
            </div>
          );
        } else {
          // Step 2 (new mode): Select Business Model.
          return (
            <div className="sales-detail-container glowing-container">
              <h2 className="form-title">Select Business Model</h2>
              <select
                value={businessModel}
                onChange={(e) => setBusinessModel(e.target.value)}
                className="form-select"
              >
                <option value="">Select Business Model</option>
                {businessModelOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="button-container">
                <button className="next-button" onClick={() => setStep(3)}>
                  Next
                </button>
              </div>
            </div>
          );
        }
      case 3:
        // Step 3 (new mode): Select Offering Type.
        return (
          <div className="sales-detail-container glowing-container">
            <h2 className="form-title">Select Offering Type</h2>
            <select
              value={offeringType}
              onChange={(e) => setOfferingType(e.target.value)}
              className="form-select"
            >
              <option value="">Select Offering Type</option>
              {offeringTypeOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="button-container">
              <button className="next-button" onClick={() => setStep(4)}>
                Next
              </button>
            </div>
          </div>
        );
      case 4:
        // Step 4 (new mode): Enter product or service name.
        return (
          <div className="sales-detail-container glowing-container">
            <h2 className="form-title">
              {offeringType === "Service"
                ? "What Service Do You Want to Offer?"
                : "What Product Do You Want to Sell?"}
            </h2>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder={
                offeringType === "Service"
                  ? "Enter service name"
                  : "Enter product name"
              }
              className="form-input"
            />
            <div className="button-container">
              <button className="next-button" onClick={() => setStep(5)}>
                Next
              </button>
            </div>
          </div>
        );
      case 5:
        // Step 5 (new mode): Select Language.
        return (
          <div className="sales-detail-container glowing-container">
            <h2 className="form-title">Select Language</h2>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="form-select"
            >
              <option value="">Select Language</option>
              {languageOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {language === "Other" && (
              <input
                type="text"
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                placeholder="Enter language"
                className="form-input mt-2"
              />
            )}
            <div className="button-container">
              <button className="next-button" onClick={() => setStep(6)}>
                Next
              </button>
            </div>
          </div>
        );
      case 6:
        // Step 6 (new mode): Select Target Market.
        return (
          <div className="sales-detail-container glowing-container">
            <h2 className="form-title">Select Target Market</h2>
            <select
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
              className="form-select"
            >
              <option value="">Select Target Market</option>
              {targetMarketOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {targetMarket === "Other" && (
              <input
                type="text"
                value={customTargetMarket}
                onChange={(e) => setCustomTargetMarket(e.target.value)}
                placeholder="Enter target market"
                className="form-input mt-2"
              />
            )}
            <div className="button-container">
              <button className="next-button" onClick={() => setStep(7)}>
                Next
              </button>
            </div>
          </div>
        );
      case 7:
        // Step 7 (new mode): Select Sales Channel.
        return (
          <div className="sales-detail-container glowing-container">
            <h2 className="form-title">Select Sales Channel</h2>
            <select
              value={salesChannel}
              onChange={(e) => setSalesChannel(e.target.value)}
              className="form-select"
            >
              <option value="">Select Sales Channel</option>
              {salesChannelOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {salesChannel === "Other" && (
              <input
                type="text"
                value={customSalesChannel}
                onChange={(e) => setCustomSalesChannel(e.target.value)}
                placeholder="Enter sales channel"
                className="form-input mt-2"
              />
            )}
            <div className="button-container">
              <button className="next-button" onClick={() => setStep(8)}>
                Next
              </button>
            </div>
          </div>
        );
      case 8:
        // Step 8 (new mode): Ask for a save name.
        return (
          <div className="sales-detail-container glowing-container">
            <h2 className="form-title">Save Settings</h2>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter a name to save these settings"
              className="form-input"
            />
            <div className="button-container">
              <button className="next-button" onClick={() => setStep(9)}>
                Next
              </button>
            </div>
          </div>
        );
      case 9:
        // Step 9 (new mode): Summary for new settings.
        const finalLanguage = language === "Other" ? customLanguage : language;
        const finalTargetMarket = targetMarket === "Other" ? customTargetMarket : targetMarket;
        const finalSalesChannel = salesChannel === "Other" ? customSalesChannel : salesChannel;
        return (
          <div className="sales-detail-container glowing-container">
            <h2 className="form-title">Summary</h2>
            <div className="summary-container">
              <p>
                <strong>Save Name:</strong> {saveName}
              </p>
              <p>
                <strong>Business Model:</strong> {businessModel}
              </p>
              <p>
                <strong>Offering Type:</strong> {offeringType}
              </p>
              <p>
                <strong>
                  {offeringType === "Service" ? "Service Name" : "Product Name"}:
                </strong>{" "}
                {productName}
              </p>
              <p>
                <strong>Language:</strong> {finalLanguage}
              </p>
              <p>
                <strong>Target Market:</strong> {finalTargetMarket}
              </p>
              <p>
                <strong>Sales Channel:</strong> {finalSalesChannel}
              </p>
            </div>
            <div className="button-container">
              <button className="next-button" onClick={handlePlay}>
                Play
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen game-bg text-white">
      <Header />
      <div className="pt-24 px-4 pb-8">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default Pre_Game;
