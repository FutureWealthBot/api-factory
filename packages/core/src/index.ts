import crypto from 'crypto';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  requestId: string;
  timestamp: string;
}

export function newRequestId(): string {
  return crypto.randomBytes(8).toString('hex');
}

export function ok<T>(data: T, requestId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    requestId: requestId || newRequestId(),
    timestamp: new Date().toISOString(),
  };
}

export function err(
  code: string, 
  message: string, 
  requestId?: string, 
  details?: any
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    requestId: requestId || newRequestId(),
    timestamp: new Date().toISOString(),
  };
}