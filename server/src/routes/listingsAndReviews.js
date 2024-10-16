import { Router } from 'express';
import { getAllItems, getOneItem, createItem, deleteItem, insertReview, updateValue, getDistinct, getFilters } from '../controllers/01-crudController.js';
import { getPriceStatistics } from '../controllers/02-aggregateController.js';
import { getAutocomplete, getFacet, getSearchItems } from '../controllers/03-searchController.js';

const router = Router();

router.get('/', getAllItems);
router.post('/', createItem);
router.delete('/', deleteItem);

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