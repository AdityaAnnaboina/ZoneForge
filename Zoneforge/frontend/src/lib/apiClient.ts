import axios from "axios";
import { useAuthStore } from "../store/authStore";
import {
  User,
  HostedZone,
  HostedZoneCreate,
  HostedZoneUpdate,
  DNSRecord,
  DNSRecordCreate,
  DNSRecordUpdate,
  PaginatedResponse,
} from "../types";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === "development") {
      console.error("API Error Intercepted:", error);
    }
    if (error.response?.status === 401) {
      useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    const message = error.response?.data?.detail || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post("/api/auth/login", { username, password });
    return response.data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout");
  },
  getMe: async (): Promise<User> => {
    const response = await apiClient.get("/api/auth/me");
    return response.data;
  },
};

export const hostedZonesApi = {
  getHostedZones: async (params: {
    search?: string;
    type_filter?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<HostedZone>> => {
    const response = await apiClient.get("/api/hosted-zones", { params });
    return response.data;
  },
  getHostedZone: async (id: string): Promise<HostedZone> => {
    const response = await apiClient.get(`/api/hosted-zones/${id}`);
    return response.data;
  },
  createHostedZone: async (data: HostedZoneCreate): Promise<HostedZone> => {
    const response = await apiClient.post("/api/hosted-zones", data);
    return response.data;
  },
  updateHostedZone: async (id: string, data: HostedZoneUpdate): Promise<HostedZone> => {
    const response = await apiClient.put(`/api/hosted-zones/${id}`, data);
    return response.data;
  },
  deleteHostedZone: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/hosted-zones/${id}`);
  },
};

export const dnsRecordsApi = {
  getDNSRecords: async (
    zoneId: string,
    params: {
      search?: string;
      type_filter?: string;
      page?: number;
      page_size?: number;
    }
  ): Promise<PaginatedResponse<DNSRecord>> => {
    const response = await apiClient.get(`/api/hosted-zones/${zoneId}/records`, { params });
    return response.data;
  },
  getDNSRecord: async (zoneId: string, recordId: string): Promise<DNSRecord> => {
    const response = await apiClient.get(`/api/hosted-zones/${zoneId}/records/${recordId}`);
    return response.data;
  },
  createDNSRecord: async (zoneId: string, data: DNSRecordCreate): Promise<DNSRecord> => {
    const response = await apiClient.post(`/api/hosted-zones/${zoneId}/records`, data);
    return response.data;
  },
  updateDNSRecord: async (
    zoneId: string,
    recordId: string,
    data: DNSRecordUpdate
  ): Promise<DNSRecord> => {
    const response = await apiClient.put(`/api/hosted-zones/${zoneId}/records/${recordId}`, data);
    return response.data;
  },
  deleteDNSRecord: async (zoneId: string, recordId: string): Promise<void> => {
    await apiClient.delete(`/api/hosted-zones/${zoneId}/records/${recordId}`);
  },
};

export default apiClient;
