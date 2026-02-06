import { chatService } from '../services/chat.service';

jest.mock('../repositories/chat.repository', () => ({
  chatRepository: {
    findRoomByPostAndMembers: jest.fn(),
    createRoom: jest.fn(),
    addMember: jest.fn(),
    isMember: jest.fn(),
    findMessages: jest.fn(),
    createMessage: jest.fn(),
  },
}));
jest.mock('../repositories/post.repository', () => ({
  postRepository: {
    findUserIdById: jest.fn(),
  },
}));

const { chatRepository } = require('../repositories/chat.repository');
const { postRepository } = require('../repositories/post.repository');

describe('chatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateRoom', () => {
    it('게시글이 없으면 404', async () => {
      (postRepository.findUserIdById as jest.Mock).mockResolvedValue(null);
      await expect(chatService.getOrCreateRoom(1, 999)).rejects.toMatchObject({
        message: '게시글을 찾을 수 없습니다.',
        statusCode: 404,
      });
    });

    it('본인 게시글이면 400', async () => {
      (postRepository.findUserIdById as jest.Mock).mockResolvedValue(1);
      await expect(chatService.getOrCreateRoom(1, 10)).rejects.toMatchObject({
        message: '본인 게시글에는 채팅할 수 없습니다.',
        statusCode: 400,
      });
    });

    it('이미 방이 있으면 해당 roomId 반환', async () => {
      (postRepository.findUserIdById as jest.Mock).mockResolvedValue(2);
      (chatRepository.findRoomByPostAndMembers as jest.Mock).mockResolvedValue(5);
      const result = await chatService.getOrCreateRoom(1, 10);
      expect(result).toEqual({ roomId: 5 });
      expect(chatRepository.createRoom).not.toHaveBeenCalled();
    });

    it('방이 없으면 생성 후 roomId 반환', async () => {
      (postRepository.findUserIdById as jest.Mock).mockResolvedValue(2);
      (chatRepository.findRoomByPostAndMembers as jest.Mock).mockResolvedValue(null);
      (chatRepository.createRoom as jest.Mock).mockResolvedValue(3);
      (chatRepository.addMember as jest.Mock).mockResolvedValue(undefined);
      const result = await chatService.getOrCreateRoom(1, 10);
      expect(chatRepository.createRoom).toHaveBeenCalledWith(10);
      expect(chatRepository.addMember).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ roomId: 3 });
    });
  });

  describe('sendMessage', () => {
    it('방 멤버가 아니면 403', async () => {
      (chatRepository.isMember as jest.Mock).mockResolvedValue(false);
      await expect(chatService.sendMessage(1, 99, '안녕')).rejects.toMatchObject({
        message: '채팅방에 접근할 수 없습니다.',
        statusCode: 403,
      });
    });

    it('내용이 비어 있으면 400', async () => {
      (chatRepository.isMember as jest.Mock).mockResolvedValue(true);
      await expect(chatService.sendMessage(1, 1, '   ')).rejects.toMatchObject({
        message: '메시지 내용을 입력해주세요.',
        statusCode: 400,
      });
    });

    it('정상 시 createMessage 호출 후 messageId 반환', async () => {
      (chatRepository.isMember as jest.Mock).mockResolvedValue(true);
      (chatRepository.createMessage as jest.Mock).mockResolvedValue(100);
      const result = await chatService.sendMessage(1, 1, '안녕');
      expect(chatRepository.createMessage).toHaveBeenCalledWith(1, 1, '안녕', 'text');
      expect(result).toEqual({ messageId: 100 });
    });
  });
});
