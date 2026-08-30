import { describe, it, expect, beforeEach } from 'vitest';
import { DemoDataStore } from './demoData.service.js';

describe('Isolated Demo Data Store', () => {
  beforeEach(() => {
    DemoDataStore.reset();
  });

  it('should retrieve seeded emails with inbox filter', () => {
    const inbox = DemoDataStore.getEmails({ folder: 'inbox' });
    expect(inbox.length).toBeGreaterThan(0);
    expect(inbox.some((e) => e.subject.includes('URGENT'))).toBe(true);
  });

  it('should support category filtering', () => {
    const finance = DemoDataStore.getEmails({ category: 'Finance' });
    expect(finance.length).toBeGreaterThan(0);
    expect(finance[0].aiAnalysis.category).toBe('Finance');
  });

  it('should support priority filtering', () => {
    const urgent = DemoDataStore.getEmails({ priority: 'urgent' });
    expect(urgent.length).toBeGreaterThan(0);
    expect(urgent[0].aiAnalysis.priority).toBe('urgent');
  });

  it('should mark read and star without altering external state', () => {
    const first = DemoDataStore.getEmails({})[0];
    DemoDataStore.markRead(first.id, true);
    expect(DemoDataStore.getEmailById(first.id)?.isRead).toBe(true);

    DemoDataStore.toggleStar(first.id, true);
    expect(DemoDataStore.getEmailById(first.id)?.isStarred).toBe(true);
  });

  it('should simulate sending new demo email', () => {
    const initialCount = DemoDataStore.getEmails({}).length;
    const sent = DemoDataStore.sendEmail({
      to: ['partner@company.com'],
      subject: 'Demo Meeting Proposal',
      body: 'Looking forward to meeting.',
    });

    expect(sent).toBeDefined();
    expect(sent.subject).toBe('Demo Meeting Proposal');
    expect(DemoDataStore.getEmails({}).length).toBe(initialCount + 1);
  });
});
