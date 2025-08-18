/**
 * 基础API接口定义
 * @description 提供所有API接口的基础结构和通用类型
 * @author 开发团队
 */

/**
 * API版本枚举
 */
export enum APIVersion {
  V1 = 'v1',
  V2 = 'v2',
}

/**
 * HTTP状态码枚举
 */
export enum StatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * API响应基础接口
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: StatusCode;
  timestamp: string;
  version: APIVersion;
  requestId?: string;
}

/**
 * API错误接口
 */
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
  timestamp: string;
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 排序参数接口
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * 过滤参数接口
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * 查询参数接口
 */
export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams[];
  filter?: FilterParams;
  search?: string;
}

/**
 * API请求配置接口
 */
export interface APIRequestConfig {
  version?: APIVersion;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  validateResponse?: boolean;
}

/**
 * 批量操作参数接口
 */
export interface BatchOperationParams<T> {
  operation: 'create' | 'update' | 'delete';
  items: T[];
  options?: Record<string, any>;
}

/**
 * 批量操作响应接口
 */
export interface BatchOperationResponse<T> {
  successful: T[];
  failed: Array<{
    item: T;
    error: APIError;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * 文件上传参数接口
 */
export interface FileUploadParams {
  file: File;
  filename?: string;
  contentType?: string;
  metadata?: Record<string, any>;
}

/**
 * 文件上传响应接口
 */
export interface FileUploadResponse {
  id: string;
  filename: string;
  size: number;
  contentType: string;
  url: string;
  metadata?: Record<string, any>;
  uploadedAt: string;
}

/**
 * 导出参数接口
 */
export interface ExportParams {
  format: 'json' | 'csv' | 'xlsx' | 'pdf' | 'png' | 'jpg' | 'svg';
  options?: Record<string, any>;
  includeMetadata?: boolean;
}

/**
 * 导出响应接口
 */
export interface ExportResponse {
  id: string;
  format: string;
  size: number;
  url: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * 健康检查响应接口
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services: Record<string, {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    message?: string;
  }>;
  metrics?: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  version: APIVersion = APIVersion.V1
): APIResponse<T> {
  const response: APIResponse<T> = {
    success: true,
    data,
    code: StatusCode.OK,
    timestamp: new Date().toISOString(),
    version,
  };
  
  if (message !== undefined) {
    response.message = message;
  }
  
  return response;
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  error: APIError,
  version: APIVersion = APIVersion.V1
): APIResponse {
  return {
    success: false,
    message: error.message,
    code: StatusCode.BAD_REQUEST,
    timestamp: new Date().toISOString(),
    version,
  };
}

/**
 * 创建分页响应
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const { page, limit } = params;
  const totalPages = Math.ceil(total / limit);
  
  return {
    items,
    total,
    page,
    limit,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * API错误类
 */
export class APIException extends Error {
  public readonly code: string;
  public readonly statusCode: StatusCode;
  public readonly details?: Record<string, any>;
  public readonly field?: string;

  constructor(
    code: string,
    message: string,
    statusCode: StatusCode = StatusCode.BAD_REQUEST,
    details?: Record<string, any>,
    field?: string
  ) {
    super(message);
    this.name = 'APIException';
    this.code = code;
    this.statusCode = statusCode;
    
    if (details !== undefined) {
      this.details = details;
    }
    
    if (field !== undefined) {
      this.field = field;
    }
  }

  toAPIError(): APIError {
    const error: APIError = {
      code: this.code,
      message: this.message,
      timestamp: new Date().toISOString(),
    };
    
    if (this.details !== undefined) {
      error.details = this.details;
    }
    
    if (this.field !== undefined) {
      error.field = this.field;
    }
    
    return error;
  }
}