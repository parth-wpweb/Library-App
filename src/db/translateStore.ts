export type Translation = {
  key: string;
  de?: string;
  dz?: string;
  el?: string;
  es?: string;
  fr?: string;
  gu?: string;
  hi?: string;
  it?: string;
  ja?: string;
  la?: string;
  ml?: string;
  nl?: string;
  ta?: string;
  en?: string;
};

export const addTranslation = async (
  db: SQLiteDatabase,
  translation: Translation,
) => {
  const insertQuery = `
    INSERT OR REPLACE INTO translations (
      key, de, dz, el, es, fr, gu, hi, it, ja, la, ml, nl, ta, en
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    translation.key,
    translation.de,
    translation.dz,
    translation.el,
    translation.es,
    translation.fr,
    translation.gu,
    translation.hi,
    translation.it,
    translation.ja,
    translation.la,
    translation.ml,
    translation.nl,
    translation.ta,
    translation.en,
  ];

  try {
    return await db.executeSql(insertQuery, values);
  } catch (error) {
    console.error('Error inserting translation:', error);
    throw Error('Failed to add translation');
  }
};

export const getTranslationCount = async (
  db: SQLiteDatabase,
): Promise<number> => {
  try {
    const [results] = await db.executeSql(
      'SELECT COUNT(*) as count FROM translations',
    );
    const count = results.rows.item(0).count;
    return count;
  } catch (error) {
    console.error('Error getting translation count:', error);
    throw Error('Failed to get translation count');
  }
};
