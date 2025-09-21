
'use server';
/**
 * @fileOverview Translates text to a specified language using Gemini AI.
 *
 * - translateText - A function that handles the text translation.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslateTextInputSchema = z.object({
  content: z.any().describe('The JSON object content to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "Hindi", "Tamil").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedContent: z.any().describe('The translated content in JSON format.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: { schema: TranslateTextInputSchema },
  output: { schema: TranslateTextOutputSchema },
  prompt: `Translate the values of the following JSON object to {{{targetLanguage}}}.
You must translate the values of the keys. Do not translate the keys themselves.
The JSON structure of the output must be identical to the input.

Input JSON:
{{{json content}}}

Return only the translated content as a single, complete, and valid JSON object.`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    // Fallback to original content if translation fails to prevent crash
    return { translatedContent: output?.translatedContent ?? input.content };
  }
);
