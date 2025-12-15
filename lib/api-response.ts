import { NextResponse } from 'next/server';

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: any;
};

export function successResponse<T>(data: T, meta?: any, status = 200) {
  return NextResponse.json(
    { success: true, data, meta } as ApiResponse<T>,
    { status }
  );
}

export function errorResponse(message: string, status = 500, error?: any) {
  return NextResponse.json(
    { 
      success: false, 
      error: message, 
      meta: error ? { details: error.message || error } : undefined 
    } as ApiResponse,
    { status }
  );
}

// For Server Actions (which assume a plain object return type often)
export type ActionResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export function actionSuccess<T>(message: string, data?: T): ActionResponse<T> {
  return { success: true, message, data };
}

export function actionError(message: string, errors?: Record<string, string[]>): ActionResponse {
  return { success: false, message, errors };
}
