"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const notifications_controller_1 = require("../controllers/notifications.controller");
const router = (0, express_1.Router)();
router.get('/counts', auth_middleware_1.authMiddleware, (req, res) => notifications_controller_1.notificationsController.getCounts(req, res));
exports.default = router;
//# sourceMappingURL=notifications.routes.js.map