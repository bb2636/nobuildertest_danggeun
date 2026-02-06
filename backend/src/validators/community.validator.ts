import { body, param, query } from 'express-validator';

export const communityPostIdParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('올바른 게시글 ID가 아닙니다.'),
];

export const communityListQueryValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('locationCode').optional().trim().isLength({ max: 20 }),
  query('topic').optional().trim().isLength({ max: 50 }),
  query('sort').optional().isIn(['latest', 'popular']).withMessage('sort는 latest 또는 popular이어야 합니다.'),
  query('keyword').optional().trim().isLength({ max: 100 }),
  query('my').optional().isIn(['1', '0']).withMessage('my는 1 또는 0이어야 합니다.'),
];

export const createCommunityPostValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('제목은 필수입니다.')
    .isLength({ max: 200 })
    .withMessage('제목은 200자 이하여야 합니다.'),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('내용은 2000자 이하여야 합니다.'),
  body('topic').optional().trim().isLength({ max: 50 }),
  body('locationName').optional().trim().isLength({ max: 100 }),
  body('locationCode').optional().trim().isLength({ max: 20 }),
];

export const updateCommunityPostValidator = [
  param('id').isInt({ min: 1 }).withMessage('올바른 게시글 ID가 아닙니다.'),
  body('title').optional().trim().isLength({ max: 200 }),
  body('content').optional().trim().isLength({ max: 2000 }),
  body('topic').optional().trim().isLength({ max: 50 }),
];

export const createCommentValidator = [
  param('id').isInt({ min: 1 }).withMessage('올바른 게시글 ID가 아닙니다.'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('댓글 내용을 입력해주세요.')
    .isLength({ max: 1000 })
    .withMessage('댓글은 1000자 이하여야 합니다.'),
];
