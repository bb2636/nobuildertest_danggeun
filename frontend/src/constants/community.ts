/** 동네생활 주제: 대분류 + 하위 주제 목록 (글쓰기 모달용) */
export const COMMUNITY_TOPIC_GROUPS: { label: string; icon: string; topics: string[] }[] = [
  {
    label: '동네정보',
    icon: '🏠',
    topics: ['맛집', '생활/편의', '병원/약국', '이사/시공', '주거/부동산', '교육', '미용'],
  },
  {
    label: '이웃과 함께',
    icon: '👤',
    topics: ['반려동물', '운동', '고민/사면', '동네친구', '취미', '동네풍경', '임신/육아'],
  },
  {
    label: '소식',
    icon: '📢',
    topics: ['동네행사', '분실/실종', '동네사건사고'],
  },
  {
    label: '기타',
    icon: '—',
    topics: ['일반'],
  },
]

/** 주제 전체 목록 (필터 탭·검증용) */
export const COMMUNITY_TOPICS_ALL: string[] = COMMUNITY_TOPIC_GROUPS.flatMap((g) => g.topics)

export const COMMUNITY_TOPIC_FILTER_OPTIONS: { value: '' | string; label: string }[] = [
  { value: '', label: '추천' },
  { value: 'popular', label: '인기' },
  ...COMMUNITY_TOPICS_ALL.map((t) => ({ value: t, label: t })),
]
