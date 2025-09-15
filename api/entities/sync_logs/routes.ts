import { Router } from 'express';
import * as controller from './controller';

const router = Router();

router.get('/', controller.getLogs);
router.get('/:id', controller.getLog);
router.post('/', controller.createLog);
router.put('/:id', controller.updateLog);
router.delete('/:id', controller.deleteLog);

export default router;
