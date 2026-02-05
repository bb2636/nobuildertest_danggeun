export type PostStatus = 'SALE' | 'RESERVED' | 'SOLD';
export interface User {
    id: number;
    email: string;
    nickname: string;
    profile_image_url: string | null;
    location_name: string | null;
    location_code: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface UserWithPassword extends User {
    password: string;
}
export interface Post {
    id: number;
    user_id: number;
    title: string;
    content: string | null;
    price: number | null;
    status: PostStatus;
    category: string | null;
    location_name: string | null;
    location_code: string | null;
    image_urls: string[] | null;
    view_count: number;
    created_at: Date;
    updated_at: Date;
}
export interface PostRow extends Omit<Post, 'image_urls'> {
    image_urls: string | null;
}
export interface JwtPayload {
    userId: number;
    email: string;
}
//# sourceMappingURL=index.d.ts.map