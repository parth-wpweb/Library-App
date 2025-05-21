import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native';
import {SQLiteDatabase} from 'react-native-sqlite-storage';

import {getData} from '../api/translateApi';
import {
  createLocalizationTable,
  getDBConnection,
  insertLocalizationData,
  getTranslation,
} from '../db/translateStore';

/* ---------- component ---------- */

export default function Translate() {
  const [translations, setTranslations] = useState<any[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /** keep the handle in a ref so cleanup sees the same instance */
  const dbRef = useRef<SQLiteDatabase | null>(null);

  /* 1️⃣  Open DB once -------------------------------------------------------- */
  useEffect(() => {
    let mounted = true; // safeguard for race conditions

    (async () => {
      try {
        const db = await getDBConnection();
        if (!mounted) {
          await db.close();
          return;
        }
        dbRef.current = db;
        await createLocalizationTable(db);
        await fetchAndCacheTranslations(db);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'DB initialisation failed');
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      dbRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 2️⃣  Fetch → insert → render ------------------------------------------- */
  const fetchAndCacheTranslations = useCallback(async (db: SQLiteDatabase) => {
    try {
      const apiStart = Date.now();
      const response = await getData();
      const contentData: any[] = response?.data?.contentData ?? [];
      const apiTime = Date.now() - apiStart;

      if (!contentData.length) {
        throw new Error('API returned empty list');
      }

      const langCodes = Object.keys(contentData[0]).filter(k => k !== 'key');
      setLanguages(langCodes);

      const insertStart = Date.now();
      await insertLocalizationData(db, contentData);
      const insertTime = Date.now() - insertStart;

      console.log(
        `✅ fetched ${contentData.length} rows in ${apiTime} ms, ` +
          `inserted in ${insertTime} ms`,
      );

      setTranslations(contentData.slice(0, 4)); // demo only
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch or cache translations');
    } finally {
      setLoading(false);
    }
  }, []);

  /* 3️⃣  UI ----------------------------------------------------------------- */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {translations.map((item, i) => (
        <View key={i} style={styles.card}>
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
      {/* <View style={{marginVertical: 20}}>
        <Button
          title="Test getTranslation()"
          onPress={async () => {
            if (!dbRef.current) return;
            const db = dbRef.current;

            const testKey = 'greeting'; // or any valid key from your data
            const testLang = 'en';

            const start = Date.now();
            try {
              const value = await getTranslation(db, testKey, testLang);
              const elapsed = Date.now() - start;

              Alert.alert(
                'Translation Fetched',
                `Key: ${testKey}\nLanguage: ${testLang}\nValue: ${value}\nTime: ${elapsed}ms`,
              );
            } catch (e) {
              Alert.alert('Error', 'Translation lookup failed');
              console.error(e);
            }
          }}
        />
      </View> */}
    </ScrollView>
  );
}

/* ---------- styles -------------------------------------------------------- */
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
