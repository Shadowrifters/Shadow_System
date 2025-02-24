// UpdateAnalysis.js
import { supabasePerformance } from './server/supabasePerformanceClient.js';
import { calculateSELO } from './server/SELOcalc.js';

export async function updateUserAnalysis(displayName, newData) {
  // Fetch the existing analysis row for the current user.
  const { data: existingRows, error: fetchError } = await supabasePerformance
    .from('analysis_data')
    .select('*')
    .eq('display_name', displayName);

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!existingRows || existingRows.length === 0) {
    throw new Error(`No analysis row found for display name: ${displayName}`);
  }

  // If multiple rows are returned, warn and choose the first one.
  if (existingRows.length > 1) {
    console.warn(
      `Multiple analysis rows found for display name ${displayName}. Using the first row.`
    );
  }
  const existingData = existingRows[0];

  // Compute the new play count.
  const playCount = existingData.play_count;
  const newPlayCount = playCount + 1;

  // Helper: weighted average based on past performance.
  const weightedAverage = (oldScore, newScore) =>
    Math.round((oldScore * playCount + newScore) / newPlayCount);

  // Compute updated scores using weighted averages.
  const updatedOverallScore = weightedAverage(existingData.overall_score, newData.overall_score);
  const updatedData = {
    opening_score: weightedAverage(existingData.opening_score, newData.opening_score),
    discovery_score: weightedAverage(existingData.discovery_score, newData.discovery_score),
    value_prop_score: weightedAverage(existingData.value_prop_score, newData.value_prop_score),
    communication_clarity_score: weightedAverage(existingData.communication_clarity_score, newData.communication_clarity_score),
    objection_handling_score: weightedAverage(existingData.objection_handling_score, newData.objection_handling_score),
    engagement_score: weightedAverage(existingData.engagement_score, newData.engagement_score),
    listening_score: weightedAverage(existingData.listening_score, newData.listening_score),
    adaptability_score: weightedAverage(existingData.adaptability_score, newData.adaptability_score),
    closing_score: weightedAverage(existingData.closing_score, newData.closing_score),
    tone_confidence_score: weightedAverage(existingData.tone_confidence_score, newData.tone_confidence_score),
    time_management_score: weightedAverage(existingData.time_management_score, newData.time_management_score),
    follow_up_score: weightedAverage(existingData.follow_up_score, newData.follow_up_score),
    overall_score: updatedOverallScore,
    // Update SELO by adding the delta computed from the new overall score.
    selo_points: existingData.selo_points + calculateSELO(0, newData.overall_score),
    play_count: newPlayCount,
  };

  // Update only the row(s) for this displayName.
  const { error: updateError } = await supabasePerformance
    .from('analysis_data')
    .update(updatedData)
    .eq('display_name', displayName);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return updatedData;
}
