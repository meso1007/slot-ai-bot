import type { LineMessage } from './line';

interface SectionItem {
  label: string;
  value: string;
}

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

export function aiFlexMessage(name: string, answer: string): LineMessage {
  return {
    type: 'flex',
    altText: answer.slice(0, 100),
    contents: {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#1D4ED8',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: 'AI回答',
            size: 'xs',
            color: '#BFDBFE',
            weight: 'bold',
          },
          {
            type: 'text',
            text: name,
            size: 'md',
            color: '#FFFFFF',
            weight: 'bold',
            wrap: true,
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#FFFFFF',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: answer,
            size: 'sm',
            color: '#0F172A',
            wrap: true,
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#F8FAFC',
        paddingAll: '12px',
        contents: [
          {
            type: 'text',
            text: '参考情報です。最終判断は自己責任で。',
            size: 'xs',
            color: '#94A3B8',
            align: 'center',
            wrap: true,
          },
        ],
      },
    },
  };
}

export function sectionFlexMessage(name: string, label: string, body: string): LineMessage {
  const items = parseSectionItems(body);
  const contents =
    items.length > 0
      ? items.map((item, i) => ({
          type: 'box',
          layout: 'vertical',
          spacing: 'xs',
          margin: i === 0 ? 'none' : 'lg',
          contents: [
            {
              type: 'text',
              text: item.label,
              size: 'xs',
              color: '#64748B',
              weight: 'bold',
              wrap: true,
            },
            {
              type: 'text',
              text: formatValue(item.value),
              size: 'sm',
              color: '#0F172A',
              wrap: true,
            },
          ],
        }))
      : [
          {
            type: 'text',
            text: formatValue(body.replace(/^[-・]\s*/gm, '')),
            size: 'sm',
            color: '#0F172A',
            wrap: true,
          },
        ];

  return {
    type: 'flex',
    altText: `${name}｜${label}`,
    contents: {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0F172A',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: label,
            size: 'xs',
            color: '#93C5FD',
            weight: 'bold',
          },
          {
            type: 'text',
            text: name,
            size: 'lg',
            color: '#FFFFFF',
            weight: 'bold',
            wrap: true,
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#FFFFFF',
        paddingAll: '16px',
        spacing: 'none',
        contents,
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#F8FAFC',
        paddingAll: '12px',
        contents: [
          {
            type: 'text',
            text: '下のメニューから他の項目も見られます',
            size: 'xs',
            color: '#94A3B8',
            align: 'center',
            wrap: true,
          },
        ],
      },
    },
  };
}
