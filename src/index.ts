import { MACHINES, MACHINE_ALIASES, MACHINE_ORDER } from './data';
import { getMachineName, getSection, type SectionKey } from './machineLoader';
import { ACTION_SECTION, SECTION_LABEL, routeText } from './router';
import { askDeepSeek, buildSystemPrompt } from './ai';
import { aiFlexMessage, linksFlexMessage, machinePickerFlexMessage, reviewFlexMessage, sectionFlexMessage } from './flex';
import { formatForLine, reply, showLoading, verifySignature } from './line';
import { matchIds } from './search';
import type { LineEvent, LineMessage } from './line';

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
      [await machineSelectMessage(userId, 0, env)],
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

  if (t === '次の機種へ' || t === '前へ') {
    const cur = Number((await env.MACHINE_STATE.get(`page:${userId}`)) ?? '0') || 0;
    const next = t === '次の機種へ' ? cur + 1 : cur - 1;
    await reply(replyToken, [await machineSelectMessage(userId, next, env)], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }

  if (MACHINES[t]) {
    await selectMachine(userId, t, replyToken, env);
    return;
  }

  const matched = findMachines(t);
  if (matched.length === 1) {
    await selectMachine(userId, matched[0], replyToken, env);
    return;
  }
  if (matched.length > 1) {
    await reply(replyToken, [candidateMessage(matched)], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }

  const machineId = await env.MACHINE_STATE.get(userId);
  if (!machineId || !MACHINES[machineId]) {
    await reply(replyToken, [await machineSelectMessage(userId, 0, env)], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }

  const md = MACHINES[machineId];
  const name = getMachineName(md);
  const route = routeText(t);

  if (route.kind === 'section') {
    const label = SECTION_LABEL[route.section];
    const message = renderSectionMessage(md, name, route.section);
    await reply(
      replyToken,
      [message ?? { type: 'text', text: `${name}｜${label}\n記載がありません。` }],
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
  const page = Number(params.get('page') ?? '0') || 0;

  if (machineId && MACHINES[machineId]) {
    await env.MACHINE_STATE.put(userId, machineId);
    await rememberMachine(userId, machineId, env);
  }

  // 機種選択（ページ送り含む）
  if (!machineId && (action === 'select' || params.has('page'))) {
    await reply(replyToken, [await machineSelectMessage(userId, page, env)], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }

  if (action === 'help') {
    await reply(replyToken, [{ type: 'text', text: HELP_TEXT }], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }

  const current =
    machineId && MACHINES[machineId] ? machineId : await env.MACHINE_STATE.get(userId);
  if (!current || !MACHINES[current]) {
    await reply(replyToken, [await machineSelectMessage(userId, 0, env)], env.LINE_CHANNEL_ACCESS_TOKEN);
    return;
  }

  const md = MACHINES[current];
  const name = getMachineName(md);
  const section = action ? ACTION_SECTION[action] : undefined;

  if (section) {
    const label = SECTION_LABEL[section];
    const message = renderSectionMessage(md, name, section);
    await reply(
      replyToken,
      [message ?? { type: 'text', text: `${name}｜${label}\n記載がありません。` }],
      env.LINE_CHANNEL_ACCESS_TOKEN,
    );
    return;
  }

  await selectMachine(userId, current, replyToken, env);
}

const HELP_TEXT = [
  '【使い方】',
  '下のメニューから操作できます。',
  '・機種選択: ボタン or 機種名の入力で切り替え',
  '・特徴 / 評価 / 類似機種: まとめ・評判・近い台を表示',
  '・スペック / 通常時 / AT解説 / AT後 / ヤメ時: 定型情報を表示',
  '・自由質問: そのままメッセージを送信',
  '例:「380Gから打てる？」',
].join('\n');

function findMachines(query: string): string[] {
  return matchIds(
    query,
    Object.entries(MACHINES).map(([id, md]) => ({
      id,
      name: getMachineName(md) || id,
      aliases: MACHINE_ALIASES[id],
    })),
  );
}

function getLinks(md: string): { label: string; uri: string }[] {
  const body = getSection(md, 'SOURCES');
  if (!body) return [];
  const links: { label: string; uri: string }[] = [];
  for (const raw of body.split('\n')) {
    const line = raw.replace(/^[-・]\s*/, '').trim();
    const m = line.match(/(https?:\/\/\S+)/);
    if (!m) continue;
    const uri = m[1];
    const label = line.replace(uri, '').trim();
    links.push({
      label: label.length > 60 ? `${label.slice(0, 60)}…` : label || uri,
      uri,
    });
  }
  return links;
}

function pickDetailLink(links: { label: string; uri: string }[]) {
  const hit = links.find((l) =>
    /設定判別|設定示唆|解析|天井|やめどき|ヤメ時|フロー/.test(l.label),
  );
  const link = hit ?? links[0];
  return link ? { label: '設定示唆・フローを詳しく見る', uri: link.uri } : undefined;
}

function renderSectionMessage(
  md: string,
  name: string,
  section: SectionKey,
): LineMessage | null {
  if (section === 'LINKS') {
    return linksFlexMessage(name, getLinks(md));
  }
  const detail = pickDetailLink(getLinks(md));
  if (section === 'REVIEW') {
    const review = getSection(md, 'REVIEW');
    const summary = getSection(md, 'SUMMARY');
    return review ? reviewFlexMessage(name, summary, review, detail) : null;
  }
  const body = getSection(md, section);
  return body ? sectionFlexMessage(name, SECTION_LABEL[section], body, detail) : null;
}

async function selectMachine(
  userId: string,
  id: string,
  replyToken: string,
  env: Env,
): Promise<void> {
  await env.MACHINE_STATE.put(userId, id);
  await rememberMachine(userId, id, env);
  const md = MACHINES[id];
  const name = getMachineName(md) || id;

  const message = renderSectionMessage(md, name, 'REVIEW');
  await reply(
    replyToken,
    [
      message ?? {
        type: 'text',
        text: `${name} を選択しました。\n「特徴」「評価」「スペック」「通常時」「AT解説」「AT後」「ヤメ時」または自由に質問してください。`,
      },
    ],
    env.LINE_CHANNEL_ACCESS_TOKEN,
  );
}

function candidateMessage(ids: string[]) {
  const items = ids.slice(0, 13).map((id) => {
    const name = getMachineName(MACHINES[id]) || id;
    return {
      type: 'action' as const,
      action: {
        type: 'message' as const,
        label: name.slice(0, 20),
        text: name,
      },
    };
  });
  const extra = ids.length > 13 ? '\n候補が多いため、機種名を詳しく入力してください。' : '';
  return {
    type: 'text' as const,
    text: `候補が複数あります。選んでください。${extra}`,
    quickReply: { items },
  };
}

const PAGE_SIZE = 11;

async function getRecent(userId: string, env: Env): Promise<string[]> {
  const raw = await env.MACHINE_STATE.get(`recent:${userId}`);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

async function rememberMachine(userId: string, id: string, env: Env): Promise<void> {
  const recent = await getRecent(userId, env);
  const next = [id, ...recent.filter((x) => x !== id)].slice(0, 30);
  await env.MACHINE_STATE.put(`recent:${userId}`, JSON.stringify(next));
}

function orderedMachineIds(recent: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (id: string): void => {
    if (MACHINES[id] && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  };
  recent.forEach(add);
  MACHINE_ORDER.forEach(add);
  Object.keys(MACHINES).forEach(add);
  return out;
}

async function machineSelectMessage(userId: string, page: number, env: Env) {
  const recent = await getRecent(userId, env);
  const ids = orderedMachineIds(recent);
  const totalPages = Math.max(1, Math.ceil(ids.length / PAGE_SIZE));
  const p = Math.min(Math.max(0, page), totalPages - 1);
  await env.MACHINE_STATE.put(`page:${userId}`, String(p));
  const items = ids.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE).map((id) => ({
    id,
    name: getMachineName(MACHINES[id]) || id,
  }));
  return machinePickerFlexMessage({ page: p, totalPages, total: ids.length, items, recent });
}
