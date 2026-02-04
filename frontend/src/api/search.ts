import { api } from './client'

export interface SearchSuggestionsResponse {
  suggestions: string[]
}

export const searchApi = {
  getSuggestions: (q: string, limit?: number) =>
    api.get<SearchSuggestionsResponse>('/api/search/suggestions', {
      params: { q: q.trim(), limit: limit ?? 8 },
    }),
}
