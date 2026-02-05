"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const crypto_1 = require("crypto");
const logger_1 = require("../utils/logger");
function requestLogger(req, res, next) {
    const requestId = (0, crypto_1.randomUUID)();
    req.requestId = requestId;
    const start = Date.now();
    res.on('finish', () => {
        const durationMs = Date.now() - start;
        logger_1.logger.request({
            requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            userId: req.userId,
            durationMs,
        });
    });
    next();
}
//# sourceMappingURL=requestLogger.middleware.js.map