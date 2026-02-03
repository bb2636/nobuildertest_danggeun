import { PostStatus } from '../types';

export interface PostListItemDto {
  id: number;
  title: string;
  price: number | null;
  status: PostStatus;
  category: string | null;
  locationName: string | null;
  imageUrl: string | null;
  createdAt: string;
  viewCount: number;
  userNickname: string;
}

export interface PostListQueryDto {
  page?: number;
  limit?: number;
  locationCode?: string;
  status?: PostStatus;
  keyword?: string;
  category?: string;
  userId?: number;
}

export interface PostListResponseDto {
  posts: PostListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PostDetailDto {
  id: number;
  userId: number;
  userNickname: string;
  title: string;
  content: string | null;
  price: number | null;
  status: PostStatus;
  category: string | null;
  locationName: string | null;
  locationCode: string | null;
  imageUrls: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequestDto {
  title: string;
  content?: string | null;
  price?: number | null;
  status?: PostStatus;
  category?: string | null;
  locationName?: string | null;
  locationCode?: string | null;
  imageUrls?: string[] | null;
}

export interface UpdatePostRequestDto {
  title?: string;
  content?: string | null;
  price?: number | null;
  status?: PostStatus;
  category?: string | null;
  locationName?: string | null;
  locationCode?: string | null;
  imageUrls?: string[] | null;
}
