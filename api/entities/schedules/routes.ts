import { Router } from 'express';
import * as controller from './controller';

const router = Router();

router.get('/', controller.getSchedules);
router.get('/:id', controller.getSchedule);
router.post('/', controller.createSchedule);
router.put('/:id', controller.updateSchedule);
router.delete('/:id', controller.deleteSchedule);

export default router;
