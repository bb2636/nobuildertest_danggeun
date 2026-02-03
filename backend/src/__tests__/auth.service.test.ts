import { authService } from '../services/auth.service';

jest.mock('../repositories/user.repository', () => ({
  userRepository: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  },
}));

const { userRepository } = require('../repositories/user.repository');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('이미 사용 중인 이메일이면 409 에러', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'a@a.com' });
      await expect(
        authService.signUp({
          email: 'a@a.com',
          password: 'password123',
          nickname: 'nick',
        })
      ).rejects.toMatchObject({ message: '이미 사용 중인 이메일입니다.', statusCode: 409 });
    });

    it('이메일 형식이 아니면 400 에러', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      await expect(
        authService.signUp({
          email: 'invalid-email',
          password: 'password123',
          nickname: 'nick',
        })
      ).rejects.toMatchObject({ message: '올바른 이메일 형식이 아닙니다.', statusCode: 400 });
    });

    it('비밀번호 6자 미만이면 400 에러', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      await expect(
        authService.signUp({
          email: 'a@a.com',
          password: '12345',
          nickname: 'nick',
        })
      ).rejects.toMatchObject({ message: expect.stringContaining('6자 이상'), statusCode: 400 });
    });
  });
});
