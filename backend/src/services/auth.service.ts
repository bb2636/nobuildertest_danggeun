import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthResponse } from '../dto/auth.dto';
import { userRepository } from '../repositories/user.repository';
import { JwtPayload } from '../types';

import { config } from '../config/env';

const SALT_ROUNDS = 10;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export const authService = {
  async signUp(params: {
    email: string;
    password: string;
    nickname: string;
    locationName?: string;
    locationCode?: string;
  }): Promise<AuthResponse> {
    const existing = await userRepository.findByEmail(params.email);
    if (existing) {
      const error = new Error('이미 사용 중인 이메일입니다.');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }
    const hashed = await bcrypt.hash(params.password, SALT_ROUNDS);
    const userId = await userRepository.create({
      email: params.email,
      password: hashed,
      nickname: params.nickname,
      location_name: params.locationName,
      location_code: params.locationCode,
    });
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('회원가입 후 사용자 조회 실패');
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email } as JwtPayload,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImageUrl: user.profile_image_url,
        locationName: user.location_name,
        locationCode: user.location_code,
      },
      accessToken,
      expiresIn: config.jwt.expiresIn,
    };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      (error as Error & { statusCode?: number }).statusCode = 401;
      throw error;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const error = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      (error as Error & { statusCode?: number }).statusCode = 401;
      throw error;
    }
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email } as JwtPayload,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImageUrl: user.profile_image_url,
        locationName: user.location_name,
        locationCode: user.location_code,
      },
      accessToken,
      expiresIn: config.jwt.expiresIn,
    };
  },

  async getMe(userId: number): Promise<AuthResponse['user'] | null> {
    const user = await userRepository.findById(userId);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImageUrl: user.profile_image_url,
      locationName: user.location_name,
      locationCode: user.location_code,
    };
  },

  async updateProfile(
    userId: number,
    data: {
      nickname?: string;
      locationName?: string | null;
      locationCode?: string | null;
      profileImageUrl?: string | null;
    }
  ): Promise<AuthResponse['user'] | null> {
    const updated = await userRepository.update(userId, {
      nickname: data.nickname,
      location_name: data.locationName,
      location_code: data.locationCode,
      profile_image_url: data.profileImageUrl,
    });
    if (!updated) return null;
    return authService.getMe(userId);
  },
};
