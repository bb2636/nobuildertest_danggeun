"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_service_1 = require("../services/post.service");
jest.mock('../repositories/post.repository', () => ({
    postRepository: {
        findList: jest.fn(),
        findById: jest.fn(),
        incrementViewCount: jest.fn(),
        findUserIdById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));
const { postRepository } = require('../repositories/post.repository');
describe('postService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('getList', () => {
        it('목록과 total, page, totalPages 반환', async () => {
            postRepository.findList.mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        title: '제목',
                        price: 1000,
                        status: 'SALE',
                        location_name: '역삼동',
                        image_urls: null,
                        created_at: new Date(),
                        view_count: 0,
                        user_nickname: '유저',
                    },
                ],
                total: 1,
            });
            const result = await post_service_1.postService.getList({ page: 1, limit: 20 });
            expect(result.posts).toHaveLength(1);
            expect(result.posts[0].title).toBe('제목');
            expect(result.total).toBe(1);
            expect(result.page).toBe(1);
            expect(result.totalPages).toBe(1);
        });
    });
    describe('getDetail', () => {
        it('skipViewIncrement가 true면 조회수 증가 안 함', async () => {
            postRepository.findById.mockResolvedValue({
                id: 1,
                user_id: 1,
                title: '제목',
                content: '내용',
                price: 1000,
                status: 'SALE',
                category: null,
                location_name: '역삼동',
                location_code: '6035',
                image_urls: null,
                view_count: 5,
                created_at: new Date(),
                updated_at: new Date(),
                user_nickname: '유저',
            });
            const result = await post_service_1.postService.getDetail(1, true);
            expect(result).not.toBeNull();
            expect(result.viewCount).toBe(5);
            expect(postRepository.incrementViewCount).not.toHaveBeenCalled();
        });
        it('skipViewIncrement가 false면 조회수 +1', async () => {
            postRepository.findById.mockResolvedValue({
                id: 1,
                user_id: 1,
                title: '제목',
                content: null,
                price: null,
                status: 'SALE',
                category: null,
                location_name: null,
                location_code: null,
                image_urls: null,
                view_count: 10,
                created_at: new Date(),
                updated_at: new Date(),
                user_nickname: '유저',
            });
            const result = await post_service_1.postService.getDetail(1, false);
            expect(result.viewCount).toBe(11);
            expect(postRepository.incrementViewCount).toHaveBeenCalledWith(1);
        });
    });
});
//# sourceMappingURL=post.service.test.js.map