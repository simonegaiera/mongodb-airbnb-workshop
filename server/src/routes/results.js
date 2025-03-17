import { Router } from 'express';
import { getSectionResults } from '../controllers/getResults.js';

const router = Router();

router.get('/', getSectionResults);

export default router;