"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = void 0;
const search_service_1 = require("../services/search.service");
const errorResponse_1 = require("../utils/errorResponse");
const logger_1 = require("../utils/logger");
exports.searchController = {
    async getSuggestions(req, res) {
        const q = req.query.q?.trim() ?? '';
        const limit = req.query.limit ? Math.min(20, Math.max(1, Number(req.query.limit))) : undefined;
        try {
            const suggestions = await search_service_1.searchService.getSuggestions(q, limit);
            res.json({ suggestions });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('search.getSuggestions', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
};
//# sourceMappingURL=search.controller.js.map