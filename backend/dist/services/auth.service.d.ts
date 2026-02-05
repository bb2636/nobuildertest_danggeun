import { AuthResponse } from '../dto/auth.dto';
export declare const authService: {
    signUp(params: {
        email: string;
        password: string;
        nickname: string;
        locationName?: string;
        locationCode?: string;
    }): Promise<AuthResponse>;
    login(email: string, password: string): Promise<AuthResponse>;
    getMe(userId: number): Promise<AuthResponse["user"] | null>;
    updateProfile(userId: number, data: {
        nickname?: string;
        locationName?: string | null;
        locationCode?: string | null;
        profileImageUrl?: string | null;
    }): Promise<AuthResponse["user"] | null>;
};
//# sourceMappingURL=auth.service.d.ts.map