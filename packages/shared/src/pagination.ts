export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 50,
  MAX_LIMIT: 100,
} as const;

export function normalizePagination(
  page?: number,
  limit?: number,
): { page: number; limit: number; skip: number } {
  const normalizedPage = Math.max(page ?? PAGINATION_DEFAULTS.PAGE, 1);
  const normalizedLimit = Math.min(
    Math.max(limit ?? PAGINATION_DEFAULTS.LIMIT, 1),
    PAGINATION_DEFAULTS.MAX_LIMIT,
  );

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
  };
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
