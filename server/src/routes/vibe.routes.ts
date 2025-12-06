import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { listVibes, createVibe, updateVibe, deleteVibe } from '../controllers/vibe.controller';

const router = Router();

// GET vibes is public (customers need this)
router.get('/', listVibes);

// Mutations require authentication
router.use(authenticate);
router.post('/', createVibe);
router.patch('/:id', updateVibe);
router.delete('/:id', deleteVibe);

export default router;
