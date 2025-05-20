import axios from 'axios';

const BASE_URL =
  'https://esim.theglobalwebdev.com/public/api/get-device-content';

export const getData = async () => {
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
