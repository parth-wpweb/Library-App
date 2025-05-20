import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  Button,
  StatusBar,
  useColorScheme,
  StyleSheet,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {connectToDatabase, createTables} from './src/db/database';
import {
  addContact,
  getContacts,
  removeContact,
  updateContact,
} from './src/db/contacts';

type Contact = {
  id?: number;
  firstName: string;
  name: string;
  phoneNumber: string;
};

export default function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  /* ---------- form state ---------- */
  const [firstName, setFirstName] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null); // null → add mode

  /* ---------- contacts list ---------- */
  const [contacts, setContacts] = useState<Contact[]>([]);

  /* ---------- helpers ---------- */
  const listContacts = useCallback(async () => {
    const db = await connectToDatabase();
    setContacts(await getContacts(db));
  }, []);

  const resetForm = () => {
    setFirstName('');
    setName('');
    setPhoneNumber('');
    setEditingId(null);
  };

  const handleSave = useCallback(async () => {
    if (!firstName || !name || !phoneNumber) {
      alert('Please fill in all fields');
      return;
    }

    const db = await connectToDatabase();
    const contact: Contact = {firstName, name, phoneNumber};

    if (editingId === null) {
      await addContact(db, contact);
    } else {
      await updateContact(db, {...contact, id: editingId});
    }

    resetForm();
    await listContacts();
  }, [firstName, name, phoneNumber, editingId, listContacts]);

  const handleEdit = (contact: Contact) => {
    setFirstName(contact.firstName);
    setName(contact.name);
    setPhoneNumber(contact.phoneNumber);
    setEditingId(contact.id!);
  };

  const handleDelete = useCallback(
    async (id: number) => {
      const db = await connectToDatabase();
      await removeContact(db, id);
      await listContacts();
    },
    [listContacts],
  );

  /* ---------- initialisation ---------- */
  useEffect(() => {
    (async () => {
      const db = await connectToDatabase();
      await createTables(db);
      await listContacts();
    })();
  }, [listContacts]);

  /* ---------- UI ---------- */
  const bg = {backgroundColor: isDarkMode ? Colors.darker : Colors.lighter};

  return (
    <View style={[bg, styles.container]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={bg.backgroundColor}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ---------- form ---------- */}
        <Text style={styles.heading}>
          {editingId === null ? '➕ Add Contact' : '✏️  Edit Contact'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          keyboardType="phone-pad"
          onChangeText={setPhoneNumber}
        />

        <View style={styles.buttonRow}>
          <Button
            title={editingId === null ? 'Save Contact' : 'Update Contact'}
            onPress={handleSave}
          />
          {editingId !== null && (
            <View style={{marginLeft: 10}}>
              <Button title="Cancel" color="#888" onPress={resetForm} />
            </View>
          )}
        </View>

        {/* ---------- list ---------- */}
        <Text style={styles.heading}>👥 Contacts</Text>
        {contacts.map(contact => (
          <View key={contact.id} style={styles.card}>
            <View style={{flex: 1}}>
              <Text style={styles.contactName}>
                {contact.firstName} {contact.name}
              </Text>
              <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
            </View>
            <View style={styles.cardButtons}>
              <Button title="Edit" onPress={() => handleEdit(contact)} />
              <View style={{height: 4}} />
              <Button
                title="Delete"
                color="#c00"
                onPress={() => handleDelete(contact.id!)}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: {flex: 1},
  scroll: {padding: 20},
  heading: {fontSize: 22, fontWeight: '600', marginTop: 25, marginBottom: 10},
  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  buttonRow: {flexDirection: 'row', marginBottom: 20},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
  cardButtons: {marginLeft: 12},
  contactName: {fontSize: 17, fontWeight: '500'},
  contactPhone: {color: '#555'},
});
