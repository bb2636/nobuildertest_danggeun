/**
 * Mock 동네 목록 (위치 기반 필터링용)
 * 실제 서비스에서는 지도/주소 API 연동
 */
export interface LocationItem {
  code: string;
  name: string;
  fullName?: string;
}

export const MOCK_LOCATIONS: LocationItem[] = [
  { code: '6035', name: '역삼동', fullName: '서울 강남구 역삼동' },
  { code: '6543', name: '송도동', fullName: '인천 연수구 송도동' },
  { code: '6128', name: '서초동', fullName: '서울 서초구 서초동' },
  { code: '355', name: '신림동', fullName: '서울 관악구 신림동' },
  { code: '386', name: '청담동', fullName: '서울 강남구 청담동' },
  { code: '385', name: '압구정동', fullName: '서울 강남구 압구정동' },
  { code: '6052', name: '마곡동', fullName: '서울 강서구 마곡동' },
  { code: '4470', name: '다산동', fullName: '경기 남양주시 다산동' },
  { code: '1604', name: '별내동', fullName: '경기 남양주시 별내동' },
  { code: '2292', name: '불당동', fullName: '충남 천안시 서북구 불당동' },
  { code: '1766', name: '봉담읍', fullName: '경기 화성시 봉담읍' },
  { code: '3662', name: '물금읍', fullName: '경남 양산시 물금읍' },
  { code: '2333', name: '배방읍', fullName: '충남 아산시 배방읍' },
  { code: '4656', name: '옥정동', fullName: '경기 양주시 옥정동' },
  { code: '4245', name: '배곧동', fullName: '경기 시흥시 배곧동' },
];
