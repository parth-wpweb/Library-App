import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, Button, Alert} from 'react-native';
import {getBooks, addBook, updateBook, deleteBook} from '../api/bookApi';

const BooksScreen = () => {
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch {
      Alert.alert('Failed to fetch books');
    }
  };

  const handleAddBook = async () => {
    try {
      const newBook = {
        title: 'New Mock Book',
        author: 'Mock Author',
        status: 'reading',
      };
      await addBook(newBook);
      fetchBooks();
    } catch {
      Alert.alert('Failed to add book');
    }
  };

  const handleUpdateBook = async (id: string) => {
    try {
      await updateBook(id, {status: 'completed', progress: 100});
      fetchBooks();
    } catch {
      Alert.alert('Failed to update book');
    }
  };

  const handleDeleteBook = async (id: string) => {
    try {
      await deleteBook(id);
      fetchBooks();
    } catch {
      Alert.alert('Failed to delete book');
    }
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <Button title="Add Book" onPress={handleAddBook} />
      <FlatList
        data={books}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View
            style={{marginVertical: 10, padding: 10, backgroundColor: '#eee'}}>
            <Text>
              {item.title} by {item.author}
            </Text>
            <Text>Status: {item.status}</Text>
            {item.status === 'reading' && (
              <Button
                title="Complete"
                onPress={() => handleUpdateBook(item.id)}
              />
            )}
            <Button
              title="Delete"
              color="red"
              onPress={() => handleDeleteBook(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
};

export default BooksScreen;
