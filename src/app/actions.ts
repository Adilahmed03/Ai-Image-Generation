'use server';

import { generateImages as genImagesFlow, GenerateImagesInput, GenerateImagesOutput } from '@/ai/flows/generate-image';

export async function handleGenerateImages(input: GenerateImagesInput): Promise<GenerateImagesOutput> {
  // Basic input validation (though Zod handles more complex cases on the client)
  if (!input.prompt || typeof input.prompt !== 'string' || input.prompt.trim().length === 0) {
    throw new Error("Prompt cannot be empty.");
  }
  if (input.prompt.length > 1000) { // Max length check
      throw new Error("Prompt is too long. Maximum 1000 characters.");
  }

  try {
    console.log(`Generating images for prompt: "${input.prompt}"`);
    const result = await genImagesFlow(input);
    if (!result || !result.animated || !result.pixar || !result.cinematic) {
        throw new Error("AI model did not return all three image styles.");
    }
    console.log(`Images generated.`);
    return result;
  } catch (error: any) {
    console.error("Error in handleGenerateImages server action:", error);
    
    let errorMessage = "Failed to generate images due to an unexpected server error.";
    if (error.message) {
        // Try to provide a more specific error if available
        if (error.message.includes("billing") || error.message.includes("quota")) {
            errorMessage = "Image generation failed due to a billing or quota issue. Please check your account.";
        } else if (error.message.includes("moderation") || error.message.includes("safety")) {
            errorMessage = "Image generation failed due to content policy. Please try a different prompt.";
        } else if (error.message.includes("timeout")) {
            errorMessage = "Image generation timed out. Please try again shortly.";
        }
    }
    
    // Re-throw a new error with a user-friendly message
    throw new Error(errorMessage);
  }
}
