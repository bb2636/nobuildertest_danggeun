import { body } from 'express-validator';

export const signUpValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('이메일은 필수입니다.')
    .isEmail()
    .withMessage('올바른 이메일 형식이 아닙니다.'),
  body('password')
    .notEmpty()
    .withMessage('비밀번호는 필수입니다.')
    .isLength({ min: 6 })
    .withMessage('비밀번호는 6자 이상이어야 합니다.'),
  body('nickname')
    .trim()
    .notEmpty()
    .withMessage('닉네임은 필수입니다.')
    .isLength({ max: 50 })
    .withMessage('닉네임은 50자 이하여야 합니다.'),
  body('locationName').optional().trim().isLength({ max: 100 }),
  body('locationCode').optional().trim().isLength({ max: 20 }),
];

export const loginValidator = [
  body('email').trim().notEmpty().withMessage('이메일을 입력해주세요.').isEmail().withMessage('올바른 이메일 형식이 아닙니다.'),
  body('password').notEmpty().withMessage('비밀번호를 입력해주세요.'),
];

export const updateProfileValidator = [
  body('nickname').optional().trim().isLength({ min: 1, max: 50 }).withMessage('닉네임은 1~50자여야 합니다.'),
  body('locationName').optional().trim().isLength({ max: 100 }),
  body('locationCode').optional().trim().isLength({ max: 20 }),
  body('profileImageUrl').optional().trim().isLength({ max: 512 }).withMessage('프로필 이미지 URL이 너무 깁니다.'),
];
