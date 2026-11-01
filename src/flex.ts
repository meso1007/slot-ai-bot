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
  canvas: '#F8FAFC',
  accent: '#0F766E',
  accentSoft: '#ECFDF5',
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

function pill(text: string) {
  return {
    type: 'box',
    layout: 'horizontal',
    backgroundColor: C.accent,
    cornerRadius: 'xl',
    paddingStart: '10px',
    paddingEnd: '10px',
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

function header(label: string, title: string, subtitle?: string) {
  const contents: unknown[] = [
    {
      type: 'box',
      layout: 'horizontal',
      contents: [
        pill(label),
        {
          type: 'text',
          text: 'SLOT AI',
          size: 'xxs',
          color: C.faint,
          align: 'end',
          gravity: 'center',
          flex: 1,
        },
      ],
    },
    {
      type: 'text',
      text: title,
      size: 'xl',
      color: C.ink,
      weight: 'bold',
      wrap: true,
      margin: 'md',
    },
  ];
  if (subtitle) {
    contents.push({
      type: 'text',
      text: subtitle,
      size: 'xs',
      color: C.muted,
      margin: 'xs',
    });
  }
  contents.push({ type: 'separator', margin: 'lg', color: C.line });
  return {
    type: 'box',
    layout: 'vertical',
    backgroundColor: C.surface,
    paddingTop: '20px',
    paddingBottom: '14px',
    paddingStart: '20px',
    paddingEnd: '20px',
    contents,
  };
}

function footer(hint: string) {
  return {
    type: 'box',
    layout: 'vertical',
    backgroundColor: C.canvas,
    paddingAll: '16px',
    contents: [
      {
        type: 'box',
        layout: 'horizontal',
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
            text: 'SLOT AI',
            size: 'xxs',
            color: C.faint,
            align: 'end',
            gravity: 'center',
          },
        ],
      },
    ],
  };
}

export function aiFlexMessage(name: string, answer: string): LineMessage {
  return {
    type: 'flex',
    altText: answer.slice(0, 100),
    contents: {
      type: 'bubble',
      size: 'giga',
      header: header('AI相談', name),
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
                text: answer,
                size: 'sm',
                color: C.ink,
                wrap: true,
              },
            ],
          },
        ],
      },
      footer: footer('※ 参考情報です。最終判断は自己責任で。'),
    },
  };
}

export function sectionFlexMessage(name: string, label: string, body: string): LineMessage {
  const items = parseSectionItems(body);
  const contents: unknown[] = [];

  if (items.length > 0) {
    items.forEach((item, i) => {
      const isRating = item.label.includes('総合評価');
      contents.push({
        type: 'box',
        layout: 'vertical',
        spacing: 'xs',
        margin: i === 0 ? 'none' : 'lg',
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
            size: isRating ? 'lg' : 'sm',
            color: isRating ? C.ink : C.body,
            weight: isRating ? 'bold' : 'regular',
            wrap: true,
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
      header: header(label, name),
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: C.surface,
        paddingTop: '16px',
        paddingBottom: '20px',
        paddingStart: '20px',
        paddingEnd: '20px',
        spacing: 'none',
        contents,
      },
      footer: footer('下のメニューから他の項目も見られます'),
    },
  };
}

export function machinePickerFlexMessage(params: {
  page: number;
  totalPages: number;
  total: number;
  items: { id: string; name: string }[];
  recent?: string[];
}): LineMessage {
  const { page, totalPages, total, items } = params;
  const recentSet = new Set(params.recent ?? []);
  const contents: unknown[] = [];
  let recentHeader = false;
  let otherHeader = false;

  items.forEach((item, i) => {
    const isRecent = recentSet.has(item.id);
    if (isRecent && !recentHeader) {
      contents.push({
        type: 'text',
        text: '最近使った台',
        size: 'xs',
        color: C.muted,
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
        color: C.muted,
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
          color: C.faint,
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
      header: header('一覧', '機種を選ぶ', `全${total}台 ・ ${page + 1}/${totalPages}ページ`),
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
          { type: 'separator', color: C.line, margin: 'none' },
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
