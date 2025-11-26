import Reservation from '../models/Reservation.model.js'

class ReservationRepository {
    static async getConflicts(start_time, end_time, excludeId = null) {
        const query = {
            status: 'confirmed',
            start_time: { $lt: end_time },
            end_time: { $gt: start_time }
        }
        if (excludeId) query._id = { $ne: excludeId }
        return await Reservation.find(query)
    }

    static async createPending(user_id, start_time, end_time) {
        return await Reservation.create({ user_id, start_time, end_time, status: 'pending' })
    }

    static async confirm(id) {
        return await Reservation.findByIdAndUpdate(id, { status: 'confirmed', modified_at: new Date() }, { new: true })
    }

    static async update(id, start_time, end_time) {
        return await Reservation.findByIdAndUpdate(id, { start_time, end_time, modified_at: new Date() }, { new: true })
    }

    static async getById(id) {
        return await Reservation.findById(id)
    }

    static async cancel(id) {
        return await Reservation.findByIdAndUpdate(id, { status: 'cancelled', modified_at: new Date() }, { new: true })
    }

    static async getByUserId(user_id) {
        return await Reservation.find({ user_id, status: { $ne: 'cancelled' } }).sort({ start_time: -1 })
    }

    static async historyByUserId(user_id) {
        return await Reservation.find({ user_id }).sort({ start_time: -1 })
    }
}

export default ReservationRepository
