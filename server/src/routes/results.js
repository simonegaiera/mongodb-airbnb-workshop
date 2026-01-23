import { Router } from 'express';
import { getParticipant, getParticipants, getSectionResults, getResultsByNameAndUsername } from '../controllers/getResults.js';

const router = Router();

router.get('/participants', getParticipants);
router.get('/whoami', getParticipant);
router.post('/filter', getResultsByNameAndUsername);
router.get('/', getSectionResults);

export default router;
