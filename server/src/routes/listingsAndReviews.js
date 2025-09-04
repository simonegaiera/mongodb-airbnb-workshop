import { Router } from 'express';
import { getAllItems, getOneItem, getDistinct, getFilters, insertItem, insertReview, updateValue, deleteItem  } from '../controllers/crudController.js';
import { getPriceStatistics, getHostAnalytics } from '../controllers/aggregateController.js';
import { getAutocomplete, getFacet, getSearchItems } from '../controllers/searchController.js';
import { getVectorSearch } from '../controllers/vectorSearchController.js';


const router = Router();

router.get('/', getAllItems);
router.post('/', insertItem);
router.delete('/:id', deleteItem);

router.get('/distinct', getDistinct);
router.post('/filter', getFilters);

router.get('/statistics', getPriceStatistics);
router.get('/hostanalytics', getHostAnalytics);

router.post('/autocomplete', getAutocomplete);
router.post('/facet', getFacet);
router.post('/search', getSearchItems);

router.post('/vectorsearch', getVectorSearch);

router.post('/:id/reviews', insertReview);
router.get('/:id', getOneItem);
router.patch('/:id', updateValue);

export default router;
