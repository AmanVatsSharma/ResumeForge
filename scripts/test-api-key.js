const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

async function testApiKey() {
  console.log("\n=== Gemini API Key Test Utility ===\n");
  
  // Check if API key is defined
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not defined in your .env file");
    console.log("\nPlease add GEMINI_API_KEY to your .env file. Example:");
    console.log("GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    return false;
  }
  
  // Check format
  if (!apiKey.startsWith("AIza")) {
    console.error("❌ GEMINI_API_KEY format appears to be invalid");
    console.error("API key should start with 'AIza'");
    console.log(`Your key starts with: ${apiKey.substring(0, 6)}...`);
    return false;
  }
  
  console.log("✓ API key is defined and has correct format");
  console.log("Testing connection to Gemini API...");
  
  try {
    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Simple test prompt
    const prompt = "Hello, please respond with only the words 'API test successful'";
    
    console.log("Sending test request to Gemini API...");
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    
    const response = await result.response;
    const text = response.text();
    
    console.log("\n=== Result ===");
    console.log("Response:", text);
    console.log("\n✅ API connection test SUCCESSFUL!");
    console.log("Your Gemini API key is working correctly.");
    return true;
  } catch (error) {
    console.error("\n❌ API connection test FAILED");
    
    if (error.status === 400) {
      console.error("Error type: API Key Invalid");
      console.error("Details:", error.errorDetails ? JSON.stringify(error.errorDetails, null, 2) : error.message);
      
      console.log("\nTroubleshooting steps:");
      console.log("1. Verify that your API key is correct and hasn't been modified");
      console.log("2. Confirm that the API key has been activated for Gemini 1.5 Flash model");
      console.log("3. Check if you have sufficient quota remaining");
      console.log("4. Try generating a new API key at: https://makersuite.google.com/app/apikey");
    } else if (error.status === 429) {
      console.error("Error type: Rate Limit Exceeded");
      console.log("\nYou've hit the rate limit for the Gemini API. Wait a bit and try again.");
    } else {
      console.error("Error details:", error.message || error);
    }
    
    return false;
  }
}

// Run the test
testApiKey().catch(error => {
  console.error("Unexpected error:", error);
  process.exit(1);
}); 