import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { TaskController } from '../controllers/task.controller'

const router = Router()
const taskController = new TaskController()

router.use(requireAuth)

router.get('/', (req, res) => taskController.getTasks(req, res))
router.post('/', (req, res) => taskController.createTask(req, res))
router.get('/:id', (req, res) => taskController.getTask(req, res))
router.put('/:id', (req, res) => taskController.updateTask(req, res))
router.delete('/:id', (req, res) => taskController.deleteTask(req, res))
router.get('/export', (req, res) => taskController.exportTasks(req, res))
router.post('/import', (req, res) => taskController.importTasks(req, res))

export default router
