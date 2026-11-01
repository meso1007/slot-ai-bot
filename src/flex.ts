import type { LineMessage } from './line';

interface SectionItem {
  label: string;
  value: string;
}

const C = {
  ink: '#0B1220',
  body: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  line: '#E2E8F0',
  hairline: '#F1F5F9',
  surface: '#FFFFFF',
  canvas: '#FAFCFF',
  band: '#F4F8FF',
  accent: '#1D4ED8',
  accentInk: '#1E40AF',
  accentSoft: '#EFF4FF',
  accentLine: '#BFDBFE',
  accentFaint: '#93C5FD',
};

const SECTION_INDEX: Record<string, string> = {
  特徴: '01',
  スペック: '02',
  通常時: '03',
  AT解説: '04',
  AT後: '05',
  ヤメ時: '06',
  終了後: '05–06',
  評価: '07',
  類似機種: '08',
};

export function parseSectionItems(body: string): SectionItem[] {
  const items: SectionItem[] = [];
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^[-・]\s*([^:：]+)[:：]\s*(.*)$/);
    if (m) {
      items.push({ label: m[1].trim(), value: m[2].trim() });
    } else if (items.length > 0) {
      items[items.length - 1].value += `\n${line.replace(/^[-・]\s*/, '')}`;
    }
  }
  return items;
}

export function formatValue(value: string): string {
  const withArrows = value.replace(/\s*(?:→|⇒|➡|➜|->)\s*/g, '\n↓\n');
  const lines: string[] = [];
  let buf = '';
  let depth = 0;
  for (const ch of withArrows) {
    if (ch === '（' || ch === '(' || ch === '「') depth++;
    if (ch === '）' || ch === ')' || ch === '」') depth = Math.max(0, depth - 1);
    if (depth === 0 && (ch === '、' || ch === '。' || ch === '／')) {
      if (buf.trim()) lines.push(buf.trim());
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) lines.push(buf.trim());
  return lines.join('\n').replace(/\n{3,}/g, '\n\n');
}

function topBar() {
  return {
    type: 'box',
    layout: 'vertical',
    height: '4px',
    backgroundColor: C.accent,
    contents: [{ type: 'text', text: ' ', size: 'xxs' }],
  };
}

function tag(text: string) {
  return {
    type: 'box',
    layout: 'horizontal',
    backgroundColor: C.accent,
    cornerRadius: 'sm',
    paddingStart: '8px',
    paddingEnd: '8px',
    paddingTop: '4px',
    paddingBottom: '4px',
    flex: 0,
    contents: [
      {
        type: 'text',
        text,
        size: 'xs',
        color: '#FFFFFF',
        weight: 'bold',
      },
    ],
  };
}

function header(label: string, title: string, meta?: string, subtitle?: string) {
  const inner: unknown[] = [
    {
      type: 'box',
      layout: 'horizontal',
      contents: [
        tag(label),
        {
          type: 'text',
          text: meta ?? 'SLOT COMPASS',
          size: 'xxs',
          color: C.accentInk,
          weight: 'bold',
          align: 'end',
          gravity: 'center',
          flex: 1,
        },
      ],
    },
    {
      type: 'text',
      text: title,
      size: 'xxl',
      color: C.ink,
      weight: 'bold',
      wrap: true,
      margin: 'md',
    },
  ];
  if (subtitle) {
    inner.push({
      type: 'text',
      text: subtitle,
      size: 'xs',
      color: C.muted,
      margin: 'sm',
    });
  }
  return {
    type: 'box',
    layout: 'vertical',
    backgroundColor: C.band,
    paddingAll: '0px',
    spacing: 'none',
    contents: [
      topBar(),
      {
        type: 'box',
        layout: 'vertical',
        paddingTop: '18px',
        paddingBottom: '16px',
        paddingStart: '20px',
        paddingEnd: '20px',
        contents: inner,
      },
    ],
  };
}

function footer(hint: string, link?: { label: string; uri: string }) {
  const contents: unknown[] = [{ type: 'separator', color: C.accentLine, margin: 'none' }];
  if (link) {
    contents.push({
      type: 'button',
      style: 'link',
      height: 'sm',
      margin: 'sm',
      color: C.accent,
      action: { type: 'uri', label: link.label.slice(0, 40), uri: link.uri },
    });
  }
  contents.push({
    type: 'box',
    layout: 'horizontal',
    margin: 'sm',
    contents: [
      {
        type: 'text',
        text: hint,
        size: 'xs',
        color: C.muted,
        flex: 1,
        wrap: true,
      },
      {
        type: 'text',
        text: 'SLOT COMPASS',
        size: 'xxs',
        color: C.accentInk,
        weight: 'bold',
        align: 'end',
        gravity: 'center',
      },
    ],
  });
  return {
    type: 'box',
    layout: 'vertical',
    backgroundColor: C.canvas,
    paddingAll: '16px',
    contents,
  };
}

function parseScore(value: string): { score: number | null; source: string } {
  const m = value.match(/([0-9]+(?:\.[0-9]+)?)\s*\/\s*5\s*(.*)$/);
  if (!m) return { score: null, source: value };
  const score = Number(m[1]);
  const source = m[2]
    .trim()
    .replace(/^[（(]/, '')
    .replace(/[）)]$/, '')
    .trim();
  return { score: Number.isFinite(score) ? score : null, source };
}

function ratingBar(score: number) {
  const filled = Math.min(10, Math.max(0, Math.round(score * 2)));
  return {
    type: 'box',
    layout: 'horizontal',
    spacing: 'xs',
    margin: 'md',
    contents: Array.from({ length: 10 }, (_, i) => ({
      type: 'box',
      layout: 'vertical',
      flex: 1,
      height: '6px',
      cornerRadius: 'xs',
      backgroundColor: i < filled ? C.accent : C.accentLine,
      contents: [{ type: 'text', text: ' ', size: 'xxs' }],
    })),
  };
}

export function aiFlexMessage(name: string, answer: string): LineMessage {
  return {
    type: 'flex',
    altText: answer.slice(0, 100),
    contents: {
      type: 'bubble',
      size: 'giga',
      header: header('AI相談', name, 'AI'),
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: C.surface,
        paddingAll: '20px',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: C.accentSoft,
            cornerRadius: 'lg',
            paddingAll: '16px',
            contents: [
              {
                type: 'text',
                text: '回答',
                size: 'xs',
                color: C.accentInk,
                weight: 'bold',
              },
              {
                type: 'text',
                text: answer,
                size: 'sm',
                color: C.ink,
                wrap: true,
                margin: 'sm',
              },
            ],
          },
        ],
      },
      footer: footer('※ 参考情報です。最終判断は自己責任で。'),
    },
  };
}

export function sectionFlexMessage(
  name: string,
  label: string,
  body: string,
  link?: { label: string; uri: string },
  compact = false,
  priority: string[] = [],
): LineMessage {
  const allItems = parseSectionItems(body);
  let items = allItems;
  if (compact) {
    const picked: SectionItem[] = [];
    for (const key of priority) {
      const hit = allItems.find((i) => i.label.includes(key) && !picked.includes(i));
      if (hit) picked.push(hit);
    }
    if (picked.length === 0) picked.push(...allItems.slice(0, 4));
    items = picked.slice(0, 5);
  }
  const contents: unknown[] = [];

  if (items.length > 0) {
    items.forEach((item, i) => {
      contents.push({
        type: 'box',
        layout: 'horizontal',
        margin: i === 0 ? 'none' : 'lg',
        spacing: 'md',
        contents: [
          {
            type: 'text',
            text: String(i + 1).padStart(2, '0'),
            size: 'sm',
            color: C.accentFaint,
            weight: 'bold',
            flex: 0,
            gravity: 'top',
          },
          {
            type: 'box',
            layout: 'vertical',
            flex: 1,
            spacing: 'xs',
            contents: [
              {
                type: 'text',
                text: item.label,
                size: 'xs',
                color: C.muted,
                weight: 'bold',
                wrap: true,
              },
              {
                type: 'text',
                text: formatValue(item.value),
                size: 'sm',
                color: C.body,
                wrap: true,
              },
            ],
          },
        ],
      });
      if (i < items.length - 1) {
        contents.push({ type: 'separator', margin: 'lg', color: C.hairline });
      }
    });
  } else {
    contents.push({
      type: 'text',
      text: formatValue(body.replace(/^[-・]\s*/gm, '')),
      size: 'sm',
      color: C.body,
      wrap: true,
    });
  }

  return {
    type: 'flex',
    altText: `${name}｜${label}`,
    contents: {
      type: 'bubble',
      size: 'giga',
      header: header(label, name, SECTION_INDEX[label] ? `${SECTION_INDEX[label]} / 08` : undefined),
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: C.surface,
        paddingTop: '18px',
        paddingBottom: '20px',
        paddingStart: '20px',
        paddingEnd: '20px',
        spacing: 'none',
        contents,
      },
      footer: footer(
        compact ? '「もっと」で全文／下のメニューで他の項目' : '下のメニューから他の項目も見られます',
        link,
      ),
    },
  };
}

export function reviewFlexMessage(
  name: string,
  summaryBody: string | undefined,
  reviewBody: string,
  link?: { label: string; uri: string },
): LineMessage {
  const items = parseSectionItems(reviewBody);
  const rating = items.find((i) => i.label.includes('総合評価'));
  const other = items.find((i) => i.label.includes('他サイト'));
  const good = items.find((i) => i.label.includes('良い点'));
  const bad = items.find((i) => i.label.includes('気になる点'));
  const gameplay = summaryBody
    ? parseSectionItems(summaryBody).find((i) => i.label === 'ゲーム性')
    : undefined;
  const parsed = rating ? parseScore(rating.value) : { score: null, source: '不明' };

  const contents: unknown[] = [];

  if (gameplay) {
    contents.push({
      type: 'box',
      layout: 'vertical',
      spacing: 'xs',
      contents: [
        { type: 'text', text: 'ゲーム性', size: 'xs', color: C.muted, weight: 'bold' },
        {
          type: 'text',
          text: formatValue(gameplay.value),
          size: 'sm',
          color: C.body,
          wrap: true,
        },
      ],
    });
    contents.push({ type: 'separator', margin: 'lg', color: C.hairline });
  }

  if (parsed.score !== null) {
    contents.push({
      type: 'box',
      layout: 'vertical',
      backgroundColor: C.accentSoft,
      cornerRadius: 'lg',
      paddingAll: '16px',
      margin: gameplay ? 'lg' : 'none',
      contents: [
        { type: 'text', text: '総合評価', size: 'xs', color: C.accentInk, weight: 'bold' },
        {
          type: 'box',
          layout: 'horizontal',
          margin: 'sm',
          contents: [
            {
              type: 'text',
              text: parsed.score.toFixed(1),
              size: '5xl',
              color: C.accentInk,
              weight: 'bold',
              flex: 0,
            },
            {
              type: 'text',
              text: '/ 5',
              size: 'sm',
              color: C.accentInk,
              margin: 'sm',
              gravity: 'bottom',
              flex: 0,
            },
          ],
        },
        ratingBar(parsed.score),
        ...(parsed.source
          ? [
              {
                type: 'text',
                text: parsed.source,
                size: 'xs',
                color: C.muted,
                margin: 'sm',
                wrap: true,
              },
            ]
          : []),
      ],
    });
  } else if (rating) {
    contents.push({
      type: 'box',
      layout: 'vertical',
      margin: gameplay ? 'lg' : 'none',
      contents: [
        { type: 'text', text: '総合評価', size: 'xs', color: C.muted, weight: 'bold' },
        {
          type: 'text',
          text: formatValue(rating.value),
          size: 'sm',
          color: C.body,
          wrap: true,
        },
      ],
    });
  }

  if (other) {
    contents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'lg',
      spacing: 'xs',
      contents: [
        { type: 'text', text: '他サイト評価', size: 'xs', color: C.muted, weight: 'bold' },
        {
          type: 'text',
          text: formatValue(other.value),
          size: 'sm',
          color: C.body,
          wrap: true,
        },
      ],
    });
  }

  const reactions: [SectionItem | undefined, string, string][] = [
    [good, '良い点', C.accentInk],
    [bad, '気になる点', C.muted],
  ];
  for (const [item, fallbackLabel, dotColor] of reactions) {
    if (!item) continue;
    contents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'xl',
      spacing: 'xs',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            { type: 'text', text: '●', size: 'xxs', color: dotColor, flex: 0 },
            {
              type: 'text',
              text: item.label || fallbackLabel,
              size: 'xs',
              color: dotColor,
              weight: 'bold',
              margin: 'sm',
              flex: 0,
            },
          ],
        },
        {
          type: 'text',
          text: formatValue(item.value),
          size: 'sm',
          color: C.body,
          wrap: true,
        },
      ],
    });
  }

  const known = new Set(
    [rating, other, good, bad].filter((v): v is SectionItem => Boolean(v)),
  );
  const rest = items.filter((i) => !known.has(i));
  if (rest.length) {
    contents.push({ type: 'separator', margin: 'lg', color: C.hairline });
    rest.forEach((item, i) => {
      contents.push({
        type: 'box',
        layout: 'vertical',
        margin: i === 0 ? 'lg' : 'md',
        spacing: 'xs',
        contents: [
          { type: 'text', text: item.label, size: 'xs', color: C.muted, weight: 'bold' },
          {
            type: 'text',
            text: formatValue(item.value),
            size: 'sm',
            color: C.body,
            wrap: true,
          },
        ],
      });
    });
  }

  return {
    type: 'flex',
    altText: `${name}｜評価`,
    contents: {
      type: 'bubble',
      size: 'giga',
      header: header('評価', name, '07 / 08'),
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: C.surface,
        paddingTop: '18px',
        paddingBottom: '20px',
        paddingStart: '20px',
        paddingEnd: '20px',
        spacing: 'none',
        contents,
      },
      footer: footer('下のメニューから他の項目も見られます', link),
    },
  };
}

export function linksFlexMessage(
  name: string,
  links: { label: string; uri: string }[],
): LineMessage {
  const contents: unknown[] = [
    {
      type: 'text',
      text: '設定示唆・フロー図・解析は各サイトで確認できます。',
      size: 'sm',
      color: C.body,
      wrap: true,
    },
    { type: 'separator', margin: 'lg', color: C.hairline },
  ];
  if (!links.length) {
    contents.push({
      type: 'text',
      text: 'リンクが登録されていません。',
      size: 'sm',
      color: C.muted,
      wrap: true,
      margin: 'lg',
    });
  }
  links.forEach((link, i) => {
    contents.push({
      type: 'box',
      layout: 'horizontal',
      paddingTop: '14px',
      paddingBottom: '14px',
      spacing: 'sm',
      action: { type: 'uri', uri: link.uri },
      contents: [
        {
          type: 'text',
          text: link.label,
          size: 'sm',
          color: C.ink,
          weight: 'bold',
          wrap: true,
          flex: 1,
        },
        {
          type: 'text',
          text: '↗',
          size: 'sm',
          color: C.accentInk,
          flex: 0,
          gravity: 'center',
        },
      ],
    });
    if (i < links.length - 1) {
      contents.push({ type: 'separator', color: C.hairline });
    }
  });

  return {
    type: 'flex',
    altText: `${name}｜リンク`,
    contents: {
      type: 'bubble',
      size: 'giga',
      header: header('リンク', name, 'LINKS'),
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: C.surface,
        paddingTop: '18px',
        paddingBottom: '20px',
        paddingStart: '20px',
        paddingEnd: '20px',
        spacing: 'none',
        contents,
      },
      footer: footer('出典元の最新情報もあわせて確認してください'),
    },
  };
}

export function machinePickerFlexMessage(params: {
  page: number;
  totalPages: number;
  total: number;
  items: { id: string; name: string }[];
  recent?: string[];
  intro?: boolean;
  greeting?: string;
}): LineMessage {
  const { page, totalPages, total, items, intro, greeting } = params;
  const recentSet = new Set(params.recent ?? []);
  const contents: unknown[] = [];
  let recentHeader = false;
  let otherHeader = false;

  if (intro) {
    const introContents: unknown[] = [];
    if (greeting) {
      introContents.push({
        type: 'text',
        text: greeting,
        size: 'sm',
        color: C.ink,
        weight: 'bold',
        wrap: true,
      });
    }
    introContents.push({
      type: 'text',
      text: 'SLOT COMPASS の使い方',
      size: 'xs',
      color: C.accentInk,
      weight: 'bold',
      margin: greeting ? 'sm' : 'none',
    });
    introContents.push({
      type: 'text',
      text: [
        '・下のメニューから機種を選ぶ',
        '・「評価 / スペック / 狙い目 / AT / 終了後」をタップ',
        '・機種名を直接入力してもOK',
        '・わからないことは、そのまま質問',
      ].join('\n'),
      size: 'xs',
      color: C.body,
      wrap: true,
      margin: 'sm',
    });
    contents.push({
      type: 'box',
      layout: 'vertical',
      backgroundColor: C.accentSoft,
      cornerRadius: 'lg',
      paddingAll: '12px',
      contents: introContents,
    });
    contents.push({ type: 'separator', margin: 'lg', color: C.hairline });
  }

  items.forEach((item, i) => {
    const isRecent = recentSet.has(item.id);
    if (isRecent && !recentHeader) {
      contents.push({
        type: 'text',
        text: '最近使った台',
        size: 'xs',
        color: C.accentInk,
        weight: 'bold',
        margin: contents.length ? 'lg' : 'none',
      });
      recentHeader = true;
    }
    if (!isRecent && !otherHeader) {
      contents.push({
        type: 'text',
        text: '人気の台',
        size: 'xs',
        color: C.accentInk,
        weight: 'bold',
        margin: contents.length ? 'lg' : 'none',
      });
      otherHeader = true;
    }
    contents.push({
      type: 'box',
      layout: 'horizontal',
      paddingTop: '14px',
      paddingBottom: '14px',
      spacing: 'sm',
      action: {
        type: 'message',
        label: item.name.slice(0, 40),
        text: item.name,
      },
      contents: [
        {
          type: 'text',
          text: item.name,
          size: 'sm',
          color: C.ink,
          weight: 'bold',
          wrap: true,
          flex: 1,
          gravity: 'center',
        },
        {
          type: 'text',
          text: '›',
          size: 'lg',
          color: C.accentInk,
          gravity: 'center',
          flex: 0,
        },
      ],
    });
    if (i < items.length - 1) {
      contents.push({ type: 'separator', color: C.hairline });
    }
  });

  const nav: unknown[] = [];
  if (page > 0) {
    nav.push({
      type: 'button',
      style: 'link',
      height: 'sm',
      flex: 1,
      color: C.accent,
      action: { type: 'message', label: '前へ', text: '前へ' },
    });
  }
  if (page < totalPages - 1) {
    nav.push({
      type: 'button',
      style: 'link',
      height: 'sm',
      flex: 1,
      color: C.accent,
      action: { type: 'message', label: '次の機種へ', text: '次の機種へ' },
    });
  }
  if (!nav.length) {
    nav.push({
      type: 'text',
      text: '機種名を直接入力しても選べます',
      size: 'xs',
      color: C.muted,
      align: 'center',
      flex: 1,
    });
  }

  return {
    type: 'flex',
    altText: `機種選択（${page + 1}/${totalPages}）`,
    contents: {
      type: 'bubble',
      size: 'giga',
      header: header(
        '一覧',
        '機種を選ぶ',
        'SELECT',
        `全${total}台 ・ ${page + 1}/${totalPages}ページ`,
      ),
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: C.surface,
        paddingStart: '20px',
        paddingEnd: '20px',
        paddingBottom: '8px',
        spacing: 'none',
        contents,
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: C.canvas,
        paddingAll: '12px',
        contents: [
          { type: 'separator', color: C.accentLine, margin: 'none' },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'sm',
            spacing: 'sm',
            contents: nav,
          },
        ],
      },
    },
  };
}
