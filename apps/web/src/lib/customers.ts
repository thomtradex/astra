export type CustomerProject = {
  id: string;
  code: string;
  name: string;
  status: string;
  progress?: number;
};

export type Customer = {
  id: string;
  code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
  projects?: CustomerProject[];
};

export type CustomersResponse = {
  items: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function getCustomers(
  search?: string,
  options?: {
    page?: number;
    limit?: number;
  },
): Promise<CustomersResponse> {
  const params = new URLSearchParams({
    page: String(options?.page ?? 1),
    limit: String(options?.limit ?? 25),
  });

  if (search?.trim()) {
    params.set('search', search.trim());
  }

  const response = await fetch(`/api/customers?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return {
      items: [],
      pagination: {
        page: options?.page ?? 1,
        limit: options?.limit ?? 25,
        total: 0,
        totalPages: 1,
      },
    };
  }

  return response.json();
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const response = await fetch(`/api/customers/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}
