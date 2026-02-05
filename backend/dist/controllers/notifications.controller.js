"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsController = void 0;
const community_repository_1 = require("../repositories/community.repository");
const chat_repository_1 = require("../repositories/chat.repository");
const errorResponse_1 = require("../utils/errorResponse");
const logger_1 = require("../utils/logger");
exports.notificationsController = {
    async getCounts(req, res) {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        try {
            const [communityCommentCount, chatUnreadCount] = await Promise.all([
                community_repository_1.communityRepository.countCommentsOnMyPostsByOthers(userId),
                chat_repository_1.chatRepository.countRoomsWithLastMessageFromOther(userId),
            ]);
            res.json({
                communityCommentCount,
                chatUnreadCount,
            });
        }
        catch (e) {
            const err = e;
            logger_1.logger.error('notifications.getCounts', err);
            res.status(500).json({ message: (0, errorResponse_1.getPublicMessage)(err, 500) });
        }
    },
};
//# sourceMappingURL=notifications.controller.js.map