export type SectionKey = 'SPEC' | 'NORMAL' | 'AT_CZ' | 'EXIT_SETTING';

export function getSection(md: string, section: SectionKey): string {
  const lines = md.split('\n');
  const heading = new RegExp(`^##\\s+${section}\\b`);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (heading.test(lines[i])) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return '';

  const out: string[] = [];
  for (let i = start; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n').trim();
}

export function getMachineName(md: string): string {
  const m = md.match(/^#\s*機種名[:：]\s*(.+)$/m);
  return m ? m[1].trim() : '';
}
