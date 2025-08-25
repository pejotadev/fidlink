import { 
  PaginationQueryDto, 
  SortQueryDto, 
  PaginationMetaDto, 
  PaginatedResponseDto,
  ListResponseDto 
} from '../dto/pagination.dto';
import { 
  PaginationOptions, 
  SortOptions, 
  QueryOptions,
  PaginationCalculation,
  FindManyResult 
} from '../types/pagination.types';

export class PaginationUtils {
  /**
   * Calculates pagination values from query parameters
   * @param query - Pagination query DTO
   * @returns Calculated pagination values
   */
  static calculatePagination(query: PaginationQueryDto): PaginationCalculation {
    // Priority: page/limit over skip/take
    let page: number;
    let limit: number;

    if (query.page !== undefined && query.limit !== undefined) {
      page = query.page;
      limit = query.limit;
    } else if (query.skip !== undefined && query.take !== undefined) {
      limit = query.take;
      page = Math.floor(query.skip / limit) + 1;
    } else {
      // Use defaults
      page = query.page || 1;
      limit = query.limit || query.take || 10;
    }

    const skip = (page - 1) * limit;
    const take = limit;

    return { skip, take, page, limit };
  }

  /**
   * Creates pagination metadata
   * @param total - Total number of items
   * @param page - Current page number
   * @param limit - Items per page
   * @returns Pagination metadata DTO
   */
  static createPaginationMeta(total: number, page: number, limit: number): PaginationMetaDto {
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const take = limit;
    
    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      skip,
      take,
    };
  }

  /**
   * Creates paginated response
   * @param data - Array of items
   * @param total - Total number of items
   * @param page - Current page
   * @param limit - Items per page
   * @returns Paginated response DTO
   */
  static createPaginatedResponse<T>(
    data: T[], 
    total: number, 
    page: number, 
    limit: number
  ): PaginatedResponseDto<T> {
    const meta = this.createPaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Creates simple list response
   * @param data - Array of items
   * @returns List response DTO
   */
  static createListResponse<T>(data: T[]): ListResponseDto<T> {
    return {
      data,
      total: data.length,
    };
  }

  /**
   * Converts query DTOs to options
   * @param paginationQuery - Pagination query DTO
   * @param sortQuery - Sort query DTO
   * @returns Combined query options
   */
  static toQueryOptions(
    paginationQuery?: PaginationQueryDto, 
    sortQuery?: SortQueryDto
  ): QueryOptions {
    const pagination = paginationQuery ? this.calculatePagination(paginationQuery) : {
      page: 1,
      limit: 10,
      skip: 0,
      take: 10
    };

    const sort: SortOptions = {
      orderBy: sortQuery?.orderBy || sortQuery?.sortBy,
      orderDirection: sortQuery?.orderDirection || sortQuery?.sortDirection || 'desc',
    };

    return {
      ...pagination,
      ...sort,
    };
  }

  /**
   * Converts query options to repository find options
   * @param options - Query options
   * @param whereClause - Where clause for filtering
   * @param defaultOrderBy - Default order by field
   * @returns Repository find options
   */
  static toFindManyOptions<TWhereInput, TOrderByInput>(
    options: QueryOptions,
    whereClause?: TWhereInput,
    defaultOrderBy?: string
  ): { skip: number; take: number; where?: TWhereInput; orderBy?: TOrderByInput } {
    const orderBy: any = {};
    const orderField = options.orderBy || options.sortBy || defaultOrderBy || 'createdAt';
    const orderDirection = options.orderDirection || options.sortDirection || 'desc';
    
    orderBy[orderField] = orderDirection;

    return {
      skip: options.skip || 0,
      take: options.take || options.limit || 10,
      where: whereClause,
      orderBy: orderBy as TOrderByInput,
    };
  }

  /**
   * Validates pagination parameters
   * @param page - Page number
   * @param limit - Items per page
   * @throws Error if parameters are invalid
   */
  static validatePaginationParams(page?: number, limit?: number): void {
    if (page !== undefined && page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (limit !== undefined && (limit < 1 || limit > 100)) {
      throw new Error('Limit must be between 1 and 100');
    }
  }

  /**
   * Calculates total pages
   * @param total - Total number of items
   * @param limit - Items per page
   * @returns Number of total pages
   */
  static calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }

  /**
   * Checks if there are more pages
   * @param page - Current page
   * @param totalPages - Total number of pages
   * @returns Whether there are more pages
   */
  static hasNextPage(page: number, totalPages: number): boolean {
    return page < totalPages;
  }

  /**
   * Checks if there are previous pages
   * @param page - Current page
   * @returns Whether there are previous pages
   */
  static hasPreviousPage(page: number): boolean {
    return page > 1;
  }
}
