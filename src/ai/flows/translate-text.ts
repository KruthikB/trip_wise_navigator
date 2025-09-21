
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
  textsToTranslate: z.array(z.string()).describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "Hindi", "Tamil").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedTexts: z.array(z.string()).describe('The translated text.'),
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
  prompt: `Translate the following array of strings into {{{targetLanguage}}}.
Return a valid JSON object with a single key "translatedTexts" which is an array of the translated strings.
The translated strings must be in the exact same order as the input array.
Do not provide any extra conversational text or explanations.

Example Input:
{
  "textsToTranslate": ["Hello", "How are you?", "Thank you"],
  "targetLanguage": "French"
}

Example Output:
{
  "translatedTexts": ["Bonjour", "Comment ça va ?", "Merci"]
}

Actual Input:
{{{jsonStringify textsToTranslate}}}
`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    // If the input text is empty or just whitespace, don't call the AI.
    if (!input.textsToTranslate || input.textsToTranslate.length === 0) {
      return { translatedTexts: [] };
    }
    const { output } = await prompt(input);
    // Fallback to original content if translation fails to prevent crash
    return { translatedTexts: output?.translatedTexts ?? input.textsToTranslate };
  }
);
