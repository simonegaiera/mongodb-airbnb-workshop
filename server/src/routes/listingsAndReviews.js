import { Router } from 'express';
import { getAllItems, getOneItem, createItem, deleteItem, insertReview, updateValue } from '../controllers/crudController.js';
import { getPriceStatistics } from '../controllers/aggregateController.js';
import { getAutocomplete, getFacet } from '../controllers/searchController.js';

const router = Router();

router.get('/', getAllItems);
router.post('/', createItem);
router.delete('/', deleteItem);

router.get('/priceStats', getPriceStatistics);

router.post('/autocomplete', getAutocomplete);
router.get('/facet', getFacet);

router.put('/:id/review/', insertReview);
router.get('/:id', getOneItem);
router.patch('/:id', updateValue);

export default router;