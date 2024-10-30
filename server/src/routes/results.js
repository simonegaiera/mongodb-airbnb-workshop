import { Router } from 'express';
import { getSectionResults } from '../services/getResults.js';

const router = Router();

router.get('/', getSectionResults);

export default router;