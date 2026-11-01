export interface LineEvent {
  type: string;
  replyToken?: string;
  source?: { userId?: string };
  message?: { type: string; text?: string };
  postback?: { data: string };
}

export type LineMessage = { type: 'text'; text: string; quickReply?: unknown };

export function formatForLine(text: string): string {
  return text
    .replace(/\s*(?:→|⇒|➡|➜|->)\s*/g, '\n  ↓\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function verifySignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!signature || !secret) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export async function reply(
  replyToken: string,
  messages: LineMessage[],
  accessToken: string,
): Promise<void> {
  const res = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  if (!res.ok) {
    console.error('LINE reply failed', res.status, await res.text());
  }
}

export async function showLoading(
  chatId: string,
  accessToken: string,
  loadingSeconds = 5,
): Promise<void> {
  const res = await fetch('https://api.line.me/v2/bot/chat/loading/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ chatId, loadingSeconds }),
  });
  if (!res.ok) {
    console.error('LINE loading indicator failed', res.status, await res.text());
  }
}
