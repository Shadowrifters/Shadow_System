// SELOcalc.js
// A sophisticated SELO calculation using a simple ELO-like formula.
// Here we assume the baseline performance is 10, and K is a scaling factor.
// The change is computed as: change = K * ((newOverallScore - baseline) / 100).
// This change is then added to the provided previous SELO.
export function calculateSELO(previousSELO, newOverallScore) {
  const baseline = 10;
  const K = 20; // K-factor; adjust for desired sensitivity.
  const delta = newOverallScore - baseline;
  const change = Math.round(K * (delta / 100));
  return previousSELO + change;
}
