import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.novohorizonteteresopolis.com.br', // Altere para a URL da sua API
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;