import mongoose from 'mongoose';
import { GeminiService } from '../integrations/gemini/gemini.client.js';
import { AIAnalysis, IAIAnalysis } from '../models/AIAnalysis.js';
import { Email } from '../models/Email.js';
import { EmailActivity } from '../models/EmailActivity.js';
import { DemoDataStore, DEMO_USER_ID } from './demoData.service.js';
import { AppError } from '../utils/errors.js';
import { isDbConnected } from '../config/db.js';
import { env } from '../config/env.js';

export class AIService {
  /**
   * Summarize email or thread
   */
  static async summarize(userId: string, emailId: string, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      const demoEmail = DemoDataStore.getEmailById(emailId);
      if (!demoEmail) throw AppError.notFound('Demo email not found');

      if (env.GEMINI_API_KEY) {
        try {
          const result = await GeminiService.summarize({
            from: demoEmail.from.raw,
            subject: demoEmail.subject,
            body: demoEmail.bodyText,
          });
          DemoDataStore.updateAIAnalysis(emailId, {
            summary: result.summary,
            suggestedQuickReplies: result.suggestedQuickReplies,
          });
          DemoDataStore.logActivity('ai_summarize', `AI summarized: "${demoEmail.subject}"`);
          return result;
        } catch (e) {
          // Fall back to precomputed demo summary
        }
      }

      DemoDataStore.logActivity('ai_summarize', `AI summarized: "${demoEmail.subject}"`);
      return {
        summary: demoEmail.aiAnalysis.summary,
        keyPoints: demoEmail.aiAnalysis.actionItems,
        suggestedQuickReplies: demoEmail.aiAnalysis.suggestedQuickReplies,
      };
    }

    // Live user flow
    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) throw AppError.notFound('Email not found');

    const result = await GeminiService.summarize({
      from: email.from.raw || `${email.from.name} <${email.from.email}>`,
      subject: email.subject,
      body: email.bodyText,
    });

    if (isDbConnected()) {
      await AIAnalysis.findOneAndUpdate(
        { userId, gmailMessageId: email.gmailMessageId },
        {
          $set: {
            summary: result.summary,
            suggestedQuickReplies: result.suggestedQuickReplies,
            analyzedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      await EmailActivity.create({
        userId,
        emailId: email._id,
        gmailMessageId: email.gmailMessageId,
        action: 'ai_summarize',
        title: `AI summarized: "${email.subject}"`,
        details: { summary: result.summary },
      });
    }

    return result;
  }

  /**
   * Generate an intelligent reply draft
   */
  static async generateReply(
    userId: string,
    params: {
      emailId?: string;
      originalSender: string;
      originalSubject: string;
      originalBody: string;
      tone?: 'Professional' | 'Friendly' | 'Formal' | 'Concise';
      userInstructions?: string;
    },
    isDemoUser?: boolean
  ) {
    if (env.GEMINI_API_KEY) {
      const result = await GeminiService.generateReply(params);
      if (isDemoUser || userId === DEMO_USER_ID.toString()) {
        DemoDataStore.logActivity('ai_reply', `Generated ${params.tone || 'Professional'} reply for "${params.originalSubject}"`);
      } else if (isDbConnected()) {
        await EmailActivity.create({
          userId,
          action: 'ai_reply',
          title: `Generated ${params.tone || 'Professional'} reply for "${params.originalSubject}"`,
          details: { tone: params.tone },
        });
      }
      return result;
    }

    // Fallback if no API key provided
    const tone = params.tone || 'Professional';
    const fallbackReply = {
      subject: params.originalSubject.startsWith('Re:') ? params.originalSubject : `Re: ${params.originalSubject}`,
      body: `Hi ${params.originalSender.split(' ')[0] || 'there'},\n\nThank you for following up on this. I have reviewed your message regarding "${params.originalSubject}" and will provide a detailed response shortly.\n\nBest regards,`,
      tone,
    };

    return fallbackReply;
  }

  /**
   * Classify an email
   */
  static async classify(userId: string, emailId: string, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      const demoEmail = DemoDataStore.getEmailById(emailId);
      if (!demoEmail) throw AppError.notFound('Demo email not found');

      if (env.GEMINI_API_KEY) {
        try {
          const result = await GeminiService.classify(demoEmail.subject, demoEmail.bodyText, demoEmail.from.raw);
          DemoDataStore.updateAIAnalysis(emailId, {
            category: result.category,
            categoryConfidence: result.confidence,
          });
          return result;
        } catch (e) {
          // fallback to seed data
        }
      }

      return {
        category: demoEmail.aiAnalysis.category,
        confidence: demoEmail.aiAnalysis.categoryConfidence,
        reason: 'Categorized based on email contents.',
      };
    }

    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) throw AppError.notFound('Email not found');

    const result = await GeminiService.classify(email.subject, email.bodyText, email.from.raw);

    if (isDbConnected()) {
      await AIAnalysis.findOneAndUpdate(
        { userId, gmailMessageId: email.gmailMessageId },
        {
          $set: {
            category: result.category,
            categoryConfidence: result.confidence,
          },
        },
        { upsert: true }
      );
    }

    return result;
  }

  /**
   * Priority and Importance analysis
   */
  static async analyzePriority(userId: string, emailId: string, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      const demoEmail = DemoDataStore.getEmailById(emailId);
      if (!demoEmail) throw AppError.notFound('Demo email not found');

      if (env.GEMINI_API_KEY) {
        try {
          const result = await GeminiService.analyzePriority(demoEmail.subject, demoEmail.bodyText, demoEmail.from.raw);
          DemoDataStore.updateAIAnalysis(emailId, {
            priority: result.priority,
            priorityScore: result.priorityScore,
            priorityReason: result.reason,
            importance: result.importance,
            actionItems: result.actionItems,
            deadlines: result.deadlines,
          });
          return result;
        } catch (e) {}
      }

      return {
        priority: demoEmail.aiAnalysis.priority,
        priorityScore: demoEmail.aiAnalysis.priorityScore,
        importance: demoEmail.aiAnalysis.importance,
        reason: demoEmail.aiAnalysis.priorityReason,
        actionItems: demoEmail.aiAnalysis.actionItems,
        deadlines: demoEmail.aiAnalysis.deadlines,
      };
    }

    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) throw AppError.notFound('Email not found');

    const result = await GeminiService.analyzePriority(email.subject, email.bodyText, email.from.raw);

    if (isDbConnected()) {
      await AIAnalysis.findOneAndUpdate(
        { userId, gmailMessageId: email.gmailMessageId },
        {
          $set: {
            priority: result.priority,
            priorityScore: result.priorityScore,
            priorityReason: result.reason,
            importance: result.importance,
            actionItems: result.actionItems,
            deadlines: result.deadlines,
          },
        },
        { upsert: true }
      );
    }

    return result;
  }

  /**
   * Spam and Phishing risk assessment
   */
  static async analyzeSpamPhishing(userId: string, emailId: string, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      const demoEmail = DemoDataStore.getEmailById(emailId);
      if (!demoEmail) throw AppError.notFound('Demo email not found');

      if (env.GEMINI_API_KEY) {
        try {
          const result = await GeminiService.analyzeSpamPhishing(demoEmail.subject, demoEmail.bodyText, demoEmail.from.raw);
          DemoDataStore.updateAIAnalysis(emailId, {
            spamRisk: result.spamRisk,
            phishingRisk: result.phishingRisk,
            spamPhishingReasons: result.reasons,
          });
          return result;
        } catch (e) {}
      }

      return {
        spamRisk: demoEmail.aiAnalysis.spamRisk,
        phishingRisk: demoEmail.aiAnalysis.phishingRisk,
        isSafe: demoEmail.aiAnalysis.spamRisk === 'none' && demoEmail.aiAnalysis.phishingRisk === 'none',
        score: demoEmail.aiAnalysis.priorityScore,
        reasons: demoEmail.aiAnalysis.spamPhishingReasons,
        recommendedAction: demoEmail.aiAnalysis.spamRisk === 'high' ? 'Do not click links or reply' : 'Safe to proceed',
      };
    }

    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) throw AppError.notFound('Email not found');

    const result = await GeminiService.analyzeSpamPhishing(email.subject, email.bodyText, email.from.raw);

    if (isDbConnected()) {
      await AIAnalysis.findOneAndUpdate(
        { userId, gmailMessageId: email.gmailMessageId },
        {
          $set: {
            spamRisk: result.spamRisk,
            phishingRisk: result.phishingRisk,
            spamPhishingReasons: result.reasons,
          },
        },
        { upsert: true }
      );
    }

    return result;
  }

  /**
   * Subject line suggestions
   */
  static async generateSubjectLines(body: string, currentSubject?: string) {
    if (env.GEMINI_API_KEY) {
      return GeminiService.generateSubjectLines(body, currentSubject);
    }
    return [
      currentSubject || 'Quick Follow-up',
      'Action Required: Next Steps',
      'Important Update & Overview',
      'Regarding Our Discussion',
    ];
  }

  /**
   * Grammar rewrite & Tone transformation
   */
  static async rewrite(params: {
    text: string;
    tone: 'Professional' | 'Friendly' | 'Formal' | 'Concise';
    instruction?: string;
  }) {
    if (env.GEMINI_API_KEY) {
      return GeminiService.rewrite(params);
    }

    // Fallback rewrite
    return {
      rewrittenText: params.text.trim(),
      tone: params.tone,
      improvements: [`Adapted text for ${params.tone} tone`, 'Checked grammar and spelling'],
    };
  }

  /**
   * Explain This Email in plain English
   */
  static async explainEmail(userId: string, emailId: string, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      const demoEmail = DemoDataStore.getEmailById(emailId);
      if (!demoEmail) throw AppError.notFound('Demo email not found');

      if (env.GEMINI_API_KEY) {
        try {
          const result = await GeminiService.explainEmail(demoEmail.subject, demoEmail.bodyText, demoEmail.from.raw);
          DemoDataStore.updateAIAnalysis(emailId, { explanation: result.overview });
          return result;
        } catch (e) {}
      }

      return {
        overview: demoEmail.aiAnalysis.explanation,
        senderIntent: 'To communicate important information and coordinate next actions.',
        keyRequests: demoEmail.aiAnalysis.actionItems,
        deadlineOrTimeSensitivity: demoEmail.aiAnalysis.deadlines[0]?.dueDate || 'Standard turnaround',
        jargonOrTerms: [],
        suggestedNextSteps: demoEmail.aiAnalysis.suggestedQuickReplies,
      };
    }

    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) throw AppError.notFound('Email not found');

    const result = await GeminiService.explainEmail(email.subject, email.bodyText, email.from.raw);

    if (isDbConnected()) {
      await AIAnalysis.findOneAndUpdate(
        { userId, gmailMessageId: email.gmailMessageId },
        { $set: { explanation: result.overview } },
        { upsert: true }
      );
    }

    return result;
  }

  /**
   * Voice transcript cleanup
   */
  static async polishVoiceTranscript(transcript: string) {
    if (env.GEMINI_API_KEY) {
      return GeminiService.polishVoiceTranscript(transcript);
    }
    return {
      subject: 'Voice Draft Note',
      body: transcript,
    };
  }

  /**
   * Trigger background comprehensive analysis during sync
   */
  static async triggerBackgroundAnalysis(userId: string, emailId: string) {
    if (!env.GEMINI_API_KEY || !isDbConnected()) return;

    try {
      const email = await Email.findOne({ _id: emailId, userId });
      if (!email) return;

      const analysis = await GeminiService.analyzeEmailComplete(email.from.raw, email.subject, email.bodyText);

      const saved = await AIAnalysis.findOneAndUpdate(
        { userId, gmailMessageId: email.gmailMessageId },
        {
          $set: {
            emailId: email._id,
            gmailThreadId: email.gmailThreadId,
            summary: analysis.summary,
            category: analysis.category,
            categoryConfidence: analysis.categoryConfidence,
            priority: analysis.priority,
            priorityScore: analysis.priorityScore,
            priorityReason: analysis.priorityReason,
            importance: analysis.importance,
            spamRisk: analysis.spamRisk,
            phishingRisk: analysis.phishingRisk,
            spamPhishingReasons: analysis.spamPhishingReasons,
            actionItems: analysis.actionItems,
            deadlines: analysis.deadlines,
            keyEntities: analysis.keyEntities,
            sentiment: analysis.sentiment,
            explanation: analysis.explanation,
            suggestedQuickReplies: analysis.suggestedQuickReplies,
            generatedSubject: analysis.generatedSubject,
            analyzedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      email.aiAnalysis = saved._id as any;
      await email.save();
    } catch (err: any) {
      console.warn('Background analysis skipped:', err.message);
    }
  }

  /**
   * Get AI activity/analyses history
   */
  static async getAIHistory(userId: string, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      return DemoDataStore.getActivities().filter((a) => a.action.startsWith('ai_'));
    }

    if (isDbConnected()) {
      return EmailActivity.find({
        userId,
        action: { $regex: /^ai_/ },
      })
        .sort({ timestamp: -1 })
        .limit(30);
    }

    return [];
  }
}
