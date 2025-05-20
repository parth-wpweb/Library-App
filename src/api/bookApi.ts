import axios from 'axios';

const BASE_URL =
  'https://682c4309d29df7a95be6360e.mockapi.io/api/v1/books/getBooks'; // Replace with your API URL

// GET all books
export const getBooks = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data; // Your books array or data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};

// POST new book
export const addBook = async (bookData: any) => {
  try {
    const response = await axios.post(BASE_URL, bookData);
    return response.data;
  } catch (error) {
    console.error('POST add book error:', error);
    throw error;
  }
};

// PUT update book by ID
export const updateBook = async (id: string, bookData: any) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, bookData);
    return response.data;
  } catch (error) {
    console.error('PUT update book error:', error);
    throw error;
  }
};

// DELETE book by ID
export const deleteBook = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('DELETE book error:', error);
    throw error;
  }
};
