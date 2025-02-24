// InsertAnalysis.js
import { supabasePerformance } from './supabasePerformanceClient.js';
import { calculateSELO } from './SELOcalc.js';

// Inserts a new analysis row for a user with default scores and an initial SELO of 0.
// The SELO is then computed using the new overall score.
export async function insertUserAnalysis(displayName, newData) {
  // Default initial SELO is 0.
  const initialSELO = 0;
  // Calculate the SELO based on the new overall score.
  const seloPoints = calculateSELO(initialSELO, newData.overall_score);

  const analysisRow = {
    display_name: displayName,
    opening_score: newData.opening_score,
    discovery_score: newData.discovery_score,
    value_prop_score: newData.value_prop_score,
    communication_clarity_score: newData.communication_clarity_score,
    objection_handling_score: newData.objection_handling_score,
    engagement_score: newData.engagement_score,
    listening_score: newData.listening_score,
    adaptability_score: newData.adaptability_score,
    closing_score: newData.closing_score,
    tone_confidence_score: newData.tone_confidence_score,
    time_management_score: newData.time_management_score,
    follow_up_score: newData.follow_up_score,
    overall_score: newData.overall_score,
    selo_points: seloPoints,
    play_count: 0,
  };

  // Use upsert to avoid duplicate rows if one already exists.
  const { error } = await supabasePerformance
    .from('analysis_data')
    .upsert(analysisRow, { onConflict: 'display_name' });
  if (error) {
    throw new Error(error.message);
  }
  return analysisRow;
}
