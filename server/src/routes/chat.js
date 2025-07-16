import { Router } from 'express';
import { getChat, clearChat } from '../controllers/vectorSearchController.js';

const router = Router();

router.post('/', getChat);
router.post('/clear', clearChat);

export default router;