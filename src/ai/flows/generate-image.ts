'use server';

/**
 * @fileOverview A flow for generating images from a text prompt in multiple styles.
 *
 * - generateImages - A function that generates images in multiple styles based on a text prompt.
 * - GenerateImagesInput - The input type for the generateImages function.
 * - GenerateImagesOutput - The return type for the generateImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImagesInputSchema = z.object({
  prompt: z.string().describe('The base prompt to use for generating the images.'),
});
export type GenerateImagesInput = z.infer<typeof GenerateImagesInputSchema>;

const GenerateImagesOutputSchema = z.object({
  animated: z.string().describe('The URL of the generated image in an animated style.'),
  pixar: z.string().describe('The URL of the generated image in a Pixar style.'),
  cinematic: z.string().describe('The URL of the generated image in a cinematic style.'),
});
export type GenerateImagesOutput = z.infer<typeof GenerateImagesOutputSchema>;

export async function generateImages(input: GenerateImagesInput): Promise<GenerateImagesOutput> {
  return generateImagesFlow(input);
}

const generateImageForStyle = async (prompt: string, style: string): Promise<string> => {
    const fullPrompt = `${prompt}, in a ${style} style, digital art`;
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: fullPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    if (!media || !media.url) {
        throw new Error(`Image generation failed for style: ${style}`);
    }
    return media.url;
  };

const generateImagesFlow = ai.defineFlow(
  {
    name: 'generateImagesFlow',
    inputSchema: GenerateImagesInputSchema,
    outputSchema: GenerateImagesOutputSchema,
  },
  async (input) => {
    const [animated, pixar, cinematic] = await Promise.all([
      generateImageForStyle(input.prompt, 'vibrant animated'),
      generateImageForStyle(input.prompt, '3D Pixar'),
      generateImageForStyle(input.prompt, 'hyperrealistic cinematic'),
    ]);

    return { animated, pixar, cinematic };
  }
);
