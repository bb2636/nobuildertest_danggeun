"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repository_1 = require("../repositories/user.repository");
const env_1 = require("../config/env");
const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
exports.authService = {
    async signUp(params) {
        if (!EMAIL_REGEX.test(params.email)) {
            const error = new Error('올바른 이메일 형식이 아닙니다.');
            error.statusCode = 400;
            throw error;
        }
        if (params.password.length < MIN_PASSWORD_LENGTH) {
            const error = new Error('비밀번호는 6자 이상이어야 합니다.');
            error.statusCode = 400;
            throw error;
        }
        const existing = await user_repository_1.userRepository.findByEmail(params.email);
        if (existing) {
            const error = new Error('이미 사용 중인 이메일입니다.');
            error.statusCode = 409;
            throw error;
        }
        const hashed = await bcryptjs_1.default.hash(params.password, SALT_ROUNDS);
        const userId = await user_repository_1.userRepository.create({
            email: params.email,
            password: hashed,
            nickname: params.nickname,
            location_name: params.locationName,
            location_code: params.locationCode,
        });
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user)
            throw new Error('회원가입 후 사용자 조회 실패');
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, env_1.config.jwt.secret, { expiresIn: env_1.config.jwt.expiresIn });
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
            expiresIn: env_1.config.jwt.expiresIn,
        };
    },
    async login(email, password) {
        const user = await user_repository_1.userRepository.findByEmail(email);
        if (!user) {
            const error = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
            error.statusCode = 401;
            throw error;
        }
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match) {
            const error = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
            error.statusCode = 401;
            throw error;
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, env_1.config.jwt.secret, { expiresIn: env_1.config.jwt.expiresIn });
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
            expiresIn: env_1.config.jwt.expiresIn,
        };
    },
    async getMe(userId) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user)
            return null;
        return {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            profileImageUrl: user.profile_image_url,
            locationName: user.location_name,
            locationCode: user.location_code,
        };
    },
    async updateProfile(userId, data) {
        const updated = await user_repository_1.userRepository.update(userId, {
            nickname: data.nickname,
            location_name: data.locationName,
            location_code: data.locationCode,
            profile_image_url: data.profileImageUrl,
        });
        if (!updated)
            return null;
        return exports.authService.getMe(userId);
    },
};
//# sourceMappingURL=auth.service.js.map