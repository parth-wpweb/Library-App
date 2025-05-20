import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {getData} from '../api/translateApi';

export default function Translate() {
  const [translations, setTranslations] = useState<any[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTranslate();
  }, []);

  const fetchTranslate = async () => {
    try {
      const response = await getData();
      const contentData = response?.data?.contentData || [];

      if (contentData.length > 0) {
        const firstItem = contentData[0];
        const langs = Object.keys(firstItem).filter(key => key !== 'key');
        setLanguages(langs);
        setTranslations(contentData);
      }
    } catch (e) {
      Alert.alert('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {translations.slice(0, 8).map((item, index) => (
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

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2, // for Android shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
  },
  keyText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  langBlock: {
    marginRight: 16,
    width: 200,
  },
  langLabel: {
    fontWeight: '600',
    color: '#888',
    fontSize: 12,
  },
  langValue: {
    fontSize: 14,
    color: '#222',
  },
});
