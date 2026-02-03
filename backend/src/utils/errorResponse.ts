import { config } from '../config/env';
import { logger } from './logger';

/**
 * 500 등 서버 에러 시 production에서는 고정 메시지만 노출, 상세는 로그만
 */
export function getPublicMessage(err: Error, statusCode: number): string {
  if (statusCode >= 500) {
    if (config.isProduction) {
      logger.error('server_error', err);
      return '서버 오류가 발생했습니다.';
    }
  }
  return err?.message || '오류가 발생했습니다.';
}
