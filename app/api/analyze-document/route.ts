import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, PROMPTS } from '@/lib/openai';
import { sanitizeInput, extractDates, extractParties, extractCitations, analyzeDocumentStructure } from '@/lib/utils';
import { requireApiAuth, safeErrorResponse, checkRateLimit, parseBody } from '@/lib/api-auth';
import { auditLog } from '@/lib/audit-log';
import type { DocumentAnalysisRequest, DocumentAnalysisResponse } from '@/types';

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if (auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user!.sub, 10, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { data: body, error: parseError } = await parseBody<DocumentAnalysisRequest>(request);
    if (parseError) return parseError;

    const { content, documentType = 'other', analysisType = 'full', context } = body!;

    auditLog({ action: 'api.analyze_document', userId: auth.user!.sub, ip: auth.ip, userAgent: auth.userAgent, metadata: { documentType, analysisType } });

    if (!content) {
      return NextResponse.json(
        { error: 'Document content is required' },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedContent = sanitizeInput(content);

    // Extract basic information
    const dates = extractDates(sanitizedContent);
    const parties = extractParties(sanitizedContent);
    const citations = extractCitations(sanitizedContent);
    const structure = analyzeDocumentStructure(sanitizedContent);

    // Build analysis request based on type
    let analysisPrompt = '';

    switch (analysisType) {
      case 'summary':
        analysisPrompt = `Please provide a concise summary of this ${documentType}:

${sanitizedContent}

Provide:
1. Main purpose of the document
2. Key points (3-5 bullet points)
3. Important deadlines or dates
4. Critical terms or conditions`;
        break;

      case 'issues':
        analysisPrompt = `Analyze this ${documentType} and identify legal issues:

${sanitizedContent}

Identify:
1. Primary legal issues
2. Potential problems or concerns
3. Missing information
4. Risks or liabilities`;
        break;

      case 'extract_facts':
        analysisPrompt = `Extract key facts from this ${documentType}:

${sanitizedContent}

Extract:
1. All relevant facts in chronological order
2. Parties and their roles
3. Dates and events
4. Locations mentioned
5. Actions taken`;
        break;

      case 'full':
      default:
        analysisPrompt = `Conduct a comprehensive legal analysis of this ${documentType}:

${sanitizedContent}

${context ? `Additional Context: ${context}\n` : ''}

Provide a thorough analysis including:

## Summary
Brief overview of the document and its purpose

## Parties Involved
List all parties and their roles

## Key Facts
Chronological list of important facts

## Legal Issues
Primary legal issues presented

## Critical Dates & Deadlines
All important dates and their significance

## Key Terms & Provisions
Important contractual terms, obligations, or legal provisions

## Risks & Concerns
Potential legal risks, ambiguities, or red flags

## Recommendations
Specific actions or next steps for the attorney

Format your response in clear sections using markdown.`;
        break;
    }

    // Call OpenAI for analysis
    const aiAnalysis = await callOpenAI(
      PROMPTS.documentAnalysis,
      analysisPrompt,
      {
        temperature: 0.3, // Low temperature for accuracy
        maxTokens: 4000,
      }
    );

    // Structure the response
    const response: DocumentAnalysisResponse = {
      summary: aiAnalysis,
      keyIssues: [],
      legalAnalysis: aiAnalysis,
      facts: [],
      recommendations: [],
      parties: parties.map(name => ({ name, role: 'Unknown' })),
      dates: dates.map(d => ({ date: d.date, event: d.context })),
      extractedData: {
        citations,
        structure,
        wordCount: structure.wordCount,
        documentType,
      },
      confidence: 0.85, // This could be calculated based on various factors
    };

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    return safeErrorResponse(error, 'An error occurred while analyzing the document');
  }
}
