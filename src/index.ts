import { MACHINES } from './data';
import { getMachineName, getSection } from './machineLoader';
import { ACTION_SECTION, SECTION_LABEL, routeText } from './router';
import { askDeepSeek, buildSystemPrompt } from './ai';
import { aiFlexMessage, sectionFlexMessage } from './flex';
import { formatForLine, reply, showLoading, verifySignature } from './line';
import type { LineEvent } from './line';

export interface Env {
  LINE_CHANNEL_ACCESS_TOKEN: string;
  LINE_CHANNEL_SECRET: string;
  DEEPSEEK_API_KEY: string;
  MACHINE_STATE: KVNamespace;
}

interface WebhookBody {
  events: LineEvent[];
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'GET') {
      return new Response(`ok: ${Object.keys(MACHINES).length} machines`);
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const body = await request.text();
    const signature = request.headers.get('x-line-signature') ?? '';
    const valid = await verifySignature(body, signature, env.LINE_CHANNEL_SECRET);
    if (!valid) {
      return new Response('Unauthorized', { status: 401 });
    }

    const payload = JSON.parse(body) as WebhookBody;
    // LINE 側のタイムアウト切断を防ぐため、即 200 を返して後続は waitUntil で処理
    ctx.waitUntil(Promise.all(payload.events.map((event) => handleEvent(event, env))));
    return new Response('OK', { status: 200 });
  },
} satisfies ExportedHandler<Env>;

async function handleEvent(event: LineEvent, env: Env): Promise<void> {
  const userId = event.source?.userId;
  const replyToken = event.replyToken;
  if (!userId || !replyToken) return;

  if (event.type === 'message' && event.message?.type === 'text') {
    await handleText(userId, event.message.text ?? '', replyToken, env);
  } else if (event.type === 'postback') {
    await handlePostback(userId, event.postback?.data ?? '', replyToken, env);
  } else if (event.type === 'follow') {
    await reply(
      replyToken,
      [{ type: 'text', text: 'ようこそ。まず機種を選んでください。' }],
      env.LINE_CHANNEL_ACCESS_TOKEN,
    );
  }
}

async function handleText(
  userId: string,
  text: string,
  replyToken: string,
  env: Env,
): Promise<void> {
  const t = text.trim();

  // 機種ID or 機種名での選択（部分一致も許可）
  for (const [id, md] of Object.entries(MACHINES)) {
    const name = getMachineName(md);
    const byName = name && (t.includes(name) || (t.length >= 2 && name.includes(t)));
    if (t === id || byName) {
      await env.MACHINE_STATE.put(userId, id);
      await reply(
        replyToken,
        [
          {
            type: 'text',
            text: `${name || id} を選択しました。\n「特徴」「スペック」「通常時」「AT解説」「AT後」「ヤメ時」または自由に質問してください。`,
          },
        ],
        env.LINE_CHANNEL_ACCESS_TOKEN,
      );
      return;
    }
  }

  const machineId = await env.MACHINE_STATE.get(userId);
  if (!machineId || !MACHINES[machineId]) {
    await reply(
      replyToken,
      [{ type: 'text', text: '先に機種を選んでください。' }],
      env.LINE_CHANNEL_ACCESS_TOKEN,
    );
    return;
  }

  const md = MACHINES[machineId];
  const name = getMachineName(md);
  const route = routeText(t);

  if (route.kind === 'section') {
    const body = getSection(md, route.section);
    const label = SECTION_LABEL[route.section];
    await reply(
      replyToken,
      [body ? sectionFlexMessage(name, label, body) : { type: 'text', text: `${name}｜${label}\n記載がありません。` }],
      env.LINE_CHANNEL_ACCESS_TOKEN,
    );
    return;
  }

  // 自由質問は DeepSeek。Reply トークン失効リスクを避けるため高速モード固定。
  await showLoading(userId, env.LINE_CHANNEL_ACCESS_TOKEN, 5);
  try {
    const answer = await askDeepSeek({
      system: buildSystemPrompt(name, md),
      user: t,
      apiKey: env.DEEPSEEK_API_KEY,
    });
    const text = answer || 'うまく回答できませんでした。';
    const message =
      text.length <= 1200 ? aiFlexMessage(name, text) : { type: 'text' as const, text: formatForLine(text) };
    await reply(replyToken, [message], env.LINE_CHANNEL_ACCESS_TOKEN);
  } catch (err) {
    console.error('DeepSeek failed', err);
    await reply(
      replyToken,
      [{ type: 'text', text: '回答の生成に失敗しました。少し待って再度お試しください。' }],
      env.LINE_CHANNEL_ACCESS_TOKEN,
    );
  }
}

async function handlePostback(
  userId: string,
  data: string,
  replyToken: string,
  env: Env,
): Promise<void> {
  const params = new URLSearchParams(data);
  const machineId = params.get('machine');
  const action = params.get('action');

  if (machineId && MACHINES[machineId]) {
    await env.MACHINE_STATE.put(userId, machineId);
  }

  // 機種選択ボタン（機種未指定）→ 機種一覧をクイックリプライで提示
  if (action === 'select' && !machineId) {
    await reply(replyToken, [machineSelectMessage()], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }

  if (action === 'help') {
    await reply(replyToken, [{ type: 'text', text: HELP_TEXT }], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }

  const current =
    machineId && MACHINES[machineId] ? machineId : await env.MACHINE_STATE.get(userId);
  if (!current || !MACHINES[current]) {
    await reply(
      replyToken,
      [{ type: 'text', text: '機種を選んでください。' }],
      env.LINE_CHANNEL_ACCESS_TOKEN,
    );
    return;
  }

  const md = MACHINES[current];
  const name = getMachineName(md);
  const section = action ? ACTION_SECTION[action] : undefined;

  if (section) {
    const body = getSection(md, section);
    const label = SECTION_LABEL[section];
    await reply(
      replyToken,
      [body ? sectionFlexMessage(name, label, body) : { type: 'text', text: `${name}｜${label}\n記載がありません。` }],
      env.LINE_CHANNEL_ACCESS_TOKEN,
    );
    return;
  }

  await reply(
    replyToken,
    [{ type: 'text', text: `${name} を選択しました。` }],
    env.LINE_CHANNEL_ACCESS_TOKEN,
  );
}

const HELP_TEXT = [
  '【使い方】',
  '下のメニューから操作できます。',
  '・機種選択: 機種を切り替え',
  '・特徴: 台の特徴まとめを表示',
  '・スペック / 通常時 / AT解説 / AT後 / ヤメ時: 定型情報を表示',
  '・自由質問: そのままメッセージを送信',
  '例:「380Gから打てる？」',
].join('\n');

function machineSelectMessage() {
  const items = Object.entries(MACHINES).map(([id, md]) => {
    const name = getMachineName(md) || id;
    return {
      type: 'action' as const,
      action: {
        type: 'postback' as const,
        label: name.slice(0, 20),
        data: `machine=${id}&action=select`,
        displayText: name,
      },
    };
  });
  return {
    type: 'text' as const,
    text: '機種を選んでください。',
    quickReply: { items: items.slice(0, 13) },
  };
}
