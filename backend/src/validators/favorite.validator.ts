import { param } from 'express-validator';

export const postIdParamValidator = [
  param('postId')
    .isInt({ min: 1 })
    .withMessage('올바른 게시글 ID가 아닙니다.'),
];
