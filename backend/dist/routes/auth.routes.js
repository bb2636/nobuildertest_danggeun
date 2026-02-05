"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const router = (0, express_1.Router)();
router.post('/signup', (0, validate_middleware_1.validateRequest)(auth_validator_1.signUpValidator), (req, res) => auth_controller_1.authController.signUp(req, res));
router.post('/login', (0, validate_middleware_1.validateRequest)(auth_validator_1.loginValidator), (req, res) => auth_controller_1.authController.login(req, res));
router.get('/me', auth_middleware_1.authMiddleware, (req, res) => auth_controller_1.authController.getMe(req, res));
router.patch('/me', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateRequest)(auth_validator_1.updateProfileValidator), (req, res) => auth_controller_1.authController.updateMe(req, res));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map