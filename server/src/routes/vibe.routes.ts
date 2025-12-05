import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { listVibes, createVibe, updateVibe, deleteVibe } from '../controllers/vibe.controller';

const router = Router();
router.use(authenticate);

router.get('/', listVibes);
router.post('/', createVibe);
router.patch('/:id', updateVibe);
router.delete('/:id', deleteVibe);

export default router;
