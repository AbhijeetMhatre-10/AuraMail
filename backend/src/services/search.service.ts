import { Email } from '../models/Email.js';
import { GeminiService } from '../integrations/gemini/gemini.client.js';
import { DemoDataStore, DEMO_USER_ID } from './demoData.service.js';
import { isDbConnected } from '../config/db.js';
import { env } from '../config/env.js';

export class SearchService {
  /**
   * Normal keyword/attribute search
   */
  static async searchEmails(
    userId: string,
    query: string,
    filters: {
      category?: string;
      priority?: string;
      unreadOnly?: boolean;
    } = {},
    isDemoUser?: boolean
  ) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      const results = DemoDataStore.getEmails({
        query,
        category: filters.category,
        priority: filters.priority,
        unreadOnly: filters.unreadOnly,
      });
      return {
        query,
        results,
        count: results.length,
        strategy: 'normal_keyword',
      };
    }

    if (!isDbConnected()) {
      return { query, results: [], count: 0, strategy: 'normal_keyword' };
    }

    const mongoFilter: any = { userId, isTrash: false };

    if (filters.unreadOnly) {
      mongoFilter.isRead = false;
    }

    if (query) {
      mongoFilter.$or = [
        { subject: { $regex: query, $options: 'i' } },
        { snippet: { $regex: query, $options: 'i' } },
        { bodyText: { $regex: query, $options: 'i' } },
        { 'from.name': { $regex: query, $options: 'i' } },
        { 'from.email': { $regex: query, $options: 'i' } },
      ];
    }

    const results = await Email.find(mongoFilter)
      .populate('aiAnalysis')
      .sort({ receivedAt: -1 })
      .limit(50);

    return {
      query,
      results,
      count: results.length,
      strategy: 'normal_keyword',
    };
  }

  /**
   * Smart AI Search: translates natural-language intent into constrained queries
   */
  static async smartSearch(userId: string, naturalQuery: string, isDemoUser?: boolean) {
    let aiStrategy: any = null;

    if (env.GEMINI_API_KEY) {
      try {
        aiStrategy = await GeminiService.interpretSmartSearch(naturalQuery);
      } catch (err: any) {
        console.warn('Smart search interpretation fallback:', err.message);
      }
    }

    if (!aiStrategy) {
      // Rule-based fallback interpreter
      const lower = naturalQuery.toLowerCase();
      aiStrategy = {
        gmailQuery: naturalQuery,
        keywords: naturalQuery.split(' '),
        category: lower.includes('work') ? 'Work' : lower.includes('invoice') || lower.includes('receipt') ? 'Finance' : lower.includes('urgent') ? 'Urgent' : undefined,
        priority: lower.includes('urgent') ? 'urgent' : lower.includes('important') ? 'high' : undefined,
        unreadOnly: lower.includes('unread') || lower.includes('new'),
        interpretation: `Searching for emails matching "${naturalQuery}"`,
      };
    }

    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      let results = DemoDataStore.getEmails({
        query: aiStrategy.keywords?.join(' ') || naturalQuery,
        category: aiStrategy.category,
        priority: aiStrategy.priority,
        unreadOnly: aiStrategy.unreadOnly,
      });

      // If strict filter yielded 0, fall back to relaxed keyword search
      if (results.length === 0) {
        results = DemoDataStore.getEmails({ query: naturalQuery });
      }

      DemoDataStore.logActivity('ai_smart_search', `Smart Search: "${naturalQuery}"`, {
        strategy: aiStrategy,
        resultsCount: results.length,
      });

      return {
        naturalQuery,
        interpretation: aiStrategy.interpretation,
        strategy: aiStrategy,
        results,
        count: results.length,
        source: 'demo_ai_search',
      };
    }

    // Live MongoDB smart query execution
    const mongoFilter: any = { userId, isTrash: false };

    if (aiStrategy.unreadOnly) {
      mongoFilter.isRead = false;
    }

    const keywordRegexes = (aiStrategy.keywords || [naturalQuery]).map((kw: string) => ({
      $or: [
        { subject: { $regex: kw, $options: 'i' } },
        { snippet: { $regex: kw, $options: 'i' } },
        { 'from.name': { $regex: kw, $options: 'i' } },
        { 'from.email': { $regex: kw, $options: 'i' } },
      ],
    }));

    if (keywordRegexes.length > 0) {
      mongoFilter.$and = keywordRegexes;
    }

    let results = await Email.find(mongoFilter)
      .populate('aiAnalysis')
      .sort({ receivedAt: -1 })
      .limit(50);

    return {
      naturalQuery,
      interpretation: aiStrategy.interpretation,
      strategy: aiStrategy,
      results,
      count: results.length,
      source: 'mongodb_gemini_smart_search',
    };
  }
}
