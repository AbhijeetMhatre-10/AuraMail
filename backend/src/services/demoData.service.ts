import mongoose from 'mongoose';
import { IEmail } from '../models/Email.js';
import { IEmailThread } from '../models/EmailThread.js';
import { IAIAnalysis } from '../models/AIAnalysis.js';
import { IEmailActivity } from '../models/EmailActivity.js';
import { IUser } from '../models/User.js';

export const DEMO_USER_ID = new mongoose.Types.ObjectId('66c011111111111111111111');
export const DEMO_ACCOUNT_ID = new mongoose.Types.ObjectId('66c022222222222222222222');

export const DEMO_USER_DATA: Partial<IUser> = {
  _id: DEMO_USER_ID as any,
  googleId: 'demo_google_id_aura_9988',
  email: 'alex.morgan.demo@auramail.ai',
  name: 'Alex Morgan',
  picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isDemoUser: true,
  preferences: {
    defaultTone: 'Professional',
    autoSummarize: true,
    autoCategorize: true,
    theme: 'dark',
  },
  lastLogin: new Date(),
};

export interface DemoSeedEmail {
  id: string;
  threadId: string;
  from: { name: string; email: string; raw: string };
  to: { name: string; email: string; raw: string }[];
  cc?: { name: string; email: string; raw: string }[];
  bcc?: { name: string; email: string; raw: string }[];
  subject: string;
  snippet: string;
  bodyText: string;
  bodyHtml: string;
  receivedAt: Date;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isSent: boolean;
  isTrash: boolean;
  labels: string[];
  aiAnalysis: {
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
  };
}

const now = Date.now();
const hour = 3600 * 1000;
const day = 24 * hour;

export const INITIAL_DEMO_EMAILS: DemoSeedEmail[] = [
  {
    id: 'demo_msg_01',
    threadId: 'demo_thread_01',
    from: { name: 'Sarah Jenkins', email: 'sarah.jenkins@acmecorp.com', raw: 'Sarah Jenkins <sarah.jenkins@acmecorp.com>' },
    to: [{ name: 'Alex Morgan', email: 'alex.morgan.demo@auramail.ai', raw: 'Alex Morgan <alex.morgan.demo@auramail.ai>' }],
    subject: 'URGENT: Q3 Board Deck & Product Strategy Sign-off Needed',
    snippet: 'Hi Alex, we need the final sign-off on the Q3 Product Deck before tomorrow 10:00 AM EST for the board meeting...',
    bodyText: `Hi Alex,\n\nI hope you're having a productive week. We are finalizing the presentation materials for the upcoming Q3 Board Meeting.\n\nCould you please review the attached slides (specifically slides 12-18 covering the Enterprise AI roadmap) and give your sign-off before tomorrow, Thursday at 10:00 AM EST?\n\nIf you have any revisions or questions regarding the revenue projection models, let's jump on a quick sync this afternoon.\n\nBest regards,\nSarah Jenkins\nVP of Product, Acme Corp`,
    bodyHtml: `<p>Hi Alex,</p><p>I hope you're having a productive week. We are finalizing the presentation materials for the upcoming <strong>Q3 Board Meeting</strong>.</p><p>Could you please review the attached slides (specifically slides 12-18 covering the <em>Enterprise AI roadmap</em>) and give your sign-off before <strong>tomorrow, Thursday at 10:00 AM EST</strong>?</p><p>If you have any revisions or questions regarding the revenue projection models, let's jump on a quick sync this afternoon.</p><p>Best regards,<br/><strong>Sarah Jenkins</strong><br/>VP of Product, Acme Corp</p>`,
    receivedAt: new Date(now - 1 * hour),
    isRead: false,
    isStarred: true,
    isArchived: false,
    isSent: false,
    isTrash: false,
    labels: ['INBOX', 'IMPORTANT', 'UNREAD'],
    aiAnalysis: {
      summary: 'Sarah requests immediate sign-off on slides 12-18 of the Q3 Board Deck before Thursday 10:00 AM EST, with an optional sync this afternoon if revisions are needed.',
      category: 'Urgent',
      categoryConfidence: 0.98,
      priority: 'urgent',
      priorityScore: 95,
      priorityReason: 'Executive board meeting deadline within 24 hours requiring direct sign-off.',
      importance: 'high',
      spamRisk: 'none',
      phishingRisk: 'none',
      spamPhishingReasons: ['Legitimate known enterprise contact', 'Verified corporate sender'],
      actionItems: [
        'Review slides 12-18 (Enterprise AI roadmap)',
        'Provide sign-off before Thursday 10:00 AM EST',
        'Optional: Schedule afternoon sync for revenue model questions',
      ],
      deadlines: [
        { description: 'Sign-off on Q3 Board Deck', dueDate: 'Tomorrow (Thursday) 10:00 AM EST' },
      ],
      keyEntities: ['Acme Corp', 'Q3 Board Meeting', 'Sarah Jenkins', 'Enterprise AI roadmap'],
      sentiment: 'urgent',
      explanation: 'Sarah Jenkins needs you to approve the product strategy presentation for an executive board meeting. The deadline is strict (tomorrow morning). You should review the slides and respond quickly.',
      suggestedQuickReplies: [
        'I will review slides 12-18 right now and send sign-off by 5 PM.',
        'Looks solid, Sarah. You have my full sign-off for tomorrow.',
        'Let us do a 15-min sync at 3:30 PM to align on slide 15.',
      ],
      generatedSubject: 'Approved: Q3 Board Deck & Product Strategy Review',
    },
  },
  {
    id: 'demo_msg_02',
    threadId: 'demo_thread_02',
    from: { name: 'Stripe Billing', email: 'invoices@stripe.com', raw: 'Stripe Billing <invoices@stripe.com>' },
    to: [{ name: 'Alex Morgan', email: 'alex.morgan.demo@auramail.ai', raw: 'Alex Morgan <alex.morgan.demo@auramail.ai>' }],
    subject: 'Receipt for Invoice #INV-2026-8849 - Cloud Infrastructure Tier',
    snippet: 'Your payment of $1,450.00 USD for Cloud Compute Services was successful on August 26, 2026...',
    bodyText: `Your receipt for invoice #INV-2026-8849 is available.\n\nAmount paid: $1,450.00 USD\nPayment method: Visa ending in 4022\nDate: August 26, 2026\nService: Cloud Infrastructure & Database Tier\n\nYou can download the full PDF invoice directly from your customer portal.`,
    bodyHtml: `<div style="font-family: sans-serif;"><h3>Payment Receipt</h3><p>Your payment of <strong>$1,450.00 USD</strong> for invoice <code>#INV-2026-8849</code> was processed successfully.</p><table style="width:100%; border-collapse: collapse;"><tr><td><strong>Plan:</strong></td><td>Cloud Infrastructure & DB Tier</td></tr><tr><td><strong>Card:</strong></td><td>Visa ending in 4022</td></tr></table><p><a href="#" style="color:#6366f1;">Download PDF Tax Receipt</a></p></div>`,
    receivedAt: new Date(now - 4 * hour),
    isRead: true,
    isStarred: false,
    isArchived: false,
    isSent: false,
    isTrash: false,
    labels: ['INBOX', 'CATEGORY_FINANCE'],
    aiAnalysis: {
      summary: 'Stripe processed a payment receipt of $1,450.00 for Cloud Infrastructure & DB Tier on Visa ending in 4022.',
      category: 'Finance',
      categoryConfidence: 0.99,
      priority: 'low',
      priorityScore: 25,
      priorityReason: 'Automated billing confirmation receipt with no required action.',
      importance: 'normal',
      spamRisk: 'none',
      phishingRisk: 'none',
      spamPhishingReasons: ['Verified cryptographic signatures from stripe.com'],
      actionItems: ['Forward to accounting/finance ledger for monthly records'],
      deadlines: [],
      keyEntities: ['Stripe', 'Invoice #INV-2026-8849', 'Cloud Infrastructure'],
      sentiment: 'neutral',
      explanation: 'This is an automatic payment receipt confirming your monthly cloud hosting bill was paid. No immediate action is required other than bookkeeping.',
      suggestedQuickReplies: ['Forwarded to accounting@company.com.', 'Archived for bookkeeping.'],
      generatedSubject: 'Receipt Confirmation: Stripe Invoice #INV-2026-8849',
    },
  },
  {
    id: 'demo_msg_03',
    threadId: 'demo_thread_03',
    from: { name: 'IT Security Desk', email: 'security-alert@verify-acc-login-online.net', raw: 'IT Security Desk <security-alert@verify-acc-login-online.net>' },
    to: [{ name: 'Alex Morgan', email: 'alex.morgan.demo@auramail.ai', raw: 'Alex Morgan <alex.morgan.demo@auramail.ai>' }],
    subject: 'CRITICAL SECURITY: Your email password expires in 2 hours - Re-authenticate now',
    snippet: 'Dear user, your mailbox access will be permanently suspended in 2 hours. Click here to verify credentials...',
    bodyText: `Dear Valued User,\n\nWe detected suspicious activity on your email account. Your credentials will be terminated in 2 hours unless you confirm your identity.\n\nClick the link below immediately to verify your account:\nhttp://verify-acc-login-online.net/auth-portal/login.php?user=alex\n\nIT Support Division`,
    bodyHtml: `<p style="color:red; font-weight:bold;">CRITICAL NOTICE</p><p>We detected unauthorized login attempts from IP 185.220.101.5. Click below to verify your account immediately:</p><p><a href="http://verify-acc-login-online.net/auth-portal/login.php" style="background:red; color:white; padding:8px 16px; text-decoration:none; border-radius:4px;">Re-Authenticate Mailbox</a></p>`,
    receivedAt: new Date(now - 8 * hour),
    isRead: false,
    isStarred: false,
    isArchived: false,
    isSent: false,
    isTrash: false,
    labels: ['INBOX', 'UNREAD'],
    aiAnalysis: {
      summary: 'Suspicious email claiming mailbox expiration in 2 hours and demanding credential re-authentication on a suspicious external domain.',
      category: 'Spam',
      categoryConfidence: 0.99,
      priority: 'low',
      priorityScore: 10,
      priorityReason: 'High-risk phishing attempt pretending to be corporate IT security.',
      importance: 'low',
      spamRisk: 'high',
      phishingRisk: 'high',
      spamPhishingReasons: [
        'Mismatched domain: sender uses untrusted domain "verify-acc-login-online.net"',
        'Classic credential harvesting urgency tactic ("expires in 2 hours")',
        'Unsafe HTTP authentication link detected',
      ],
      actionItems: ['Do NOT click any links or enter passwords', 'Mark as phishing and delete immediately'],
      deadlines: [],
      keyEntities: ['Fake IT Support', 'Suspicious link'],
      sentiment: 'negative',
      explanation: 'WARNING: This is a phishing attack attempting to steal your password. The sender is pretending to be IT support from an unofficial domain. Do not click anything.',
      suggestedQuickReplies: ['[Do not reply to phishing]'],
      generatedSubject: 'Phishing Warning: Suspicious Login Alert',
    },
  },
  {
    id: 'demo_msg_04',
    threadId: 'demo_thread_04',
    from: { name: 'David Chen', email: 'david.chen@designcraft.io', raw: 'David Chen <david.chen@designcraft.io>' },
    to: [{ name: 'Alex Morgan', email: 'alex.morgan.demo@auramail.ai', raw: 'Alex Morgan <alex.morgan.demo@auramail.ai>' }],
    subject: 'Updated Mobile App UI Designs & Design System Tokens (Figma)',
    snippet: 'Hey Alex, we wrapped up the updated UI components for the dark mode email client. Take a look at the Figma link...',
    bodyText: `Hey Alex,\n\nOur design team wrapped up the v2 design tokens and mobile viewport components for the email client app.\n\nKey updates in this release:\n1. Polished dark mode contrast and glassmorphic navigation bars\n2. Streamlined AI insight drawer with quick chip actions\n3. Micro-interaction animations for swipe to archive\n\nLink to Figma: https://figma.com/@designcraft/auramail-v2\n\nLet me know your feedback by Friday so we can hand off assets to the engineering sprint!\n\nCheers,\nDavid`,
    bodyHtml: `<p>Hey Alex,</p><p>Our design team wrapped up the v2 design tokens and mobile viewport components for the email client app.</p><p><strong>Key updates in this release:</strong></p><ul><li>Polished dark mode contrast &amp; glassmorphic navigation</li><li>Streamlined AI insight drawer with quick chip actions</li><li>Micro-interaction animations for swipe actions</li></ul><p><a href="https://figma.com/@designcraft/auramail-v2" style="color:#6366f1; text-decoration:underline;">Open Figma Workspace &rarr;</a></p><p>Let me know your feedback by Friday so we can hand off assets to the engineering sprint!</p><p>Cheers,<br/><strong>David Chen</strong></p>`,
    receivedAt: new Date(now - 14 * hour),
    isRead: true,
    isStarred: true,
    isArchived: false,
    isSent: false,
    isTrash: false,
    labels: ['INBOX', 'CATEGORY_WORK'],
    aiAnalysis: {
      summary: 'David shared the finalized v2 UI designs and design system in Figma, requesting design feedback before Friday for the upcoming sprint handoff.',
      category: 'Work',
      categoryConfidence: 0.96,
      priority: 'high',
      priorityScore: 78,
      priorityReason: 'Design feedback required before Friday engineering handoff.',
      importance: 'high',
      spamRisk: 'none',
      phishingRisk: 'none',
      spamPhishingReasons: ['Verified partner domain designcraft.io'],
      actionItems: [
        'Review Figma v2 mobile and dark mode designs',
        'Provide feedback to David before Friday',
      ],
      deadlines: [
        { description: 'Provide UI feedback on Figma v2', dueDate: 'This Friday 5:00 PM' }
      ],
      keyEntities: ['Figma', 'David Chen', 'DesignCraft', 'Dark Mode UI'],
      sentiment: 'positive',
      explanation: 'David Chen sent the new design files for the email client. He needs your review and comments before Friday so development can proceed on schedule.',
      suggestedQuickReplies: [
        'The designs look incredible David! I will leave detailed comments in Figma today.',
        'Reviewing now, loving the new AI insight drawer micro-interactions.',
        'Can we hop on a quick 10-minute walkthrough tomorrow morning?',
      ],
      generatedSubject: 'Feedback: Mobile App UI & Figma Design Review',
    },
  },
  {
    id: 'demo_msg_05',
    threadId: 'demo_thread_05',
    from: { name: 'Elena Rostova', email: 'elena.rostova@globex.org', raw: 'Elena Rostova <elena.rostova@globex.org>' },
    to: [{ name: 'Alex Morgan', email: 'alex.morgan.demo@auramail.ai', raw: 'Alex Morgan <alex.morgan.demo@auramail.ai>' }],
    subject: 'Coffee catchup & Partnership brainstorm next week?',
    snippet: 'Hi Alex! It was wonderful meeting you at the AI Tech Summit last week. Are you free for a coffee in downtown next Tuesday...',
    bodyText: `Hi Alex,\n\nIt was great chatting with you at the AI Tech Summit last Thursday. I really enjoyed hearing about your work with Gemini-powered productivity workflows.\n\nI will be in town next Tuesday and Wednesday. Are you available for a 30-minute coffee catchup near Market St? I would love to explore potential collaboration opportunities between our teams.\n\nWarm regards,\nElena Rostova\nDirector of Partnerships, Globex`,
    bodyHtml: `<p>Hi Alex,</p><p>It was great chatting with you at the <strong>AI Tech Summit</strong> last Thursday. I really enjoyed hearing about your work with Gemini-powered productivity workflows.</p><p>I will be in town next Tuesday and Wednesday. Are you available for a 30-minute coffee catchup near Market St? I'd love to explore potential collaboration opportunities between our teams.</p><p>Warm regards,<br/><strong>Elena Rostova</strong><br/>Director of Partnerships, Globex</p>`,
    receivedAt: new Date(now - 1 * day),
    isRead: true,
    isStarred: false,
    isArchived: false,
    isSent: false,
    isTrash: false,
    labels: ['INBOX', 'CATEGORY_PERSONAL'],
    aiAnalysis: {
      summary: 'Elena follows up from the AI Tech Summit and invites Alex for a 30-minute coffee meeting next Tuesday or Wednesday to explore partnership opportunities.',
      category: 'Personal',
      categoryConfidence: 0.88,
      priority: 'medium',
      priorityScore: 60,
      priorityReason: 'Networking and partnership opportunity with flexible scheduling.',
      importance: 'normal',
      spamRisk: 'none',
      phishingRisk: 'none',
      spamPhishingReasons: ['Legitimate conference contact'],
      actionItems: ['Check calendar for Tuesday/Wednesday availability', 'Reply to Elena with preferred time and location'],
      deadlines: [{ description: 'Respond regarding next week coffee catchup', dueDate: 'End of week' }],
      keyEntities: ['Elena Rostova', 'Globex', 'AI Tech Summit', 'Market St'],
      sentiment: 'positive',
      explanation: 'Elena is following up on your conference conversation to meet in person next week for a casual business partnership discussion.',
      suggestedQuickReplies: [
        'Hi Elena, Tuesday at 10 AM on Market St works great for me!',
        'Great to hear from you Elena! Let us meet Wednesday at 2 PM.',
        'Thanks Elena! I am traveling next week, could we do a virtual call instead?',
      ],
      generatedSubject: 'Coffee Catchup: Re AI Summit Follow-up',
    },
  },
  {
    id: 'demo_msg_06',
    threadId: 'demo_thread_06',
    from: { name: 'Alex Morgan', email: 'alex.morgan.demo@auramail.ai', raw: 'Alex Morgan <alex.morgan.demo@auramail.ai>' },
    to: [{ name: 'Marcus Vance', email: 'm.vance@investorcap.vc', raw: 'Marcus Vance <m.vance@investorcap.vc>' }],
    subject: 'AuraMail Product Metrics & Growth Trajectory - August Update',
    snippet: 'Hi Marcus, attached is our monthly investor update for August. We reached 120,000 active inbox synchronizations...',
    bodyText: `Hi Marcus,\n\nHope you're having a great month. Attached is our August Investor Update.\n\nHighlights:\n- Reached 120k monthly active inbox synchronizations (+28% MoM)\n- Gemini 2.5 Flash email summarization latency dropped below 350ms\n- User retention at day 30 increased to 64%\n\nLet me know if you have any questions before our monthly investor call.\n\nBest,\nAlex`,
    bodyHtml: `<p>Hi Marcus,</p><p>Hope you're having a great month. Attached is our August Investor Update.</p><p><strong>Highlights:</strong></p><ul><li>Reached 120k monthly active inbox synchronizations (+28% MoM)</li><li>Gemini 2.5 Flash email summarization latency dropped below 350ms</li><li>User retention at day 30 increased to 64%</li></ul><p>Let me know if you have any questions before our monthly investor call.</p><p>Best,<br/>Alex</p>`,
    receivedAt: new Date(now - 2 * day),
    isRead: true,
    isStarred: false,
    isArchived: false,
    isSent: true,
    isTrash: false,
    labels: ['SENT'],
    aiAnalysis: {
      summary: 'Sent monthly investor update detailing 120k MAU growth, sub-350ms AI summarization latency, and 64% 30-day retention.',
      category: 'Work',
      categoryConfidence: 0.95,
      priority: 'medium',
      priorityScore: 50,
      priorityReason: 'Sent monthly update',
      importance: 'normal',
      spamRisk: 'none',
      phishingRisk: 'none',
      spamPhishingReasons: [],
      actionItems: [],
      deadlines: [],
      keyEntities: ['Marcus Vance', 'Investor Update', 'AuraMail'],
      sentiment: 'positive',
      explanation: 'Sent status report to investors.',
      suggestedQuickReplies: [],
      generatedSubject: 'AuraMail Monthly Investor Update',
    },
  },
];

export class DemoDataStore {
  private static emails: DemoSeedEmail[] = JSON.parse(JSON.stringify(INITIAL_DEMO_EMAILS));
  private static activities: Array<{
    id: string;
    action: string;
    title: string;
    details?: any;
    timestamp: Date;
  }> = [
    {
      id: 'act_demo_1',
      action: 'ai_summarize',
      title: 'AI summarized email from Sarah Jenkins',
      details: { subject: 'URGENT: Q3 Board Deck & Product Strategy Sign-off Needed' },
      timestamp: new Date(now - 45 * 60 * 1000),
    },
    {
      id: 'act_demo_2',
      action: 'ai_classify',
      title: 'Classified email as Urgent (Priority: 95/100)',
      details: { category: 'Urgent', priority: 'urgent' },
      timestamp: new Date(now - 44 * 60 * 1000),
    },
    {
      id: 'act_demo_3',
      action: 'read',
      title: 'Marked email from Stripe Billing as read',
      details: { subject: 'Receipt for Invoice #INV-2026-8849' },
      timestamp: new Date(now - 3 * hour),
    },
    {
      id: 'act_demo_4',
      action: 'ai_smart_search',
      title: 'Smart Search: "Find all unread board meetings and deadlines"',
      details: { query: 'is:unread board meeting' },
      timestamp: new Date(now - 5 * hour),
    },
  ];

  static reset() {
    this.emails = JSON.parse(JSON.stringify(INITIAL_DEMO_EMAILS));
  }

  static getEmails(options: {
    folder?: 'inbox' | 'starred' | 'sent' | 'archive' | 'trash';
    category?: string;
    priority?: string;
    unreadOnly?: boolean;
    query?: string;
  }) {
    let result = [...this.emails];

    if (options.folder === 'inbox') {
      result = result.filter((e) => !e.isArchived && !e.isTrash && !e.isSent);
    } else if (options.folder === 'starred') {
      result = result.filter((e) => e.isStarred && !e.isTrash);
    } else if (options.folder === 'sent') {
      result = result.filter((e) => e.isSent && !e.isTrash);
    } else if (options.folder === 'archive') {
      result = result.filter((e) => e.isArchived && !e.isTrash);
    } else if (options.folder === 'trash') {
      result = result.filter((e) => e.isTrash);
    }

    if (options.category && options.category !== 'all') {
      result = result.filter(
        (e) => e.aiAnalysis.category.toLowerCase() === options.category!.toLowerCase()
      );
    }

    if (options.priority && options.priority !== 'all') {
      result = result.filter(
        (e) => e.aiAnalysis.priority.toLowerCase() === options.priority!.toLowerCase()
      );
    }

    if (options.unreadOnly) {
      result = result.filter((e) => !e.isRead);
    }

    if (options.query) {
      const q = options.query.toLowerCase();
      result = result.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.snippet.toLowerCase().includes(q) ||
          e.bodyText.toLowerCase().includes(q) ||
          e.from.name.toLowerCase().includes(q) ||
          e.from.email.toLowerCase().includes(q) ||
          e.aiAnalysis.summary.toLowerCase().includes(q)
      );
    }

    // Sort receivedAt descending
    result.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
    return result;
  }

  static getEmailById(id: string): DemoSeedEmail | undefined {
    return this.emails.find((e) => e.id === id);
  }

  static getThread(threadId: string): { id: string; messages: DemoSeedEmail[] } {
    const messages = this.emails
      .filter((e) => e.threadId === threadId && !e.isTrash)
      .sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime());
    return { id: threadId, messages };
  }

  static markRead(id: string, isRead = true) {
    const email = this.getEmailById(id);
    if (email) {
      email.isRead = isRead;
      this.logActivity(isRead ? 'read' : 'unread', `Marked "${email.subject}" as ${isRead ? 'read' : 'unread'}`);
    }
    return email;
  }

  static toggleStar(id: string, isStarred = true) {
    const email = this.getEmailById(id);
    if (email) {
      email.isStarred = isStarred;
      this.logActivity(isStarred ? 'star' : 'unstar', `${isStarred ? 'Starred' : 'Unstarred'} "${email.subject}"`);
    }
    return email;
  }

  static archive(id: string, isArchived = true) {
    const email = this.getEmailById(id);
    if (email) {
      email.isArchived = isArchived;
      this.logActivity('archive', `Archived "${email.subject}"`);
    }
    return email;
  }

  static deleteEmail(id: string) {
    const email = this.getEmailById(id);
    if (email) {
      email.isTrash = true;
      this.logActivity('delete', `Moved "${email.subject}" to Trash`);
    }
    return email;
  }

  static updateAIAnalysis(id: string, analysis: Partial<DemoSeedEmail['aiAnalysis']>) {
    const email = this.getEmailById(id);
    if (email) {
      email.aiAnalysis = { ...email.aiAnalysis, ...analysis };
    }
    return email;
  }

  static sendEmail(payload: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    isHtml?: boolean;
    inReplyTo?: string;
    threadId?: string;
  }) {
    const id = `demo_sent_${Date.now()}`;
    const threadId = payload.threadId || `demo_thread_${Date.now()}`;
    const newEmail: DemoSeedEmail = {
      id,
      threadId,
      from: { name: DEMO_USER_DATA.name!, email: DEMO_USER_DATA.email!, raw: `${DEMO_USER_DATA.name} <${DEMO_USER_DATA.email}>` },
      to: payload.to.map((addr) => ({ name: addr.split('@')[0], email: addr, raw: addr })),
      cc: payload.cc?.map((addr) => ({ name: addr.split('@')[0], email: addr, raw: addr })),
      bcc: payload.bcc?.map((addr) => ({ name: addr.split('@')[0], email: addr, raw: addr })),
      subject: payload.subject,
      snippet: payload.body.slice(0, 120),
      bodyText: payload.body,
      bodyHtml: payload.isHtml ? payload.body : `<p>${payload.body.replace(/\n/g, '<br/>')}</p>`,
      receivedAt: new Date(),
      isRead: true,
      isStarred: false,
      isArchived: false,
      isSent: true,
      isTrash: false,
      labels: ['SENT'],
      aiAnalysis: {
        summary: `Sent email regarding ${payload.subject}`,
        category: 'Work',
        categoryConfidence: 0.9,
        priority: 'medium',
        priorityScore: 50,
        priorityReason: 'Sent outgoing email',
        importance: 'normal',
        spamRisk: 'none',
        phishingRisk: 'none',
        spamPhishingReasons: [],
        actionItems: [],
        deadlines: [],
        keyEntities: [payload.to[0] || 'Recipient'],
        sentiment: 'neutral',
        explanation: 'Outgoing sent message.',
        suggestedQuickReplies: [],
        generatedSubject: payload.subject,
      },
    };

    this.emails.unshift(newEmail);
    this.logActivity(payload.inReplyTo ? 'reply' : 'send', `Sent email: "${payload.subject}" to ${payload.to.join(', ')}`);
    return newEmail;
  }

  static logActivity(action: string, title: string, details?: any) {
    this.activities.unshift({
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      title,
      details,
      timestamp: new Date(),
    });
  }

  static getActivities() {
    return this.activities;
  }
}
