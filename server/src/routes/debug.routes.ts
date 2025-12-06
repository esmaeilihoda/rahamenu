import { Router } from 'express';

const router = Router();

// Debug endpoint to show what headers we're receiving
router.get('/debug/headers', (_req, res) => {
  res.json({
    headers: _req.headers,
    query: _req.query,
    path: _req.path,
    method: _req.method,
  });
});

export default router;
