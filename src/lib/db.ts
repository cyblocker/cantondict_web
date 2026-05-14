import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import sqlWasm from 'sql.js/dist/sql-wasm.wasm?url';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: () => sqlWasm,
  });

  const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
  const dbUrl = isPWA ? '/data/CantonDict.db?source=pwa' : '/data/CantonDict.db';
  const response = await fetch(dbUrl);
  if (!response.ok) {
    throw new Error(`Failed to load database: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  db = new SQL.Database(uint8Array);
  return db;
}

export interface RawDataEntry {
  Character: string;
  Consonant: string;
  Vowels: string;
  Tone: number;
  Explanation: string;
}

export interface DataEntry {
  character: string;
  consonant: string;
  vowels: string;
  tone: number;
  explanations: string;
}

export const romanizationTypes = [
  'Yale',
  'Yut',
  'Jiaoyuan',
  'Guangzhou',
];

export async function lookupChar(
  char: string, 
  chineseMode: number, 
  romanizationMode: number
): Promise<DataEntry[]> {
  const database = await getDb();
  let tableName = chineseMode === 0 ? 'Records' : 'SimplifiedRecords';
  
  let results = database.exec(`SELECT * FROM ${tableName} WHERE Character = ?`, [char[0]]);
  
  if (results.length === 0 || results[0].values.length === 0) {
    tableName = chineseMode === 0 ? 'SimplifiedRecords' : 'Records';
    results = database.exec(`SELECT * FROM ${tableName} WHERE Character = ?`, [char[0]]);
  }

  if (results.length === 0 || results[0].values.length === 0) {
    return [];
  }

  const columns = results[0].columns;
  const values = results[0].values;
  
  const entries: DataEntry[] = [];

  for (const row of values) {
    const raw: any = {};
    columns.forEach((col, i) => {
      raw[col] = row[i];
    });

    if (!raw.Explanation) continue;

    let consonant = raw.Consonant || '';
    let vowels = raw.Vowels || '';
    let tone = raw.Tone as number;

    if (romanizationMode !== 0) {
      const type = romanizationTypes[romanizationMode];
      
      if (raw.Consonant) {
        const shengmu = database.exec(`SELECT ${type} FROM Shengmu WHERE Yale = ? LIMIT 1`, [raw.Consonant]);
        if (shengmu.length > 0 && shengmu[0].values.length > 0) {
          consonant = (shengmu[0].values[0][0] as string) || '';
        }
      }

      if (raw.Vowels) {
        const yunmu = database.exec(`SELECT ${type} FROM Yunmu WHERE Yale = ? LIMIT 1`, [raw.Vowels]);
        if (yunmu.length > 0 && yunmu[0].values.length > 0) {
          vowels = (yunmu[0].values[0][0] as string) || '';
        }
      }

      // Special handling for Yut Ping (Jyutping)
      if (romanizationMode === 1) {
        if (!consonant && vowels.startsWith('y')) {
          consonant = 'j';
        }
      }

      // Special handling for Guangzhou
      if (romanizationMode === 3) {
        if (/^[iü]/.test(vowels)) {
          let replaced = true;
          switch (consonant) {
            case 'z': consonant = 'j'; break;
            case 'c': consonant = 'q'; break;
            case 's': consonant = 'x'; break;
            default: replaced = false;
          }
          if (replaced && vowels.startsWith('ü')) {
            vowels = 'u' + vowels.substring(1);
          }
        }
      }

      // Special handling for Jiaoyuan tone
      if (romanizationMode === 2) {
        if (vowels.endsWith('t') || vowels.endsWith('p') || vowels.endsWith('k')) {
          switch (tone) {
            case 1: tone = 7; break;
            case 3: tone = 8; break;
            case 6: tone = 9; break;
          }
        }
      }
    }

    entries.push({
      character: raw.Character,
      consonant,
      vowels,
      tone,
      explanations: raw.Explanation
    });
  }

  return entries;
}

export async function parseExplanations(
  explanation: string, 
  chineseMode: number
): Promise<string[]> {
  const database = await getDb();
  const tableName = chineseMode === 0 ? 'Records' : 'SimplifiedRecords';
  const result: string[] = [];
  const entries = explanation.split(',');
  let samples = '';

  for (let entry of entries) {
    entry = entry.trim();
    if (entry.startsWith('$')) {
      const id = parseInt(entry.substring(1));
      const map = database.exec(`SELECT Character FROM ${tableName} WHERE rowid = ?`, [id]);
      if (map.length > 0 && map[0].values.length > 0) {
        const char = map[0].values[0][0];
        result.push(chineseMode === 0 ? `是「${char}」的異讀字` : `是「${char}」的异读字`);
      }
    } else if (entry.startsWith('#')) {
      result.push(`同「${entry.substring(1)}」`);
    } else if (entry.startsWith('@')) {
      result.push(chineseMode === 0 ? `釋義：${entry.substring(1)}` : `释义：${entry.substring(1)}`);
    } else if (entry.startsWith('%')) {
        // Scoring prefix for paragraph check, skip in display
    } else {
      samples += '，' + entry;
    }
  }

  if (samples.length > 0) {
    result.push(chineseMode === 0 ? `詞例：${samples.substring(1)}` : `词例：${samples.substring(1)}`);
  }

  return result;
}
