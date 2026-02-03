import { body, param, query } from 'express-validator';

const STATUS_VALUES = ['SALE', 'RESERVED', 'SOLD'];

export const createPostValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('제목은 필수입니다.')
    .isLength({ max: 100 })
    .withMessage('제목은 100자 이하여야 합니다.'),
  body('content').optional().trim(),
  body('price')
    .optional({ values: 'null' })
    .custom((v) => v == null || (Number.isInteger(Number(v)) && Number(v) >= 0))
    .withMessage('가격은 0 이상의 정수이거나 비어 있어야 합니다.'),
  body('status')
    .optional()
    .isIn(STATUS_VALUES)
    .withMessage(`status는 ${STATUS_VALUES.join(', ')} 중 하나여야 합니다.`),
  body('category').optional().trim().isLength({ max: 50 }),
  body('locationName').optional().trim().isLength({ max: 100 }),
  body('locationCode').optional().trim().isLength({ max: 20 }),
  body('imageUrls').optional().isArray().withMessage('imageUrls는 배열이어야 합니다.'),
  body('imageUrls.*').optional().isString().isURL().withMessage('imageUrls 항목은 URL 문자열이어야 합니다.'),
];

export const updatePostValidator = [
  param('id').isInt({ min: 1 }).withMessage('올바른 게시글 ID가 아닙니다.'),
  body('title').optional().trim().isLength({ max: 100 }),
  body('content').optional().trim(),
  body('price').optional().isInt({ min: 0 }),
  body('status').optional().isIn(STATUS_VALUES),
  body('category').optional().trim().isLength({ max: 50 }),
  body('locationName').optional().trim().isLength({ max: 100 }),
  body('locationCode').optional().trim().isLength({ max: 20 }),
  body('imageUrls').optional().isArray(),
  body('imageUrls.*').optional().isString(),
];

export const postIdParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('올바른 게시글 ID가 아닙니다.'),
];

export const postListQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page는 1 이상의 정수여야 합니다.'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit는 1~50 사이여야 합니다.'),
  query('locationCode').optional().trim().isLength({ max: 20 }),
  query('status').optional().isIn(STATUS_VALUES),
  query('keyword').optional().trim().isLength({ max: 100 }),
  query('category').optional().trim().isLength({ max: 50 }),
  query('my').optional().isIn(['1', '0', 'true', 'false']).withMessage('my는 1 또는 0이어야 합니다.'),
];

export const updateStatusValidator = [
  param('id').isInt({ min: 1 }).withMessage('올바른 게시글 ID가 아닙니다.'),
  body('status')
    .notEmpty()
    .withMessage('status는 필수입니다.')
    .isIn(STATUS_VALUES)
    .withMessage(`status는 ${STATUS_VALUES.join(', ')} 중 하나여야 합니다.`),
];
