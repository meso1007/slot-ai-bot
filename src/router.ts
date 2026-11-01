import type { SectionKey } from './machineLoader';

export type RouteResult = { kind: 'section'; section: SectionKey } | { kind: 'ai' };

const BUTTON_MAP: Record<string, SectionKey> = {
  スペック: 'SPEC',
  通常時: 'NORMAL',
  狙い目: 'NORMAL',
  AT解説: 'AT_CZ',
  AT後: 'AT_AFTER',
  ヤメ時: 'EXIT_SETTING',
};

const KEYWORD_MAP: { re: RegExp; section: SectionKey }[] = [
  { re: /(特徴|どんな台|概要|この台の)/, section: 'SUMMARY' },
  { re: /(評価|評判|口コミ|レビュー|感想)/, section: 'REVIEW' },
  { re: /(似てる|似ている|類似|近い台|他の台|おすすめ機種)/, section: 'SIMILAR' },
  { re: /(純増|コイン持ち|出玉率|機械割|初当り|初当たり|確率|天井|リセット|スルー)/, section: 'SPEC' },
  { re: /(通常時|前兆|モード|周期|ゾーン|狙い目)/, section: 'NORMAL' },
  { re: /(チャンスゾーン|CZ|AT|上乗せ|特化)/i, section: 'AT_CZ' },
  { re: /(AT後|AT終了後|終了後|引き戻し|上位示唆|ツラヌキ)/, section: 'AT_AFTER' },
  { re: /(ヤメ時|やめ時|やめどき|終了画面|設定判別)/, section: 'EXIT_SETTING' },
];

export function routeText(text: string): RouteResult {
  const t = text.trim();
  const button = BUTTON_MAP[t];
  if (button) return { kind: 'section', section: button };
  for (const { re, section } of KEYWORD_MAP) {
    if (re.test(t)) return { kind: 'section', section };
  }
  return { kind: 'ai' };
}

export const SECTION_LABEL: Record<SectionKey, string> = {
  SUMMARY: '特徴',
  REVIEW: '評価',
  SIMILAR: '類似機種',
  SPEC: 'スペック',
  NORMAL: '通常時',
  AT_CZ: 'AT解説',
  AT_AFTER: 'AT後',
  EXIT_SETTING: 'ヤメ時',
};

export const ACTION_SECTION: Record<string, SectionKey> = {
  spec: 'SPEC',
  normal: 'NORMAL',
  at: 'AT_CZ',
  after: 'AT_AFTER',
  exit: 'EXIT_SETTING',
};
