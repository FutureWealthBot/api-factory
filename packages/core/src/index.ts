export type ApiSuccess<T=unknown> = {
  success: true; data: T; error: null; meta: { request_id: string };
};
export type ApiError = {
  success: false; data: null; error: { code: string; message: string; details?: unknown }; meta: { request_id: string };
};
export const ok = <T>(data:T, request_id:string): ApiSuccess<T> =>
  ({ success:true, data, error:null, meta:{ request_id } });
export const err = (code:string, message:string, request_id:string, details?:unknown): ApiError =>
  ({ success:false, data:null, error:{ code, message, details }, meta:{ request_id } });

export const newRequestId = () =>
  (Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,8)).toUpperCase();

export * from './tiers';

export * from './keys';
export * from './store';
