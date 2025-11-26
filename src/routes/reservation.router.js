import { Router } from 'express'
import ReservationController from '../controllers/reservation.controller.js'
import { requireAuth } from '../middlewares/auth.middleware.js'

const reservationRouter = Router()

reservationRouter.get('/mis-reservas', requireAuth, ReservationController.getMyReservations)
reservationRouter.get('/historial', requireAuth, ReservationController.history)
reservationRouter.get('/availability', ReservationController.availabilityByDate)
reservationRouter.get('/calendar', ReservationController.calendar)
reservationRouter.get('/:id', requireAuth, ReservationController.getById)
reservationRouter.post('/', requireAuth, ReservationController.reserve)
reservationRouter.post('/:id/confirm', requireAuth, ReservationController.confirm)
reservationRouter.put('/:id', requireAuth, ReservationController.update)
reservationRouter.delete('/:id', requireAuth, ReservationController.cancel)

export default reservationRouter
