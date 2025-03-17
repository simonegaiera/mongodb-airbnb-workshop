import { Router } from 'express';
import { getAllItems, getOneItem, getDistinct, getFilters, insertItem, insertReview, updateValue, deleteItem  } from '../controllers/crudController.js';
import { getPriceStatistics } from '../controllers/aggregateController.js';
import { getAutocomplete, getFacet, getSearchItems } from '../controllers/searchController.js';

const router = Router();

router.get('/', getAllItems);
router.post('/', insertItem);
router.delete('/:id', deleteItem);

router.get('/distinct', getDistinct);
router.post('/filter', getFilters);

router.get('/statistics', getPriceStatistics);

router.post('/autocomplete', getAutocomplete);
router.get('/facet', getFacet);
router.post('/search', getSearchItems);

router.post('/:id/reviews', insertReview);
router.get('/:id', getOneItem);
router.patch('/:id', updateValue);

export default router;