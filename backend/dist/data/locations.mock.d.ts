/**
 * Mock 동네 목록 (위치 기반 필터링용) — ~동만 포함, ~읍 제외
 * 실제 서비스에서는 지도/주소 API 연동
 */
export interface LocationItem {
    code: string;
    name: string;
    fullName?: string;
}
export declare const MOCK_LOCATIONS: LocationItem[];
//# sourceMappingURL=locations.mock.d.ts.map