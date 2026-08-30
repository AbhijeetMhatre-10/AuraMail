import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/errors.js';

let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!env.GEMINI_API_KEY) {
    throw AppError.aiError('GEMINI_API_KEY is not configured in backend environment.');
  }

  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  return genAIClient;
}

export interface SummarizeEmailInput {
  from: string;
  subject: string;
  body: string;
  date?: string;
}

export interface SummarizeEmailResult {
  summary: string;
  keyPoints: string[];
  suggestedQuickReplies: string[];
}

export interface GenerateReplyInput {
  originalSender: string;
  originalSubject: string;
  originalBody: string;
  tone?: 'Professional' | 'Friendly' | 'Formal' | 'Concise';
  userInstructions?: string;
}

export interface GenerateReplyResult {
  subject: string;
  body: string;
  tone: string;
}

export interface ClassifyEmailResult {
  category: 'Work' | 'Personal' | 'Finance' | 'Updates' | 'Promotions' | 'Urgent' | 'Spam' | 'General';
  confidence: number;
  reason: string;
}

export interface PriorityAnalysisResult {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  priorityScore: number; // 0 - 100
  importance: 'high' | 'normal' | 'low';
  reason: string;
  actionItems: string[];
  deadlines: { description: string; dueDate?: string }[];
}

export interface SpamPhishingAnalysisResult {
  spamRisk: 'none' | 'low' | 'medium' | 'high';
  phishingRisk: 'none' | 'low' | 'medium' | 'high';
  isSafe: boolean;
  score: number; // 0 - 100 risk score
  reasons: string[];
  recommendedAction: string;
}

export interface RewriteEmailInput {
  text: string;
  tone: 'Professional' | 'Friendly' | 'Formal' | 'Concise';
  instruction?: string;
}

export interface RewriteEmailResult {
  rewrittenText: string;
  tone: string;
  improvements: string[];
}

export interface ExplainEmailResult {
  overview: string;
  senderIntent: string;
  keyRequests: string[];
  deadlineOrTimeSensitivity: string;
  jargonOrTerms: { term: string; explanation: string }[];
  suggestedNextSteps: string[];
}

export interface SmartSearchParams {
  gmailQuery: string;
  keywords: string[];
  from?: string;
  subject?: string;
  category?: string;
  priority?: string;
  unreadOnly?: boolean;
  hasAttachments?: boolean;
  timeframe?: string;
  interpretation: string;
}

export class GeminiService {
  private static readonly PRIMARY_MODEL = 'gemini-3.7-flash';
  private static readonly FALLBACK_MODEL = 'gemini-2.5-flash';
  private static readonly SECONDARY_FALLBACK = 'gemini-2.0-flash';

  private static async executePrompt(prompt: string, expectJson = true): Promise<string> {
    const ai = getGeminiClient();
    const config = expectJson
      ? {
          temperature: 0.2,
          responseMimeType: 'application/json',
        }
      : {
          temperature: 0.3,
        };

    // Attempt 1: Gemini 3.7 Flash
    try {
      const response = await ai.models.generateContent({
        model: this.PRIMARY_MODEL,
        contents: prompt,
        config,
      });

      const text = response.text || '';
      if (text) return text;
    } catch (error: any) {
      console.warn(`Primary Gemini model (${this.PRIMARY_MODEL}) failed, trying fallback: ${error.message}`);
    }

    // Attempt 2: Gemini 2.5 Flash
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: this.FALLBACK_MODEL,
        contents: prompt,
        config,
      });
      const fallbackText = fallbackResponse.text || '';
      if (fallbackText) return fallbackText;
    } catch (fallbackError: any) {
      console.warn(`Secondary Gemini model (${this.FALLBACK_MODEL}) failed: ${fallbackError.message}`);
    }

    // Attempt 3: Gemini 2.0 Flash
    try {
      const secondaryResponse = await ai.models.generateContent({
        model: this.SECONDARY_FALLBACK,
        contents: prompt,
        config,
      });
      const secondaryText = secondaryResponse.text || '';
      if (secondaryText) return secondaryText;
    } catch (secError: any) {
      console.error('❌ All Gemini models failed:', secError.message);
      throw AppError.aiError(`Gemini AI analysis failed across models: ${secError.message}`);
    }

    throw AppError.aiError('Empty response from Gemini API');
  }

  private static parseJsonSafely<T>(text: string, fallback: T): T {
    try {
      // Remove markdown ```json ``` wraps if returned
      const clean = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      return JSON.parse(clean) as T;
    } catch (err) {
      console.warn('⚠️ Could not parse JSON response from Gemini, using fallback:', text);
      return fallback;
    }
  }

  /**
   * Summarize an email or thread
   */
  static async summarize(input: SummarizeEmailInput): Promise<SummarizeEmailResult> {
    const prompt = `
You are an expert executive email assistant. Summarize the following email clearly and concisely.
Email Details:
From: ${input.from}
Subject: ${input.subject}
Body:
${input.body.slice(0, 8000)}

Return ONLY valid JSON matching this schema:
{
  "summary": "1-3 sentence high-level executive summary",
  "keyPoints": ["Key takeaway or request 1", "Key takeaway 2"],
  "suggestedQuickReplies": ["Quick 1-line reply option A", "Quick 1-line reply option B", "Quick 1-line reply option C"]
}
`;

    const raw = await this.executePrompt(prompt, true);
    return this.parseJsonSafely<SummarizeEmailResult>(raw, {
      summary: 'Summary could not be parsed.',
      keyPoints: [],
      suggestedQuickReplies: ['Thanks for the update!', 'I will review and get back to you.'],
    });
  }

  /**
   * Generate an intelligent context-aware reply
   */
  static async generateReply(input: GenerateReplyInput): Promise<GenerateReplyResult> {
    const tone = input.tone || 'Professional';
    const instructions = input.userInstructions ? `Special User Instruction: ${input.userInstructions}` : '';

    const prompt = `
You are an expert email drafting assistant. Draft a helpful, context-aware reply to the following email.
Original Sender: ${input.originalSender}
Original Subject: ${input.originalSubject}
Original Content:
${input.originalBody.slice(0, 8000)}

Desired Tone: ${tone} (Options: Professional, Friendly, Formal, Concise)
${instructions}

Requirements:
- AI-generated draft must be polite, accurate, and directly address the points.
- Do not add placeholders like "[Your Name]" if avoidable, or use clean standard signoffs.
- Provide a clear subject line suitable for replying.

Return ONLY valid JSON with this schema:
{
  "subject": "Re: ${input.originalSubject}",
  "body": "Draft reply message body here...",
  "tone": "${tone}"
}
`;

    const raw = await this.executePrompt(prompt, true);
    return this.parseJsonSafely<GenerateReplyResult>(raw, {
      subject: input.originalSubject.startsWith('Re:') ? input.originalSubject : `Re: ${input.originalSubject}`,
      body: `Thank you for reaching out.\n\nI have received your email regarding "${input.originalSubject}" and will follow up shortly.\n\nBest regards,`,
      tone,
    });
  }

  /**
   * Classify email into category
   */
  static async classify(subject: string, body: string, from: string): Promise<ClassifyEmailResult> {
    const prompt = `
Classify the following email into one of these exact categories:
- Work (projects, clients, meetings, company business)
- Personal (friends, family, personal chats)
- Finance (invoices, receipts, banks, taxes, payment confirmations)
- Updates (newsletters, system notifications, shipping, software digests)
- Promotions (marketing, discounts, sales, offers)
- Urgent (immediate action required, critical security, emergency deadlines)
- Spam (unsolicited junk, sketchy solicitations)
- General (everything else)

From: ${from}
Subject: ${subject}
Body:
${body.slice(0, 4000)}

Return ONLY valid JSON:
{
  "category": "Work",
  "confidence": 0.95,
  "reason": "Brief 1-sentence reason for classification"
}
`;

    const raw = await this.executePrompt(prompt, true);
    return this.parseJsonSafely<ClassifyEmailResult>(raw, {
      category: 'General',
      confidence: 0.8,
      reason: 'General classification',
    });
  }

  /**
   * Automatic priority detection
   */
  static async analyzePriority(subject: string, body: string, from: string): Promise<PriorityAnalysisResult> {
    const prompt = `
Analyze the priority and urgency of the following email.
From: ${from}
Subject: ${subject}
Body:
${body.slice(0, 5000)}

Evaluate:
1. Urgency / Time sensitivity
2. Required action items
3. Explicit or implicit deadlines
4. Sender importance / business context

Return ONLY valid JSON matching this schema:
{
  "priority": "urgent" | "high" | "medium" | "low",
  "priorityScore": 85, // integer 0 to 100
  "importance": "high" | "normal" | "low",
  "reason": "Brief explanation of why this priority was assigned",
  "actionItems": ["Action item 1", "Action item 2"],
  "deadlines": [
    { "description": "Submission deadline", "dueDate": "Tomorrow 5 PM" }
  ]
}
`;

    const raw = await this.executePrompt(prompt, true);
    return this.parseJsonSafely<PriorityAnalysisResult>(raw, {
      priority: 'medium',
      priorityScore: 50,
      importance: 'normal',
      reason: 'Standard priority email.',
      actionItems: [],
      deadlines: [],
    });
  }

  /**
   * Spam and Phishing Risk Analysis
   */
  static async analyzeSpamPhishing(
    subject: string,
    body: string,
    from: string
  ): Promise<SpamPhishingAnalysisResult> {
    const prompt = `
Analyze the following email for security, spam, and phishing risks. Note: This is an advisory assessment.
From: ${from}
Subject: ${subject}
Body:
${body.slice(0, 5000)}

Check for indicators such as:
- Urgent financial demands / wire transfers
- Suspicious links, domain mismatches, impersonation
- Password resets or credential harvesting
- Unsolicited promotional spam or fake invoices

Return ONLY valid JSON:
{
  "spamRisk": "none" | "low" | "medium" | "high",
  "phishingRisk": "none" | "low" | "medium" | "high",
  "isSafe": true,
  "score": 10, // risk score 0 (completely safe) to 100 (critical threat)
  "reasons": ["Sender domain looks legitimate", "No suspicious links detected"],
  "recommendedAction": "Safe to read and reply"
}
`;

    const raw = await this.executePrompt(prompt, true);
    return this.parseJsonSafely<SpamPhishingAnalysisResult>(raw, {
      spamRisk: 'none',
      phishingRisk: 'none',
      isSafe: true,
      score: 5,
      reasons: ['No obvious suspicious elements detected.'],
      recommendedAction: 'Standard email handling.',
    });
  }

  /**
   * Generate subject lines
   */
  static async generateSubjectLines(body: string, currentSubject?: string): Promise<string[]> {
    const prompt = `
Suggest 4 effective, clear, and engaging subject lines for this email draft.
Current Subject: ${currentSubject || '(none)'}
Email Body:
${body.slice(0, 4000)}

Return ONLY valid JSON:
{
  "subjects": [
    "Subject 1 (Direct & Clear)",
    "Subject 2 (Action-Oriented)",
    "Subject 3 (Polite & Professional)",
    "Subject 4 (Concise)"
  ]
}
`;

    const raw = await this.executePrompt(prompt, true);
    const parsed = this.parseJsonSafely<{ subjects: string[] }>(raw, {
      subjects: [currentSubject || 'Quick Update', 'Regarding Our Discussion', 'Action Required', 'Project Update'],
    });
    return parsed.subjects;
  }

  /**
   * Grammar correction and rewriting with tone selection
   */
  static async rewrite(input: RewriteEmailInput): Promise<RewriteEmailResult> {
    const prompt = `
Rewrite and improve the following email text. Fix all grammar, spelling, clarity, and tone issues according to the requested style.

Target Tone: ${input.tone} (Professional, Friendly, Formal, Concise)
User Instruction: ${input.instruction || 'Improve flow and correct all errors'}
Original Text:
${input.text.slice(0, 6000)}

Return ONLY valid JSON:
{
  "rewrittenText": "The improved, polished email text...",
  "tone": "${input.tone}",
  "improvements": [
    "Corrected punctuation and sentence flow",
    "Adapted phrasing to ${input.tone} tone"
  ]
}
`;

    const raw = await this.executePrompt(prompt, true);
    return this.parseJsonSafely<RewriteEmailResult>(raw, {
      rewrittenText: input.text,
      tone: input.tone,
      improvements: ['Preserved original text.'],
    });
  }

  /**
   * Explain This Email in plain English
   */
  static async explainEmail(subject: string, body: string, from: string): Promise<ExplainEmailResult> {
    const prompt = `
Explain this email in simple, plain English so a reader can immediately understand what it means, what is requested of them, and what action to take.
From: ${from}
Subject: ${subject}
Body:
${body.slice(0, 6000)}

Return ONLY valid JSON:
{
  "overview": "Clear 2-sentence plain English breakdown of what this email is actually saying.",
  "senderIntent": "What the sender wants or why they wrote this.",
  "keyRequests": ["Specific request 1", "Specific request 2"],
  "deadlineOrTimeSensitivity": "When they need an answer or if it is not time sensitive",
  "jargonOrTerms": [
    { "term": "Example term", "explanation": "Simple explanation" }
  ],
  "suggestedNextSteps": [
    "Step 1: Reply confirming receipt",
    "Step 2: Review attachment before Friday"
  ]
}
`;

    const raw = await this.executePrompt(prompt, true);
    return this.parseJsonSafely<ExplainEmailResult>(raw, {
      overview: 'This email contains updates and correspondence.',
      senderIntent: 'To share information and request feedback.',
      keyRequests: ['Review content'],
      deadlineOrTimeSensitivity: 'Standard turnaround',
      jargonOrTerms: [],
      suggestedNextSteps: ['Read and respond if necessary.'],
    });
  }

  /**
   * Translate natural-language intent into constrained smart search parameters
   */
  static async interpretSmartSearch(naturalQuery: string): Promise<SmartSearchParams> {
    const prompt = `
Translate this natural-language email search request into a constrained Gmail search query and structured filters.
User Search Request: "${naturalQuery}"

Rules:
- Construct a valid Gmail search query string using terms like: is:unread, is:starred, from:, subject:, has:attachment, after:, before:, etc.
- Identify relevant keywords, category (Work, Finance, Personal, etc.), and priority if mentioned.

Return ONLY valid JSON:
{
  "gmailQuery": "is:unread label:inbox",
  "keywords": ["invoice", "due"],
  "from": "",
  "subject": "",
  "category": "Finance",
  "priority": "urgent",
  "unreadOnly": true,
  "hasAttachments": false,
  "timeframe": "past_week",
  "interpretation": "Searching for unread financial emails and invoices."
}
`;

    const raw = await this.executePrompt(prompt, true);
    return this.parseJsonSafely<SmartSearchParams>(raw, {
      gmailQuery: naturalQuery,
      keywords: naturalQuery.split(' '),
      interpretation: `Searching for "${naturalQuery}"`,
    });
  }

  /**
   * Voice transcript cleanup and email drafting
   */
  static async polishVoiceTranscript(transcript: string): Promise<{ subject: string; body: string }> {
    const prompt = `
A user spoke this voice draft into an email app. Clean up spoken hesitations (ums, uhs), structure into clear paragraphs, and suggest an appropriate subject line.
Spoken Transcript:
"${transcript}"

Return ONLY valid JSON:
{
  "subject": "Generated Subject Line",
  "body": "Clean, formatted email body..."
}
`;

    const raw = await this.executePrompt(prompt, true);
    return this.parseJsonSafely<{ subject: string; body: string }>(raw, {
      subject: 'Voice Note Draft',
      body: transcript,
    });
  }

  /**
   * Full comprehensive analysis combining summary, category, priority, spam/phishing
   */
  static async analyzeEmailComplete(
    from: string,
    subject: string,
    body: string
  ): Promise<{
    summary: string;
    category: 'Work' | 'Personal' | 'Finance' | 'Updates' | 'Promotions' | 'Urgent' | 'Spam' | 'General';
    categoryConfidence: number;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    priorityScore: number;
    priorityReason: string;
    importance: 'high' | 'normal' | 'low';
    spamRisk: 'none' | 'low' | 'medium' | 'high';
    phishingRisk: 'none' | 'low' | 'medium' | 'high';
    spamPhishingReasons: string[];
    actionItems: string[];
    deadlines: { description: string; dueDate?: string }[];
    keyEntities: string[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
    explanation: string;
    suggestedQuickReplies: string[];
    generatedSubject?: string;
  }> {
    const prompt = `
Perform a full intelligent analysis of this email.
From: ${from}
Subject: ${subject}
Body:
${body.slice(0, 8000)}

Analyze and return ONLY valid JSON matching this exact structure:
{
  "summary": "Concise 1-3 sentence summary",
  "category": "Work" | "Personal" | "Finance" | "Updates" | "Promotions" | "Urgent" | "Spam" | "General",
  "categoryConfidence": 0.95,
  "priority": "urgent" | "high" | "medium" | "low",
  "priorityScore": 75,
  "priorityReason": "Why this priority level",
  "importance": "high" | "normal" | "low",
  "spamRisk": "none" | "low" | "medium" | "high",
  "phishingRisk": "none" | "low" | "medium" | "high",
  "spamPhishingReasons": ["Signal 1", "Signal 2"],
  "actionItems": ["Action item 1"],
  "deadlines": [{"description": "Review", "dueDate": "Next Monday"}],
  "keyEntities": ["Entity/Person/Company 1", "Project X"],
  "sentiment": "positive" | "neutral" | "negative" | "urgent",
  "explanation": "Plain language explanation of intent and content",
  "suggestedQuickReplies": ["Quick response 1", "Quick response 2"],
  "generatedSubject": "Refined subject line"
}
`;

    const raw = await this.executePrompt(prompt, true);
    return this.parseJsonSafely(raw, {
      summary: `Email regarding ${subject} from ${from}`,
      category: 'General',
      categoryConfidence: 0.8,
      priority: 'medium',
      priorityScore: 50,
      priorityReason: 'Standard incoming message',
      importance: 'normal',
      spamRisk: 'none',
      phishingRisk: 'none',
      spamPhishingReasons: [],
      actionItems: [],
      deadlines: [],
      keyEntities: [],
      sentiment: 'neutral',
      explanation: 'General email communication.',
      suggestedQuickReplies: ['Thanks, got it!', 'Will check and update you.'],
      generatedSubject: subject,
    });
  }
}
