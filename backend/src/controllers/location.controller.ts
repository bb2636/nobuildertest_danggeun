import { Request, Response } from 'express';
import { MOCK_LOCATIONS } from '../data/locations.mock';
import { getPublicMessage } from '../utils/errorResponse';

export const locationController = {
  async getList(_req: Request, res: Response): Promise<void> {
    try {
      res.json({ locations: MOCK_LOCATIONS });
    } catch (e) {
      const err = e as Error;
      res.status(500).json({ message: getPublicMessage(err, 500) });
    }
  },
};
