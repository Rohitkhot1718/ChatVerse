import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://t2dh4c5x-3001.inc1.devtunnels.ms/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

export default axiosInstance;
