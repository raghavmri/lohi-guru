import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateDiagnosis(
  symptoms: string,
  duration: string,
  severity: string,
  additionalNotes?: string,
  medicalHistory?: string
) {
  try {
    // Initialize the Google Generative AI with your API key
    const apiKey = process.env.GOOGLE_API_KEY; // Store this in your .env file

    if (!apiKey) {
      throw new Error("Google API key is not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Use gemini-1.5-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      As a medical AI assistant, analyze the following patient information and provide a preliminary diagnosis:
      
      Symptoms: ${symptoms}
      Duration: ${duration}
      Severity: ${severity}
      ${additionalNotes ? `Additional Notes: ${additionalNotes}` : ""}
      ${medicalHistory ? `Medical History: ${medicalHistory}` : ""}
      
      Please provide:
      1. A preliminary diagnosis
      2. Confidence level (as a percentage)
      3. List of possible conditions
      4. Recommendations for the patient
      
      Format your response as a JSON object with the following structure:
      {
        "diagnosis": "string",
        "confidence": number,
        "possibleConditions": ["string"],
        "recommendations": ["string"]
      }
      
      IMPORTANT: Return ONLY the JSON object without any code blocks, markers, or additional explanations. Do not wrap the JSON in markdown code blocks like \`\`\`json or \`\`\`. Just return the raw JSON.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("Raw response:", text);

    // Clean the response of any markdown code block formatting
    // This regex will remove ```json, ```, and similar markdown formatting
    text = text.replace(/```(json)?|```/g, "").trim();

    // Parse the JSON response
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.error("Cleaned response that failed to parse:", text);

      // If we still can't parse it, try a more aggressive approach
      // Look for valid JSON within the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (error) {
          console.error("Second attempt at parsing JSON failed:", error);
        }
      }

      throw new Error("Failed to parse AI diagnosis response");
    }
  } catch (error) {
    console.error("Error generating diagnosis:", error);
    throw new Error("Failed to generate AI diagnosis");
  }
}
