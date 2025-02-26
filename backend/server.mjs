import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabaseAuth   } from './supabaseAuthClient.js';
import { supabasePerformance } from './supabasePerformanceClient.js';
import { getCustomerResponse } from './customer.js';
import { analyzeGamePerformance } from './ongameanalyst.js';
import { analyzeFinalTranscript } from './finalanalyst.js';
import { generateStory } from './story.js';
import { convertJsonToData } from './jsonTOdata.js';

dotenv.config();
console.log("Server starting...")

const app = express();
const PORT = process.env.PORT || 5000;
const Frontend = process.env.Frontend || 'https://Shadow-System-main.vercel.app';

app.use(cors({
  origin: Frontend,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Add your custom headers
}));
app.use(express.json());

/* ----------------------
   Authentication Endpoints
----------------------*/

// GET /api/check-codename - Check if codename (display_name) is taken.
app.get('/api/check-codename', async (req, res) => {
  const { codename } = req.query;
  if (!codename) return res.status(400).json({ error: 'codename query parameter is required.' });
  const { data, error } = await supabaseAuth.auth.admin.listUsers();
  if (error) return res.status(400).json({ error: error.message });
  const taken = data.users.some((user) => user.user_metadata?.display_name === codename);
  res.status(200).json({ available: !taken });
});

// POST /api/signup - Create a new auth record and automatically create a new analysis row.
app.post('/api/signup', async (req, res) => {
  const { email, password, codename } = req.body;
  if (!email || !password || !codename) {
    return res.status(400).json({ error: 'Email, password, and codename are required.' });
  }
  
  const { data: userList, error: listError } = await supabaseAuth.auth.admin.listUsers();
  if (listError) return res.status(400).json({ error: listError.message });
  
  const taken = userList.users.some((user) => user.user_metadata?.display_name === codename);
  if (taken) return res.status(400).json({ error: 'Codename is already taken.' });
  
  const { data: signUpData, error: signUpError } = await supabaseAuth.auth.signUp({
    email,
    password,
    options: { data: { display_name: codename } },
  });
  if (signUpError) return res.status(400).json({ error: signUpError.message });
  
  // Create the analysis row with all scores initialized to zero.
  const initialData = {
    opening_score: 0,
    discovery_score: 0,
    value_prop_score: 0,
    communication_clarity_score: 0,
    objection_handling_score: 0,
    engagement_score: 0,
    listening_score: 0,
    adaptability_score: 0,
    closing_score: 0,
    tone_confidence_score: 0,
    time_management_score: 0,
    follow_up_score: 0,
    overall_score: 0,
    play_count: 0,
    selo_points: 0,
  };
  try {
    const { error: insertError } = await supabasePerformance
      .from('analysis_data')
      .upsert({ display_name: codename, ...initialData }, { onConflict: 'display_name' });
    if (insertError) {
      console.error("Error inserting analysis row:", insertError.message);
    }
  } catch (err) {
    console.error("Error inserting analysis row:", err);
  }
  
  res.status(200).json({ message: 'Signup successful. Please verify your email.', data: signUpData });
});

// POST /api/signin - Sign in using email and password.
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'Signin successful', data });
});

/* ----------------------
   AI & Game Endpoints
----------------------*/

// POST /api/customer-response - Returns a customer response based on message and scenarioOptions.
app.post('/api/customer-response', async (req, res) => {
  const { message, scenarioOptions } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided." });
  try {
    const response = await getCustomerResponse(message, scenarioOptions);
    res.json({ response });
  } catch (error) {
    console.error('Error in /api/customer-response:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analyze-game-performance - Analyze game performance.
app.post('/api/analyze-game-performance', async (req, res) => {
  const { role, currentText, previousText, currentHealth } = req.body;
  if (!role || !currentText || !previousText || currentHealth == null) {
    return res.status(400).json({ error: "Missing parameters." });
  }
  try {
    const result = await analyzeGamePerformance({ role, currentText, previousText, currentHealth });
    res.json(result);
  } catch (error) {
    console.error('Error in /api/analyze-game-performance:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analysis - Process transcript using analysis AI and update the user's record.
app.post('/api/analysis', async (req, res) => {
  const { transcript, displayName } = req.body;
  if (!transcript || !displayName) {
    return res.status(400).json({ error: "Transcript and displayName are required." });
  }
  
  try {
    // Call the analysis AI once.
    const analysisResult = await analyzeFinalTranscript(transcript);
    if (!analysisResult) {
      return res.status(500).json({ status: 'failed', message: 'Final analysis returned null.' });
    }
    
    // Convert the analysis result to score data.
    const newData = convertJsonToData(analysisResult);
    newData.play_count = newData.play_count || 1;
    
    // Check if an analysis row exists for the current user.
    let { data: analysisRow, error: fetchError } = await supabasePerformance
      .from('analysis_data')
      .select('*')
      .eq('display_name', displayName)
      .maybeSingle();
    if (fetchError) {
      throw new Error(fetchError.message);
    }
    
    // If no row exists, insert a new row with default values.
    if (!analysisRow) {
      const initialData = {
        opening_score: 0,
        discovery_score: 0,
        value_prop_score: 0,
        communication_clarity_score: 0,
        objection_handling_score: 0,
        engagement_score: 0,
        listening_score: 0,
        adaptability_score: 0,
        closing_score: 0,
        tone_confidence_score: 0,
        time_management_score: 0,
        follow_up_score: 0,
        overall_score: 0,
        play_count: 0,
        selo_points: 0,
      };
      const { error: insertError } = await supabasePerformance
        .from('analysis_data')
        .insert([{ display_name: displayName, ...initialData }]);
      if (insertError) {
        throw new Error(insertError.message);
      }
      // Fetch the newly inserted row.
      const { data: newRow, error: newFetchError } = await supabasePerformance
        .from('analysis_data')
        .select('*')
        .eq('display_name', displayName)
        .maybeSingle();
      if (newFetchError) {
        throw new Error(newFetchError.message);
      }
      analysisRow = newRow;
    }
    
    // Update the user's analysis row.
    const { updateUserAnalysis } = await import('./UpdateAnalysis.js');
    const updatedData = await updateUserAnalysis(displayName, newData);
    
    // Return the updated analysis record along with the full analysis AI output.
    res.json({ status: 'success', data: updatedData, fullAnalysis: analysisResult });
  } catch (error) {
    console.error('Error in /api/analysis:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/story - Generate a story based on scenarioOptions.
app.post('/api/story', async (req, res) => {
  const { scenarioOptions } = req.body;
  try {
    const story = await generateStory(scenarioOptions);
    res.json({ story });
  } catch (error) {
    console.error('Error generating story:', error);
    res.status(500).json({ error: error.message });
  }
});

/* ----------------------
   Leaderboard & Performance Endpoints
----------------------*/

// GET /api/leaderboard - Returns all analysis_data rows sorted by selo_points descending.
app.get('/api/leaderboard', async (req, res) => {
  const { data, error } = await supabasePerformance
    .from('analysis_data')
    .select('*')
    .order('selo_points', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

// GET /api/performance - Returns the analysis_data row for a given display_name.
app.get('/api/performance', async (req, res) => {
  const { display_name } = req.query;
  if (!display_name) return res.status(400).json({ error: "display_name query parameter is required." });
  const { data, error } = await supabasePerformance
    .from('analysis_data')
    .select('*')
    .eq('display_name', display_name)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "No analysis row found." });
  res.status(200).json(data);
});

// GET /api/verify-analysis-rows - (Optional) Verify every registered user has an analysis row.
app.get('/api/verify-analysis-rows', async (req, res) => {
  try {
    const { data: users, error: listError } = await supabaseAuth.auth.admin.listUsers();
    if (listError) return res.status(500).json({ error: listError.message });
    let createdRows = [];
    for (const user of users.users) {
      const displayName = user.user_metadata?.display_name;
      if (!displayName) continue;
      const { data: analysisRow } = await supabasePerformance
        .from('analysis_data')
        .select('*')
        .eq('display_name', displayName)
        .maybeSingle();
      if (!analysisRow) {
        const initialData = {
          opening_score: 0,
          discovery_score: 0,
          value_prop_score: 0,
          communication_clarity_score: 0,
          objection_handling_score: 0,
          engagement_score: 0,
          listening_score: 0,
          adaptability_score: 0,
          closing_score: 0,
          tone_confidence_score: 0,
          time_management_score: 0,
          follow_up_score: 0,
          overall_score: 0,
          play_count: 0,
          selo_points: 0,
        };
        try {
          const newRow = await supabasePerformance
            .from('analysis_data')
            .upsert({ display_name: displayName, ...initialData }, { onConflict: 'display_name' })
            .select('*');
          createdRows.push(newRow);
        } catch (err) {
          console.error("Error creating analysis row for", displayName, err);
        }
      }
    }
    res.status(200).json({ message: "Verification complete", createdRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Additional routes to handle the home page and favicon requests.
app.get('/', (req, res) => res.send('Server is up!'));

app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/favicon.png', (req, res) => res.status(204).end());

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
