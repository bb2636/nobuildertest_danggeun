"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const location_controller_1 = require("../controllers/location.controller");
const router = (0, express_1.Router)();
router.get('/', (req, res) => location_controller_1.locationController.getList(req, res));
exports.default = router;
//# sourceMappingURL=location.routes.js.map