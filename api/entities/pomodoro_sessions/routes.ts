import { Router } from 'express';
import * as controller from './controller';

const router = Router();

router.get('/', controller.getSessions);
router.get('/:id', controller.getSession);
router.post('/', controller.createSession);
router.put('/:id', controller.updateSession);
router.delete('/:id', controller.deleteSession);

export default router;
