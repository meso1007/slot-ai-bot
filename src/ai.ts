export interface AskOptions {
  system: string;
  user: string;
  apiKey: string;
}

interface DeepSeekResponse {
  choices: { message: { content: string } }[];
}

export async function askDeepSeek(opts: AskOptions): Promise<string> {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
      stream: false,
      temperature: 0.3,
    }),
  });
  if (!res.ok) {
    throw new Error(`DeepSeek error ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as DeepSeekResponse;
  return data.choices[0]?.message?.content?.trim() ?? '';
}

export function buildSystemPrompt(machineName: string, md: string): string {
  return [
    `あなたはパチスロ機種「${machineName}」の立ち回りアシスタントです。`,
    '以下のMarkdownに書かれている情報だけを根拠に、簡潔に日本語で答えてください。',
    '- Markdownに書かれていない数値は絶対に出力しないこと。',
    '- 計算が必要な場合は暗算せず、Markdownの元数値をそのまま示すこと。',
    '- 不明な点は「記載がありません」と答えること。',
    '- 矢印（→）は使わず、処理の流れや手順は改行と「↓」で表現すること。',
    '',
    '# 機種データ',
    md,
  ].join('\n');
}
