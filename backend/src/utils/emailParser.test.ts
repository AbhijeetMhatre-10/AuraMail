import { describe, it, expect } from 'vitest';
import {
  parseEmailAddress,
  parseEmailList,
  htmlToPlainText,
  buildRawEmail,
  decodeBase64Url,
  encodeBase64Url,
} from './emailParser.js';

describe('Email Parser Utilities', () => {
  it('should parse complex name and email strings', () => {
    const parsed = parseEmailAddress('Sarah Jenkins <sarah.jenkins@acmecorp.com>');
    expect(parsed.name).toBe('Sarah Jenkins');
    expect(parsed.email).toBe('sarah.jenkins@acmecorp.com');

    const simple = parseEmailAddress('alex@example.com');
    expect(simple.name).toBe('alex');
    expect(simple.email).toBe('alex@example.com');
  });

  it('should parse comma-separated lists of recipients', () => {
    const list = parseEmailList('Alice <alice@test.com>, Bob <bob@test.com>, charlie@test.com');
    expect(list.length).toBe(3);
    expect(list[0].email).toBe('alice@test.com');
    expect(list[1].name).toBe('Bob');
    expect(list[2].email).toBe('charlie@test.com');
  });

  it('should convert HTML to clean plain text', () => {
    const html = '<p>Hello <strong>World</strong>!</p><p>Check this <a href="#">link</a>.</p>';
    const plain = htmlToPlainText(html);
    expect(plain).toContain('Hello World!');
    expect(plain).toContain('Check this link.');
    expect(plain).not.toContain('<p>');
  });

  it('should build and encode RFC 2822 email payload', () => {
    const raw = buildRawEmail({
      from: 'me@example.com',
      to: ['client@example.com'],
      subject: 'Project Kickoff',
      body: 'Hello team, let us begin.',
    });

    expect(raw).toBeDefined();
    expect(typeof raw).toBe('string');

    const decoded = decodeBase64Url(raw);
    expect(decoded).toContain('From: me@example.com');
    expect(decoded).toContain('To: client@example.com');
  });
});
