export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
  locationName?: string;
  locationCode?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    nickname: string;
    profileImageUrl: string | null;
    locationName: string | null;
    locationCode: string | null;
  };
  accessToken: string;
  expiresIn: string;
}
