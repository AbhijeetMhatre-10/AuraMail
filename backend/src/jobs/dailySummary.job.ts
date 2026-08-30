import { isDbConnected } from '../config/db.js';
import { User } from '../models/User.js';
import { Email } from '../models/Email.js';
import { DailySummary } from '../models/DailySummary.js';
import { env } from '../config/env.js';
import { GoogleGenAI } from '@google/genai';

let jobInterval: NodeJS.Timeout | null = null;

export function startDailySummaryJob() {
  if (jobInterval) return;

  console.log('🕒 Daily summary in-process scheduler initialized.');

  // Run initial check after 30 seconds, then hourly
  setTimeout(runSummarySweep, 30 * 1000);
  jobInterval = setInterval(runSummarySweep, 60 * 60 * 1000);
}

export function stopDailySummaryJob() {
  if (jobInterval) {
    clearInterval(jobInterval);
    jobInterval = null;
  }
}

async function runSummarySweep() {
  if (!isDbConnected() || !env.GEMINI_API_KEY) return;

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const users = await User.find({ isDemoUser: false }).limit(20);

    for (const user of users) {
      // Check if summary already exists today
      const existing = await DailySummary.findOne({ userId: user._id, dateString: todayStr });
      if (existing) continue;

      const oneDayAgo = new Date(Date.now() - 24 * 3600 * 1000);
      const recentEmails = await Email.find({
        userId: user._id,
        receivedAt: { $gte: oneDayAgo },
      }).limit(30);

      if (recentEmails.length === 0) continue;

      try {
        const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
        const emailSummaries = recentEmails.map((e) => `- From: ${e.from.name}, Subject: ${e.subject}`).join('\n');

        const prompt = `
Generate a concise executive daily briefing for the user's inbox activity over the last 24 hours.
Inbox items:
${emailSummaries}

Return ONLY valid JSON:
{
  "summary": "High-level 2-3 sentence overview of today's correspondence",
  "urgentCount": 1,
  "actionItems": ["Action 1", "Action 2"],
  "keyTopics": ["Topic A", "Topic B"]
}
`;

        let text = '';
        try {
          const res = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: prompt,
            config: { temperature: 0.2, responseMimeType: 'application/json' },
          });
          text = res.text?.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim() || '';
        } catch {
          const fallbackRes = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.2, responseMimeType: 'application/json' },
          });
          text = fallbackRes.text?.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim() || '';
        }
        if (text) {
          const parsed = JSON.parse(text);
          await DailySummary.create({
            userId: user._id,
            dateString: todayStr,
            summary: parsed.summary || 'Daily inbox summary',
            urgentCount: parsed.urgentCount || 0,
            actionItems: parsed.actionItems || [],
            keyTopics: parsed.keyTopics || [],
            emailCount: recentEmails.length,
          });
        }
      } catch (err: any) {
        console.warn(`Daily summary generation skipped for user ${user.email}:`, err.message);
      }
    }
  } catch (err: any) {
    console.warn('Daily summary sweep error:', err.message);
  }
}
