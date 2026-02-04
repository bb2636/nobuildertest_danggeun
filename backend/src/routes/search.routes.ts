import { Router } from 'express'
import { optionalAuthMiddleware } from '../middleware/auth.middleware'
import { searchController } from '../controllers/search.controller'

const router = Router()

router.get('/suggestions', optionalAuthMiddleware, (req, res) =>
  searchController.getSuggestions(req, res)
)

export default router
