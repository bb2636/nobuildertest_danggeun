"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicMessage = getPublicMessage;
const env_1 = require("../config/env");
const logger_1 = require("./logger");
/**
 * 500 등 서버 에러 시 production에서는 고정 메시지만 노출, 상세는 로그만
 */
function getPublicMessage(err, statusCode) {
    if (statusCode >= 500) {
        if (env_1.config.isProduction) {
            logger_1.logger.error('server_error', err);
            return '서버 오류가 발생했습니다.';
        }
    }
    return err?.message || '오류가 발생했습니다.';
}
//# sourceMappingURL=errorResponse.js.map