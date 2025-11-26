import { Router } from 'express'
import CanchaController from '../controllers/cancha.controller.js'

const canchaRouter = Router()

canchaRouter.get('/', CanchaController.getAll)
canchaRouter.get('/:id/disponibilidad', CanchaController.getAvailability)

export default canchaRouter
