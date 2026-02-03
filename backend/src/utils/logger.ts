const ts = () => new Date().toISOString();

export interface LogContext {
  requestId?: string;
  userId?: number;
  [key: string]: unknown;
}

export const logger = {
  /**
   * 에러 로그. context에 requestId, userId를 넣으면 요청과 연관해 추적 가능
   */
  error(message: string, err?: Error, context?: LogContext): void {
    const payload: Record<string, unknown> = {
      ts: ts(),
      level: 'error',
      message,
      errMessage: err?.message,
      ...(context && Object.keys(context).length > 0 ? context : {}),
    };
    if (err?.stack) payload.stack = err.stack;
    console.error(JSON.stringify(payload));
  },

  /** 요청 단위 구조화 로그 (requestId, method, path, statusCode, userId, durationMs) */
  request(data: {
    requestId?: string;
    method: string;
    path: string;
    statusCode: number;
    userId?: number;
    durationMs?: number;
    errMessage?: string;
  }): void {
    const payload = { ts: ts(), level: 'request', ...data };
    console.log(JSON.stringify(payload));
  },
};
