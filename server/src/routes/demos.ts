import { Router, Request, Response } from 'express';
import { getDB } from '../db';

const router = Router();

// GET /api/demos - List all demos (minimal fields)
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const demos = await db
      .collection('demos')
      .find({}, { projection: { slug: 1, businessName: 1, niche: 1, city: 1, _id: 0 } })
      .toArray();

    res.json({ success: true, data: demos });
  } catch (error) {
    console.error('Error fetching demos:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch demos' });
  }
});

// GET /api/demos/:slug - Get single demo by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const db = await getDB();

    const demo = await db.collection('demos').findOne({ slug });

    if (!demo) {
      return res.status(404).json({ success: false, error: 'Demo not found' });
    }

    res.json({ success: true, data: demo });
  } catch (error) {
    console.error('Error fetching demo:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch demo' });
  }
});

export default router;
