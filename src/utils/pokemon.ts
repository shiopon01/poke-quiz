import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2/';

export interface Pokemon {
  id: number;
  name: string;
  japaneseName: string;
  image: string;
}

export interface Generation {
  id: number;
  name: string;
  startId: number;
  endId: number;
}

export const GENERATIONS: Generation[] = [
  { id: 1, name: '第1世代', startId: 1, endId: 151 },
  { id: 2, name: '第2世代', startId: 152, endId: 251 },
  { id: 3, name: '第3世代', startId: 252, endId: 386 },
  { id: 4, name: '第4世代', startId: 387, endId: 493 },
  { id: 5, name: '第5世代', startId: 494, endId: 649 },
  { id: 6, name: '第6世代', startId: 650, endId: 721 },
  { id: 7, name: '第7世代', startId: 722, endId: 809 },
  { id: 8, name: '第8世代', startId: 810, endId: 905 },
  { id: 9, name: '第9世代', startId: 906, endId: 1025 },
];

export async function getPokemonJapaneseName(
  englishName: string,
): Promise<string> {
  try {
    const response = await axios.get(
      `${BASE_URL}pokemon-species/${englishName.toLowerCase()}`,
    );
    const data = response.data;
    const japaneseName = data.names.find(
      (nameInfo: any) => nameInfo.language.name === 'ja-Hrkt',
    );
    return japaneseName ? japaneseName.name : '不明';
  } catch (error) {
    console.error('ポケモンの情報を取得できませんでした。', error);
    return '不明';
  }
}

// ひらがなをカタカナに変換する関数を修正
export function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, char => 
    String.fromCharCode(char.charCodeAt(0) + 96)
  );
}

// 名前を正規化する関数を修正（長音符の正規化を追加）
export function normalizePokemonName(name: string): string {
  return hiraganaToKatakana(name)
    .trim() // 前後のスペースを除去
    .replace(/[・\s]/g, '') // 中黒点とスペースを除去
    .replace(/ー/g, 'ー') // 異なる種類の長音符を統一
    .replace(/[-－―]/g, 'ー'); // ハイフンや全角ハイフンも長音符に統一
}
