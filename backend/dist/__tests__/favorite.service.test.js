"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const favorite_service_1 = require("../services/favorite.service");
jest.mock('../repositories/favorite.repository', () => ({
    favoriteRepository: {
        exists: jest.fn(),
        add: jest.fn(),
        remove: jest.fn(),
        findPostIdsByUserId: jest.fn(),
    },
}));
jest.mock('../repositories/post.repository', () => ({
    postRepository: {
        findUserIdById: jest.fn(),
        findListByIds: jest.fn(),
    },
}));
const { favoriteRepository } = require('../repositories/favorite.repository');
const { postRepository } = require('../repositories/post.repository');
describe('favoriteService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('toggle', () => {
        it('이미 찜한 글이면 찜 해제 후 favorited: false', async () => {
            favoriteRepository.exists.mockResolvedValue(true);
            favoriteRepository.remove.mockResolvedValue(undefined);
            const result = await favorite_service_1.favoriteService.toggle(1, 10);
            expect(favoriteRepository.remove).toHaveBeenCalledWith(1, 10);
            expect(result).toEqual({ favorited: false });
        });
        it('찜 안 한 글이고 게시글이 없으면 404', async () => {
            favoriteRepository.exists.mockResolvedValue(false);
            postRepository.findUserIdById.mockResolvedValue(null);
            await expect(favorite_service_1.favoriteService.toggle(1, 999)).rejects.toMatchObject({
                message: '게시글을 찾을 수 없습니다.',
                statusCode: 404,
            });
        });
        it('찜 안 한 글이고 게시글 있으면 찜 추가 후 favorited: true', async () => {
            favoriteRepository.exists.mockResolvedValue(false);
            postRepository.findUserIdById.mockResolvedValue(2);
            favoriteRepository.add.mockResolvedValue(true);
            const result = await favorite_service_1.favoriteService.toggle(1, 10);
            expect(favoriteRepository.add).toHaveBeenCalledWith(1, 10);
            expect(result).toEqual({ favorited: true });
        });
    });
    describe('check', () => {
        it('찜 여부를 repository에 위임', async () => {
            favoriteRepository.exists.mockResolvedValue(true);
            expect(await favorite_service_1.favoriteService.check(1, 10)).toBe(true);
            favoriteRepository.exists.mockResolvedValue(false);
            expect(await favorite_service_1.favoriteService.check(1, 10)).toBe(false);
        });
    });
});
//# sourceMappingURL=favorite.service.test.js.map