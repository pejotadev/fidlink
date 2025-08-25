// Generic pagination options for repositories
export interface PaginationOptions {
  page: number;
  limit: number;
  skip?: number;
  take?: number;
}

// Generic sort options
export interface SortOptions {
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Combined query options
export interface QueryOptions extends PaginationOptions, SortOptions {}

// Generic filter interface that can be extended
export interface BaseFilter {
  [key: string]: any;
}

// Repository find options
export interface FindManyOptions<TWhereInput = any, TOrderByInput = any> {
  skip?: number;
  take?: number;
  where?: TWhereInput;
  orderBy?: TOrderByInput;
}

// Result with count for pagination
export interface FindManyResult<T> {
  data: T[];
  total: number;
}

// Pagination calculation result
export interface PaginationCalculation {
  skip: number;
  take: number;
  page: number;
  limit: number;
}
