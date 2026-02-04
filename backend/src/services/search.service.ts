import { query } from '../config/database';

const MAX_SUGGESTIONS = 8
const TITLE_MAX_LEN = 30

export const searchService = {
  async getSuggestions(q: string, limit = MAX_SUGGESTIONS): Promise<string[]> {
    const term = (q || '').trim()
    if (!term) return []

    const like = `%${term}%`
    const limitNum = Math.min(20, Math.max(1, Number(limit) || MAX_SUGGESTIONS))
    const safeLimit = Math.floor(limitNum)

    const rows = await query<{ title: string }[]>(
      `(SELECT title FROM posts WHERE title LIKE ? LIMIT ${safeLimit})
       UNION ALL
       (SELECT title FROM community_posts WHERE title LIKE ? LIMIT ${safeLimit})`,
      [like, like]
    )

    const seen = new Set<string>()
    const result: string[] = []
    const list = Array.isArray(rows) ? rows : []
    for (const row of list) {
      const title = (row?.title || '').trim()
      if (!title || seen.has(title)) continue
      seen.add(title)
      result.push(title.length > TITLE_MAX_LEN ? title.slice(0, TITLE_MAX_LEN) + '…' : title)
      if (result.length >= limit) break
    }
    return result
  },
}
