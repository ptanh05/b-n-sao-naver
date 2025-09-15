import { Router } from 'express';
import * as controller from './controller';

const router = Router();

router.get('/', controller.getAnalytics);
router.get('/:id', controller.getAnalytic);
router.post('/', controller.createAnalytic);
router.put('/:id', controller.updateAnalytic);
router.delete('/:id', controller.deleteAnalytic);

export default router;
