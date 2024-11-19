import axios from 'axios';
import { globalEnv } from '../core/config';


const csrfToken = document.cookie.split('; ')
    .find(row => row.startsWith('csrftoken'))
    ?.split('=')[1];


const instance = axios.create({
  baseURL: globalEnv.baseUrl, // Configure o seu baseURL aqui
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrfToken,
  },
});

export default instance;
