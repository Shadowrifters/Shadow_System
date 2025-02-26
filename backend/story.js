import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY_STORY || 'your_google_api_key_here';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

export async function generateStory(scenarioOptions = {}) {
  // Extract timeline details
  const {
    businessModel = 'N/A',
    offeringType = 'N/A',
    offeringName = 'N/A',
    language = 'N/A',
    targetMarket = 'N/A',
    salesChannel = 'N/A',
    timelinePeriod = 'Medieval Magic Era'
  } = scenarioOptions;

  const prompt = `
You are a master storyteller crafting a brief but compelling tale of timeline-crossing sales intrigue.

Setting Context:
- Original Timeline: Cyberpunk 2137, where reality has fractured due to a quantum sales anomaly
- Current Timeline: ${timelinePeriod}, where magic and technology intersect
- Business Context: ${businessModel} offering ${offeringType} - ${offeringName}
- Target Audience: ${targetMarket}
- Sales Channel: ${salesChannel}

Story Requirements:
- Keep the story between 150-250 words
- Focus on a crucial sales negotiation between timelines
- Include ONE mysterious element that affects the sale
- Feature ONE specific magical obstacle that must be overcome
- End with a clear sales outcome that impacts both timelines
- Maintain intrigue without excessive detail
- Include exactly ONE plot twist
- Use vivid but concise language

Story Structure:
1. Quick setup of the timeline crisis (1-2 sentences)
2. Introduction of the sales challenge (1-2 sentences)
3. Magical complication (1-2 sentences)
4. Clever resolution through sales expertise (1-2 sentences)
5. Impact on both timelines (1 sentence)

Character Elements:
- Protagonist: A timeline-jumping sales expert from 2137
- Client: A powerful wizard/mage with a specific need
- ONE mysterious supporting character who appears briefly

Example Story Opening:
"In the fractured remnants of 2137's quantum marketplace, Timeline Agent Sara Chen had one chance to save reality - by selling enchanted cybernetics to the Archmagus of the Thirteenth Realm..."

Generate a concise, engaging story that follows these parameters exactly. Return only the story text, no additional formatting or explanation.`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Clean up any markdown formatting
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:\w+)?\s*/, "").replace(/\s*```$/, "").trim();
    }

    // Fallback story if the generated one is too long or short
    if (text.split(' ').length < 150 || text.split(' ').length > 250) {
      return generateFallbackStory(scenarioOptions);
    }

    return text;
  } catch (error) {
    console.error("Error generating story:", error);
    return generateFallbackStory(scenarioOptions);
  }
}

function generateFallbackStory(options) {
  return `In the neon-lit underbelly of 2137's Cyberpunk City, Timeline Agent ${
    Math.random() > 0.5 ? 'Maya Chen' : 'Alex Zhang'
  } discovered a fracture in reality caused by a failed quantum transaction. Their mission: traverse time to the Age of Magic and convince the legendary ${
    options.targetMarket || 'Archmage Theron'
  } to purchase revolutionary ${
    options.offeringName || 'techno-magical fusion devices'
  }. But when a mysterious Timekeeper revealed the sale could either heal or shatter both timelines, the stakes escalated beyond mere profit. Through quick thinking and masterful negotiation, they closed a deal that merged magic with technology, stabilizing the quantum rift and earning them a promotion in both timelines.`;
}