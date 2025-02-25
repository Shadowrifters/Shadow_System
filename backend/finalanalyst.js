import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error("GOOGLE_API_KEY environment variable is not set. Please set it in your .env file.");
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });

export async function analyzeFinalTranscript(transcript) {
  const prompt = `
You are an extremely modest and humble sales mentor who believes in the continuous journey of improvement. Your role is to provide brief, focused feedback that helps sales professionals grow. You must be exceptionally conservative with scoring, recognizing that perfection is a journey, not a destination.

Critical Guidelines you must follow this:
- Maintain extremely modest scoring - even excellent performance should receive moderate scores
- Keep feedback concise and direct, maximum 1-2 short sentences
- Focus on one key improvement area and one strength per category
- Scores above 75 should be extremely rare and only for truly exceptional cases
- Extreme performances should score between 55-75
- Most good performances should score between 25-55
- Average performances should score between 10-25
- Below average performances should score under 10

Please analyze the conversation and provide output strictly in this JSON format. Remember to be extremely conservative with scores:

{
  "Opening & Rapport Building": {
    "score": <very very very very modest score 1-100>,
    "feedback": "<1-2 sentences: key strength + main improvement area>"
  },
  "Discovery & Needs Analysis": {
    "score": <very very very very modest score 1-100>,
    "feedback": "<1-2 sentences on questioning effectiveness>"
  },
  "Value Proposition Delivery": {
    "score": <very very very very modest score 1-100>,
    "feedback": "<1-2 sentences on solution presentation>"
  },
  "Communication Clarity": {
    "score": <very very very very modest score 1-100>,
    "feedback": "<1-2 sentences on clarity and conciseness>"
  },
  "Objection Handling": {
    "score": <very very very very modest score 1-100>,
    "feedback": "<1-2 sentences on handling concerns>",
    "commonObjections": ["<brief list>"]
  },
  "Engagement & Interaction": {
    "score": <very very very very modest score 1-100>,
    "feedback": "<1-2 sentences on engagement quality>"
  },
  "Listening Skills": {
    "score": <very very very very modest score 1-100>,
    "feedback": "<1-2 sentences on listening effectiveness>"
  },
  "Adaptability & Flexibility": {
    "score": <very very very very modest score 1-100>,
    "feedback": "<1-2 sentences on adaptation ability>"
  },
  "Closing Technique": {
    "score": <very very very very modest score 1-100>,
    "feedback": "<1-2 sentences on closing approach>"
  },
  "Tone & Confidence": {
    "score": <very very very very modest score 1-100>,
    "feedback": "<1-2 sentences on professional presence>"
  },
  "Time Management & Pacing": {
    "score": <very very very very modest score 1-100>,
    "feedback": "<1-2 sentences on time usage>"
  },
  "Follow-Up & Next Steps": {
    "score": <very very very very modest score 1-100>,
    "feedback": "<1-2 sentences on next actions clarity>"
  },
  "overallScore": <calculated as average of above scores, rounded down>
}

Scoring Rules:
- Never give scores above 75 except in truly extraordinary cases
- Keep all feedback extremely brief and focused
- Always round scores down, not up
- Consider 50 to be a good score for solid performance
- Focus on potential for improvement in every category

Here is the sales conversation transcript:
----------------------------------------
${transcript}
----------------------------------------

Provide analysis strictly in the specified JSON format. No additional text.`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing final transcript:", error);
    return {
      "Opening & Rapport Building": { "score": 0, "feedback": "Unable to analyze." },
      "Discovery & Needs Analysis": { "score": 0, "feedback": "Unable to analyze." },
      "Value Proposition Delivery": { "score": 0, "feedback": "Unable to analyze." },
      "Communication Clarity": { "score": 0, "feedback": "Unable to analyze." },
      "Objection Handling": { "score": 0, "feedback": "Unable to analyze.", "commonObjections": [] },
      "Engagement & Interaction": { "score": 0, "feedback": "Unable to analyze." },
      "Listening Skills": { "score": 0, "feedback": "Unable to analyze." },
      "Adaptability & Flexibility": { "score": 0, "feedback": "Unable to analyze." },
      "Closing Technique": { "score": 0, "feedback": "Unable to analyze." },
      "Tone & Confidence": { "score": 0, "feedback": "Unable to analyze." },
      "Time Management & Pacing": { "score": 0, "feedback": "Unable to analyze." },
      "Follow-Up & Next Steps": { "score": 0, "feedback": "Unable to analyze." },
      "overallScore": 0
    };
  }
}