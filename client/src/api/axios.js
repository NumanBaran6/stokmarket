import axios from 'axios';

/**
 * Merkezi axios örneği.
 * - baseURL: canlıda VITE_API_URL, geliştirmede Vite proxy üzerinden "/api".
 * - request interceptor: localStorage'daki JWT'yi her isteğe ekler.
 * - response interceptor: 401 durumunda oturumu temizler.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Her istekte Authorization başlığını ekle (token varsa)
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('stokmarket_user');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // bozuk veri varsa yoksay
    }
  }
  return config;
});

// Hata cevaplarını sadeleştir ve oturum süresi dolduysa temizle
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('stokmarket_user');
    }
    // Backend'in anlamlı mesajını öne çıkar
    const message =
      error.response?.data?.message || error.message || 'Beklenmeyen bir hata oluştu.';
    return Promise.reject(new Error(message));
  }
);

export default api;
