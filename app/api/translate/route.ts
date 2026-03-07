import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '@/lib/openai';
import { sanitizeInput } from '@/lib/utils';
import { requireApiAuth, safeErrorResponse, checkRateLimit, parseBody } from '@/lib/api-auth';
import { auditLog } from '@/lib/audit-log';

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if (auth.error) return auth.error;

  const rateLimited = checkRateLimit(auth.user!.sub, 20, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { data: body, error: parseError } = await parseBody<{
      text?: string;
      targetLanguage?: string;
      sourceLanguage?: string;
    }>(request);
    if (parseError) return parseError;

    const {
      text,
      targetLanguage = 'zh',
      sourceLanguage = 'en',
    } = body!;

    auditLog({ action: 'api.translate', userId: auth.user!.sub, metadata: { targetLanguage } });

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required for translation' },
        { status: 400 }
      );
    }

    const sanitizedText = sanitizeInput(text);

    // Determine target language
    const isToEnglish = targetLanguage === 'en';
    const targetLang = isToEnglish ? 'English' : 'Chinese (Simplified)';

    // Build enhanced translation prompt with auto-detection and mixed language handling
    const translationPrompt = `You are a professional legal translator. Translate the following legal document to ${targetLang}.

**IMPORTANT INSTRUCTIONS:**
1. **Auto-detect the source language** - The document may be primarily in English, Chinese, or mixed
2. **Maintain exact structure and formatting** - Keep paragraphs, numbering, spacing exactly as the original
3. **Preserve legal terminology** - Use accurate legal terms in the target language
4. **Handle mixed language content:**
   - For proper nouns (names, places, organizations): Keep original + add translation in parentheses
   - Example: "美国加利福尼亚州" → "State of California, United States (美国加利福尼亚州)"
   - Example: "John Smith" → "约翰·史密斯 (John Smith)"
   - For legal terms: Translate with original term in parentheses if ambiguous
   - Example: "consideration" → "对价 (consideration)"
5. **Professional legal tone** - Maintain formal legal language
6. **Do not add explanations** - Only provide the translation
7. **Special handling:**
   - Keep all dates in original format
   - Keep case citations and legal references in original form with translation annotation
   - Preserve dollar amounts and numbers exactly

**Document to translate:**

${sanitizedText}

**Translation to ${targetLang}:**`;

    // Call OpenAI for translation
    const translatedText = await callOpenAI(
      `You are a professional legal translator with expertise in multilingual legal documents. You excel at auto-detecting source languages and providing accurate translations to ${targetLang} while preserving legal terminology, proper nouns, and document structure. You annotate technical terms and proper nouns with their original text in parentheses.`,
      translationPrompt,
      {
        temperature: 0.3, // Low temperature for consistent translation
        maxTokens: 4000,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        originalText: sanitizedText,
        translatedText: translatedText.trim(),
        targetLanguage: targetLang,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    return safeErrorResponse(error, 'An error occurred during translation');
  }
}
