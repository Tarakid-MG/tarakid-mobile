import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const getBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.121:3002";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message) {
      const message = error.response.data.message;
      error.message = Array.isArray(message) ? message.join(" ") : message;
    }
    return Promise.reject(error);
  },
);

export default api;
