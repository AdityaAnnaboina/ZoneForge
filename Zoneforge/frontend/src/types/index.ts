export interface User {
  id: number;
  username: string;
  created_at: string;
  email?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface HostedZone {
  id: string;
  name: string;
  type: "Public" | "Private";
  comment: string | null;
  record_count: number;
  created_at: string;
  updated_at: string;
}

export interface HostedZoneCreate {
  name: string;
  type: "Public" | "Private";
  comment?: string;
}

export interface HostedZoneUpdate {
  type?: "Public" | "Private";
  comment?: string;
}

export interface DNSRecord {
  id: string;
  hosted_zone_id: string;
  name: string;
  type: string;
  ttl: number;
  value: string;
  routing_policy: string;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface DNSRecordCreate {
  name: string;
  type: string;
  ttl: number;
  value: string;
  routing_policy: string;
  comment?: string;
}

export interface DNSRecordUpdate {
  name?: string;
  ttl?: number;
  value?: string;
  routing_policy?: string;
  comment?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
}

export const RECORD_TYPES = ["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"] as const;
export const ROUTING_POLICIES = ["Simple", "Weighted", "Latency", "Failover", "Geolocation", "Multivalue"] as const;
export const ZONE_TYPES = ["Public", "Private"] as const;
