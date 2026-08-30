export interface ParsedEmailAddress {
  name: string;
  email: string;
  raw: string;
}

export interface ParsedGmailMessage {
  id: string;
  threadId: string;
  from: ParsedEmailAddress;
  to: ParsedEmailAddress[];
  cc: ParsedEmailAddress[];
  bcc: ParsedEmailAddress[];
  subject: string;
  snippet: string;
  bodyText: string;
  bodyHtml: string;
  date: Date;
  labels: string[];
  messageIdHeader?: string;
  inReplyTo?: string;
  references?: string;
  hasAttachments: boolean;
}

/**
 * Decodes Gmail URL-safe Base64 string to utf8 string
 */
export function decodeBase64Url(data: string): string {
  if (!data) return '';
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch (error) {
    return '';
  }
}

/**
 * Encodes string or Buffer to Gmail URL-safe Base64
 */
export function encodeBase64Url(data: string | Buffer): string {
  const buffer = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Parses email address string like 'John Doe <john@example.com>' or 'john@example.com'
 */
export function parseEmailAddress(raw: string): ParsedEmailAddress {
  if (!raw) return { name: '', email: '', raw: '' };

  const trimmed = raw.trim();
  const match = trimmed.match(/^(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)$/);

  if (match) {
    const name = match[1] ? match[1].trim() : match[2].split('@')[0];
    const email = match[2].trim().toLowerCase();
    return { name, email, raw: trimmed };
  }

  return { name: trimmed.split('@')[0], email: trimmed.toLowerCase(), raw: trimmed };
}

/**
 * Parses comma-separated list of email addresses
 */
export function parseEmailList(rawList?: string): ParsedEmailAddress[] {
  if (!rawList) return [];
  // Split on commas that are not inside quotes
  const addresses = rawList.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  return addresses.map((addr) => parseEmailAddress(addr)).filter((a) => a.email);
}

/**
 * Recursively extracts plain text and HTML bodies from Gmail message payload parts
 */
export function extractBodyParts(payload: any): { text: string; html: string } {
  let text = '';
  let html = '';

  if (!payload) return { text, html };

  if (payload.body && payload.body.data) {
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType === 'text/plain') {
      text += decoded;
    } else if (payload.mimeType === 'text/html') {
      html += decoded;
    }
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text += decodeBase64Url(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html += decodeBase64Url(part.body.data);
      } else if (part.parts) {
        const nested = extractBodyParts(part);
        if (nested.text) text += nested.text;
        if (nested.html) html += nested.html;
      }
    }
  }

  return { text, html };
}

/**
 * Parses full Gmail API message object into structured format
 */
export function parseGmailMessage(message: any): ParsedGmailMessage {
  const headers = message.payload?.headers || [];
  const getHeader = (name: string): string => {
    const h = headers.find((item: any) => item.name?.toLowerCase() === name.toLowerCase());
    return h ? h.value : '';
  };

  const from = parseEmailAddress(getHeader('From'));
  const to = parseEmailList(getHeader('To'));
  const cc = parseEmailList(getHeader('Cc'));
  const bcc = parseEmailList(getHeader('Bcc'));
  const subject = getHeader('Subject') || '(No Subject)';
  const dateStr = getHeader('Date');
  const messageIdHeader = getHeader('Message-ID');
  const inReplyTo = getHeader('In-Reply-To');
  const references = getHeader('References');

  const { text, html } = extractBodyParts(message.payload);

  const internalDateMs = message.internalDate ? parseInt(message.internalDate, 10) : undefined;
  const date = internalDateMs ? new Date(internalDateMs) : dateStr ? new Date(dateStr) : new Date();

  const hasAttachments = Boolean(
    message.payload?.parts?.some((part: any) => part.filename && part.filename.length > 0)
  );

  return {
    id: message.id,
    threadId: message.threadId,
    from,
    to,
    cc,
    bcc,
    subject,
    snippet: message.snippet || '',
    bodyText: text || htmlToPlainText(html) || message.snippet || '',
    bodyHtml: html || (text ? `<p>${escapeHtml(text).replace(/\n/g, '<br/>')}</p>` : ''),
    date,
    labels: message.labelIds || [],
    messageIdHeader,
    inReplyTo,
    references,
    hasAttachments,
  };
}

/**
 * Strips HTML tags to plain text
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface BuildRawEmailOptions {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  inReplyTo?: string;
  references?: string;
  threadId?: string;
}

/**
 * Builds RFC 2822 raw email string formatted for Gmail users.messages.send API
 */
export function buildRawEmail(options: BuildRawEmailOptions): string {
  const { from, to, cc, bcc, subject, body, isHtml = false, inReplyTo, references } = options;

  const lines: string[] = [
    `From: ${from}`,
    `To: ${to.join(', ')}`,
  ];

  if (cc && cc.length > 0) {
    lines.push(`Cc: ${cc.join(', ')}`);
  }
  if (bcc && bcc.length > 0) {
    lines.push(`Bcc: ${bcc.join(', ')}`);
  }

  lines.push(`Subject: =?UTF-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`);
  lines.push('MIME-Version: 1.0');

  if (inReplyTo) {
    lines.push(`In-Reply-To: ${inReplyTo}`);
  }
  if (references) {
    lines.push(`References: ${references}`);
  }

  const contentType = isHtml ? 'text/html; charset=UTF-8' : 'text/plain; charset=UTF-8';
  lines.push(`Content-Type: ${contentType}`);
  lines.push('Content-Transfer-Encoding: base64');
  lines.push(''); // Blank line separates headers from body

  const base64Body = Buffer.from(body, 'utf-8').toString('base64');
  lines.push(base64Body);

  const raw = lines.join('\r\n');
  return encodeBase64Url(raw);
}
