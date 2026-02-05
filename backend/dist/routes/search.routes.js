"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const search_controller_1 = require("../controllers/search.controller");
const router = (0, express_1.Router)();
router.get('/suggestions', auth_middleware_1.optionalAuthMiddleware, (req, res) => search_controller_1.searchController.getSuggestions(req, res));
exports.default = router;
//# sourceMappingURL=search.routes.js.map