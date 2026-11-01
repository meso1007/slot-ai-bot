import lAobuta from './machines/l_aobuta.md';
import lEnen2 from './machines/l_enen_2.md';
import lJuo from './machines/l_juo.md';
import lKabaneriUnan from './machines/l_kabaneri_unan.md';
import lLycorisRecoil from './machines/l_lycoris_recoil.md';
import lMahouShoujo from './machines/l_mahou_shoujo.md';
import lMhRiseSunbreak from './machines/l_mh_rise_sunbreak.md';
import lMonkeyTurn5 from './machines/l_monkey_turn_5.md';
import lSao2 from './machines/l_sao_2.md';
import lSengokuOtome5 from './machines/l_sengoku_otome_5.md';
import lTokyoGhoul from './machines/l_tokyo_ghoul.md';

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
  l_monkey_turn_5: lMonkeyTurn5,
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
  'l_monkey_turn_5',
];
