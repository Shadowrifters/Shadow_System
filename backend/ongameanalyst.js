// server/ai/ongameanalyst.js
import Together from 'together-ai';
import dotenv from 'dotenv';
dotenv.config();

console.log("TOGETHER_API_KEY_ANALYST:", process.env.TOGETHER_API_KEY_ANALYST);

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY_ANALYST || 'your_api_key_here',
});

export async function analyzeGamePerformance({ role, currentText, previousText, currentHealth }) {
  let systemPrompt = "";
  if (role === "player") {
    systemPrompt = `
You are a master in sales and performance analysis, tasked with evaluating a salesperson's performance in a game-like scenario.
Analyze only the following:
- Current text: the latest message from the salesperson.
- Previous text: the immediate previous message from the customer.
- Current Health: the salesperson's current health value (0-100), provided for context.

Based on this analysis, determine one of the following outcomes:
- "Attack_1": The salesperson delivers a very strong sales pitch that effectively addresses the customer's concerns, provides compelling reasons to buy, and uses persuasive language. The response demonstrates empathy, builds trust, and significantly advances the conversation toward a sale.
- "Attack_2": The salesperson provides a good sales pitch that addresses some customer concerns moderately well, offers relevant information, but may leave minor doubts or lack full persuasiveness. The response is solid but not exceptional.
- "Charge": The salesperson's response is weak, perhaps avoiding the customer's objection, providing insufficient or vague information, or failing to build trust.
- "none": The message is irrelevant, neutral, off-topic, or does not contribute to advancing the sale.
- "bought": The salesperson explicitly acknowledges or confirms the customer's intent to buy, indicating the sale is finalized (e.g., "Great, I'll process your order now"), typically in response to a clear buying signal in the previous text.

**Attack Power Rules:**
- Only assign a nonzero attack power if the salesperson demonstrates effective objection-handling, trust-building, or persuasive communication.
- Assign attack power based on the outcome:
  - "Attack_1": Between 30 and 50 (strong impact on customer's resistance).
  - "Attack_2": Between 15 and 29 (moderate impact).
  - "Charge": Between 5 and 14 (minimal impact).
  - "none" or "bought": 0 (no attack occurs).

**hpPoints Rules:**
- Provide hpPoints as a bonus between 0 and 10, reflecting the quality of the salesperson's response.
- Guidelines:
  - 7-10: Exceptional response (highly persuasive, empathetic, and effective).
  - 4-6: Good response (solid but not outstanding).
  - 1-3: Weak but minimally acceptable response.
  - 0: Irrelevant or poor response.
- The game will cap total health at 100 when applying hpPoints.

Output only valid JSON in this exact format:
{"Weapon": "Attack_1" or "Attack_2" or "Charge" or "none" or "bought", "attackPower": number, "hpPoints": number}
Do not output any additional text beyond the JSON.
    `.trim();
  } else if (role === "enemy") {
    systemPrompt = `
You are a master in customer performance analysis, evaluating a customer's response in a sales game scenario.
Analyze only the following:
- Current text: the latest message from the customer.
- Previous text: the immediate previous message from the salesperson.
- Current Health: the customer's current health value (0-100), provided for context.

Based on this analysis, determine one of the following outcomes:
- "bought": The customer clearly expresses intent to buy with a definitive statement (e.g., "Yes, I'll take it," "Let's proceed with the purchase").
- "stop": The customer explicitly refuses to buy, shows complete disinterest, or uses violent, highly negative, or inappropriate language (e.g., "This is a scam," "Leave me alone," or profanity). Return "stop" immediately if such language is detected.
- "Attack_1": The customer raises strong objections or challenging questions that demand a robust response (e.g., "Your product is too expensive and unreliable").
- "Attack_2": The customer expresses moderate objections or questions that require addressing (e.g., "I'm not sure this meets my needs").
- "Charge": The customer voices weak or minor objections (e.g., "Can you tell me more?").
- "none": The response is neutral, vague, or does not impact the sale (e.g., "Okay," "I'll think about it").

**Attack Power Rules:**
- Assign attack power based on the strength of the customer's resistance:
  - "Attack_1": Between 30 and 50 (strong resistance impacting the salesperson).
  - "Attack_2": Between 15 and 29 (moderate resistance).
  - "Charge": Between 5 and 14 (minor resistance).
  - "none", "bought", or "stop": 0 (no attack occurs).

**hpPoints Rules:**
- Provide hpPoints as a bonus between 0 and 10, reflecting the engagement or thoughtfulness of the customer's response.
- Guidelines:
  - 7-10: Highly engaged or thoughtful response (e.g., detailed objection or clear intent to buy).
  - 4-6: Moderately engaged response (e.g., reasonable question or objection).
  - 1-3: Minimal engagement (e.g., vague or weak objection).
  - 0: Disengaged, irrelevant, or hostile response.
- The game will cap total health at 100 when applying hpPoints.

**Special Instruction:**
- If the current text contains violent, highly negative, or inappropriate language, override other outcomes and return "stop" with attackPower 0 and hpPoints 0.

Output only valid JSON in this exact format:
{"Weapon": "Attack_1" or "Attack_2" or "Charge" or "none" or "bought" or "stop", "attackPower": number, "hpPoints": number}
Do not output any additional text beyond the JSON.
    `.trim();
  }
  try {
    const response = await together.chat.completions.create({
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Current text: "${currentText}"
Previous text: "${previousText}"
Current Health: ${currentHealth}`
        }
      ],
      stream: false
    });
    
    console.log("Together API raw response (ongame):", JSON.stringify(response, null, 2));
    
    const messageObj = response.choices[0]?.message;
    const output = (messageObj && messageObj.content) || response.choices[0]?.text;
    if (!output) {
      throw new Error("No response content received from AI.");
    }
    try {
      return JSON.parse(output);
    } catch (err) {
      console.error("Failed to parse output as JSON:", output);
      throw new Error("Output is not valid JSON.");
    }
  } catch (error) {
    console.error('Error analyzing game performance:', error);
    return { Weapon: "none", attackPower: 0, hpPoints: 0 };
  }
}