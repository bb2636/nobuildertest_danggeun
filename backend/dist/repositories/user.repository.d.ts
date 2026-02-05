import { UserWithPassword } from '../types';
export declare const userRepository: {
    findByEmail(email: string): Promise<UserWithPassword | null>;
    findById(id: number): Promise<UserWithPassword | null>;
    create(data: {
        email: string;
        password: string;
        nickname: string;
        location_name?: string;
        location_code?: string;
    }): Promise<number>;
    update(userId: number, data: {
        nickname?: string;
        location_name?: string | null;
        location_code?: string | null;
        profile_image_url?: string | null;
    }): Promise<boolean>;
};
//# sourceMappingURL=user.repository.d.ts.map