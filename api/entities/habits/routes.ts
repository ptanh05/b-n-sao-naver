import { Router } from 'express';
import * as controller from './controller';

const router = Router();

router.get('/', controller.getHabits);
router.get('/:id', controller.getHabit);
router.post('/', controller.createHabit);
router.put('/:id', controller.updateHabit);
router.delete('/:id', controller.deleteHabit);

export default router;
