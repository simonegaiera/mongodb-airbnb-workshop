import { Router } from 'express';
import { getParticipant, getParticipants, getSectionResults } from '../controllers/getResults.js';

const router = Router();

router.get('/participants', getParticipants);
router.get('/whoami', getParticipant);
router.get('/', getSectionResults);

export default router;