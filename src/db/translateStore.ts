// export type Translation = {
//   key: string;
//   de?: string;
//   dz?: string;
//   el?: string;
//   es?: string;
//   fr?: string;
//   gu?: string;
//   hi?: string;
//   it?: string;
//   ja?: string;
//   la?: string;
//   ml?: string;
//   nl?: string;
//   ta?: string;
//   en?: string;
// };

// export const addTranslation = async (
//   db: SQLiteDatabase,
//   translation: Translation,
// ) => {
//   const insertQuery = `
//     INSERT OR REPLACE INTO translations (
//       key, de, dz, el, es, fr, gu, hi, it, ja, la, ml, nl, ta, en
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   const values = [
//     translation.key,
//     translation.de,
//     translation.dz,
//     translation.el,
//     translation.es,
//     translation.fr,
//     translation.gu,
//     translation.hi,
//     translation.it,
//     translation.ja,
//     translation.la,
//     translation.ml,
//     translation.nl,
//     translation.ta,
//     translation.en,
//   ];

//   try {
//     return await db.executeSql(insertQuery, values);
//   } catch (error) {
//     console.error('Error inserting translation:', error);
//     throw Error('Failed to add translation');
//   }
// };

// export const getTranslationCount = async (
//   db: SQLiteDatabase,
// ): Promise<number> => {
//   try {
//     const [results] = await db.executeSql(
//       'SELECT COUNT(*) as count FROM translations',
//     );
//     const count = results.rows.item(0).count;
//     return count;
//   } catch (error) {
//     console.error('Error getting translation count:', error);
//     throw Error('Failed to get translation count');
//   }
// };

import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

// Open the database
export const getDBConnection = async () => {
  return await SQLite.openDatabase({name: 'app.db', location: 'default'});
};

// Create the translations table
export const createLocalizationTable = async (db: SQLiteDatabase) => {
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS localization (
      key TEXT,
      language TEXT,
      translation TEXT,
      PRIMARY KEY (key, language)
    );
  `);
};

// Insert translations dynamically for multiple languages
export const insertLocalizationData = async (
  db: SQLiteDatabase,
  data: Record<string, string>[],
) => {
  const stmt =
    'INSERT OR REPLACE INTO localization (key, language, translation) VALUES (?, ?, ?)';
  await db.transaction(async tx => {
    for (const row of data) {
      const {key, ...langs} = row;
      for (const lang of Object.keys(langs)) {
        await tx.executeSql(stmt, [key, lang, langs[lang]]);
      }
    }
  });
};

// Get translation dynamically for any key and language
export const getTranslation = async (
  db: SQLiteDatabase,
  key: string,
  language: string,
): Promise<string> => {
  const [res] = await db.executeSql(
    'SELECT translation FROM localization WHERE key = ? AND language = ?',
    [key, language],
  );
  return res.rows.length ? res.rows.item(0).translation : key; // fallback
};
