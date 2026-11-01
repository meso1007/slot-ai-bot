import lAobuta from './machines/l_aobuta.md';
import lEnen2 from './machines/l_enen_2.md';
import lGhostInTheShell from './machines/l_ghost_in_the_shell.md';
import lJuo from './machines/l_juo.md';
import lKabaneriUnan from './machines/l_kabaneri_unan.md';
import lKanoJo from './machines/l_kano_jo.md';
import lKarakuri2 from './machines/l_karakuri_2.md';
import lLycorisRecoil from './machines/l_lycoris_recoil.md';
import lMahouShoujo from './machines/l_mahou_shoujo.md';
import lMhRiseSunbreak from './machines/l_mh_rise_sunbreak.md';
import lMillionGod from './machines/l_million_god.md';
import lMonkeyTurn5 from './machines/l_monkey_turn_5.md';
import lParipiKoumei from './machines/l_paripi_koumei.md';
import lSao2 from './machines/l_sao_2.md';
import lSengokuCollection6 from './machines/l_sengoku_collection_6.md';
import lSengokuOtome5 from './machines/l_sengoku_otome_5.md';
import lShinuchiYoshimune from './machines/l_shinuchi_yoshimune.md';
import lToaruIndex2 from './machines/l_toaru_index_2.md';
import lTokyoGhoul from './machines/l_tokyo_ghoul.md';
import lUmineko2 from './machines/l_umineko_2.md';
import lVvv2 from './machines/l_vvv_2.md';

export const MACHINES: Record<string, string> = {
  l_lycoris_recoil: lLycorisRecoil,
  l_mh_rise_sunbreak: lMhRiseSunbreak,
  l_tokyo_ghoul: lTokyoGhoul,
  l_juo: lJuo,
  l_mahou_shoujo: lMahouShoujo,
  l_sao_2: lSao2,
  l_sengoku_otome_5: lSengokuOtome5,
  l_aobuta: lAobuta,
  l_kabaneri_unan: lKabaneriUnan,
  l_enen_2: lEnen2,
  l_toaru_index_2: lToaruIndex2,
  l_monkey_turn_5: lMonkeyTurn5,
  l_kano_jo: lKanoJo,
  l_vvv_2: lVvv2,
  l_shinuchi_yoshimune: lShinuchiYoshimune,
  l_paripi_koumei: lParipiKoumei,
  l_karakuri_2: lKarakuri2,
  l_sengoku_collection_6: lSengokuCollection6,
  l_ghost_in_the_shell: lGhostInTheShell,
  l_million_god: lMillionGod,
  l_umineko_2: lUmineko2,
};

export const MACHINE_ORDER: string[] = [
  'l_lycoris_recoil',
  'l_mh_rise_sunbreak',
  'l_tokyo_ghoul',
  'l_juo',
  'l_mahou_shoujo',
  'l_sao_2',
  'l_sengoku_otome_5',
  'l_aobuta',
  'l_kabaneri_unan',
  'l_enen_2',
  'l_toaru_index_2',
  'l_monkey_turn_5',
  'l_kano_jo',
  'l_vvv_2',
  'l_shinuchi_yoshimune',
  'l_paripi_koumei',
  'l_karakuri_2',
  'l_sengoku_collection_6',
  'l_ghost_in_the_shell',
  'l_million_god',
  'l_umineko_2',
];

export const MACHINE_ALIASES: Record<string, string[]> = {
  l_lycoris_recoil: ['リコリス', 'リコリスリコイル'],
  l_mh_rise_sunbreak: ['モンハン', 'モンハンライズ', 'サンブレイク'],
  l_tokyo_ghoul: ['東京喰種', 'グール', '喰種'],
  l_juo: ['獣王', 'ジュウオウ'],
  l_mahou_shoujo: ['まほあこ', '魔法少女'],
  l_sao_2: ['SAO', 'ソードアートオンライン', 'ソードアート'],
  l_sengoku_otome_5: ['戦国乙女', '戦国乙女5', '乙女5'],
  l_aobuta: ['青ブタ', '青春ブタ', 'ブタ野郎'],
  l_kabaneri_unan: ['カバネリ', '海門決戦'],
  l_enen_2: ['炎炎', '炎炎ノ消防隊', '消防隊'],
  l_toaru_index_2: ['とある', '禁書目録', 'インデックス'],
  l_monkey_turn_5: ['モンキー', 'モンキーターン'],
  l_kano_jo: ['彼女お借りします', 'かのかり', 'レンタル彼女'],
  l_vvv_2: ['革命機', 'ヴァルヴレイヴ', 'VVV'],
  l_shinuchi_yoshimune: ['吉宗', '真打吉宗', 'ヨシミネ'],
  l_paripi_koumei: ['パリピ', '孔明'],
  l_karakuri_2: ['からくり', 'からくりサーカス'],
  l_sengoku_collection_6: ['戦国コレクション', '戦コレ'],
  l_ghost_in_the_shell: ['攻殻', '攻殻機動隊', 'ゴースト'],
  l_million_god: ['ミリオンゴッド', 'ミリゴ', 'ゴッド'],
  l_umineko_2: ['うみねこ', 'うみねこのなく頃に'],
};
