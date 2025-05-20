import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {getData} from '../api/translateApi';
import {connectToDatabase, createTranslationTable} from '../db/database';
import {SQLiteDatabase} from 'react-native-sqlite-storage';

export default function Translate() {
  const [translations, setTranslations] = useState<any[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /* ───────────────────────────────
     1.  Open DB  ➜  Create table(s)
  ────────────────────────────────*/
  useEffect(() => {
    (async () => {
      const db = await connectToDatabase();
      await createTranslationTable(db);
      await fetchAndCacheTranslations(db); // do the heavy work
    })();
  }, []);

  /* ───────────────────────────────
     2.  Fetch → insert → render
  ────────────────────────────────*/
  const fetchAndCacheTranslations = async (db: SQLiteDatabase) => {
    try {
      const apiStart = Date.now();
      const response = await getData(); // fetch API
      const contentData = response?.data?.contentData || [];
      const apiTime = Date.now() - apiStart;

      if (contentData.length === 0) {
        throw new Error('API returned empty list');
      }

      // discover languages once
      const langCodes = Object.keys(contentData[0]).filter(k => k !== 'key');
      setLanguages(langCodes);

      /* ---- bulk insert in a single transaction ---- */
      const insertStart = Date.now();
      await db.transaction(tx => {
        const stmt = `INSERT OR REPLACE INTO translations
           (key, de, dz, el, es, fr, gu, hi, it, ja, la, ml, nl, ta, en)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        for (const row of contentData) {
          tx.executeSql(stmt, [
            row.key,
            row.de,
            row.dz,
            row.el,
            row.es,
            row.fr,
            row.gu,
            row.hi,
            row.it,
            row.ja,
            row.la,
            row.ml,
            row.nl,
            row.ta,
            row.en,
          ]);
        }
      });
      const insertTime = Date.now() - insertStart;

      console.log(
        `✅ Fetched ${contentData.length} rows in ${apiTime} ms; ` +
          `inserted in ${insertTime} ms`,
      );

      /* show the result (first 4 rows only) */
      setTranslations(contentData);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch or cache translations');
    } finally {
      setLoading(false); // rendering starts only now
    }
  };

  /* ───────────────────────────────
     3.  UI
  ────────────────────────────────*/
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {translations.slice(0, 4).map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.keyText}>{item.key}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {languages.map(lang => (
              <View key={lang} style={styles.langBlock}>
                <Text style={styles.langLabel}>{lang.toUpperCase()}</Text>
                <Text style={styles.langValue}>{item[lang]}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}

/* ───────────────────────────────
   Styles (unchanged)
────────────────────────────────*/
const styles = StyleSheet.create({
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  container: {padding: 16},
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
  },
  keyText: {fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#333'},
  langBlock: {marginRight: 16, width: 200},
  langLabel: {fontWeight: '600', color: '#888', fontSize: 12},
  langValue: {fontSize: 14, color: '#222'},
});
