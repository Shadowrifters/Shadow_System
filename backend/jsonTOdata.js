// Converts final analysis JSON output to a structured data object with only scores.
export function convertJsonToData(analysisJson) {
  return {
    opening_score: analysisJson["Opening & Rapport Building"]?.score || 0,
    discovery_score: analysisJson["Discovery & Needs Analysis"]?.score || 0,
    value_prop_score: analysisJson["Value Proposition Delivery"]?.score || 0,
    communication_clarity_score: analysisJson["Communication Clarity"]?.score || 0,
    objection_handling_score: analysisJson["Objection Handling"]?.score || 0,
    engagement_score: analysisJson["Engagement & Interaction"]?.score || 0,
    listening_score: analysisJson["Listening Skills"]?.score || 0,
    adaptability_score: analysisJson["Adaptability & Flexibility"]?.score || 0,
    closing_score: analysisJson["Closing Technique"]?.score || 0,
    tone_confidence_score: analysisJson["Tone & Confidence"]?.score || 0,
    time_management_score: analysisJson["Time Management & Pacing"]?.score || 0,
    follow_up_score: analysisJson["Follow-Up & Next Steps"]?.score || 0,
    overall_score: analysisJson["overallScore"] || 0
  };
}
