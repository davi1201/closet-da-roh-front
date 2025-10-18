import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// 1. Defina a URL base do seu Back-end
// É altamente recomendado usar variáveis de ambiente do Next.js
// Ex: process.env.NEXT_PUBLIC_API_URL
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json', // Tipo de conteúdo padrão
  },
});

// 2. Interceptador para Autenticação/Erros
// Tipagem para a configuração da requisição
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Certifique-se de que o código que usa localStorage só é executado no cliente
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');

      if (token) {
        // Assegura que o cabeçalho 'Authorization' existe
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    // A tipagem AxiosError é usada para erros de requisição
    return Promise.reject(error);
  }
);

// 3. Opcional: Interceptador de Resposta para tratamento de erros globais
/*
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Verifica se há uma resposta de erro e trata o status
    if (error.response) {
        
        const status = error.response.status;

        if (status === 401) {
            console.error('Sessão expirada ou token inválido. Redirecionando...');
            // Exemplo de lógica de logout ou redirecionamento
            // if (typeof window !== 'undefined') {
            //     localStorage.removeItem('token');
            //     window.location.href = '/login'; 
            // }
        } else if (status === 403) {
            console.error('Acesso negado.');
        }
    }
    
    return Promise.reject(error);
  }
);
*/

export default api;
