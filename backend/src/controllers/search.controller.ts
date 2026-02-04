import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { searchService } from '../services/search.service'
import { getPublicMessage } from '../utils/errorResponse'
import { logger } from '../utils/logger'

export const searchController = {
  async getSuggestions(req: AuthRequest, res: Response): Promise<void> {
    const q = (req.query.q as string)?.trim() ?? ''
    const limit = req.query.limit ? Math.min(20, Math.max(1, Number(req.query.limit))) : undefined
    try {
      const suggestions = await searchService.getSuggestions(q, limit)
      res.json({ suggestions })
    } catch (e) {
      const err = e as Error
      logger.error('search.getSuggestions', err)
      res.status(500).json({ message: getPublicMessage(err, 500) })
    }
  },
}
