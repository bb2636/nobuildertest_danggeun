"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationController = void 0;
const locations_mock_1 = require("../data/locations.mock");
const errorResponse_1 = require("../utils/errorResponse");
exports.locationController = {
    async getList(_req, res) {
        try {
            res.json({ locations: locations_mock_1.MOCK_LOCATIONS });
        }
        catch (e) {
            const err = e;
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
};
//# sourceMappingURL=location.controller.js.map