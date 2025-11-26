import { Router } from 'express'
import ConversacionController from '../controllers/conversacion.controller.js'
import { requireAuth } from '../middlewares/auth.middleware.js'

const conversacionRouter = Router()

conversacionRouter.get('/', requireAuth, ConversacionController.getAll)
conversacionRouter.get('/:id', requireAuth, ConversacionController.getById)
conversacionRouter.post('/:conversationId/mensajes', requireAuth, ConversacionController.sendMessage)

export default conversacionRouter
