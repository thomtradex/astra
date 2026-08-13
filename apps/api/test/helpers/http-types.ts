export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface MeResponse {
  email: string;
  organizationId: string;
  permissions: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface TenantResource {
  organization_id: string;
}

export interface CountResponse {
  count: number;
}

export function bodyOf<T>(response: { body: unknown }): T {
  return response.body as T;
}
