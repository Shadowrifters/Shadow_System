// customer.js
import Together from 'together-ai';
import dotenv from 'dotenv';
dotenv.config();

console.log("TOGETHER_API_KEY_CUSTOMER:", process.env.TOGETHER_API_KEY_CUSTOMER);

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY_CUSTOMER || 'your_api_key_here',
});

/*
  getCustomerResponse now accepts an extra parameter, scenarioOptions,
  which is an object containing dynamic settings (from Pre_Game settings).
  These details are appended to the system prompt so that the AI
  role-plays as a genuine human customer discussing the scenario.
*/
export async function getCustomerResponse(message, scenarioOptions = {}) {
  let dynamicInfo = '';
  if (scenarioOptions && Object.keys(scenarioOptions).length > 0) {
    dynamicInfo = `Scenario Information:
Business Model: ${scenarioOptions.businessModel || 'N/A'}
Offering Type: ${scenarioOptions.offeringType || 'N/A'}
Product/Service Name: ${scenarioOptions.offeringName || 'N/A'}
Language: ${scenarioOptions.language || 'N/A'}
Target Market: ${scenarioOptions.targetMarket || 'N/A'}
Sales Channel: ${scenarioOptions.salesChannel || 'N/A'}
`;}

const systemPrompt = `
You are a savvy and cautious customer who is aware of online scams.
. If you believe the service is legitimate, indicate acceptance.
If you have objections, express them clearly.
Respond in a very short, natural sentence.
Do not mention that you are an AI.
give always very very short responses only you must
          `.trim();

  try {
    const response = await together.chat.completions.create({
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      stream: false
    });
    
    console.log("Together API raw response (customer):", JSON.stringify(response, null, 2));
    
    const messageObj = response.choices[0]?.message;
    const customerMessage = (messageObj && messageObj.content) || response.choices[0]?.text;
    
    if (!customerMessage) {
      throw new Error("No response content received from AI.");
    }
    return customerMessage;
  } catch (error) {
    console.error("Error in getCustomerResponse:", error);
    return "I'm not interested.";
  }
}
