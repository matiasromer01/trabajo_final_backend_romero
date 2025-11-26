import ReservationRepository from '../repositories/reservation.repository.js'

function makeLocalDate(dateStr, hour) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d, hour, 0, 0, 0)
}

function buildSlotsForDate(dateStr) {
    const hours = [18, 19, 20, 21, 22, 23]
    return hours.map(h => ({
        start: makeLocalDate(dateStr, h),
        end: makeLocalDate(dateStr, h + 1),
        hour: h
    }))
}

class ReservationController {
    static async availabilityByDate(req, res) {
        try {
            const { date } = req.query
            if (!date) return res.status(400).json({ ok: false, message: 'Parámetro date requerido (YYYY-MM-DD)', status: 400 })
            const slots = buildSlotsForDate(date)
            const results = []
            for (const s of slots) {
                const conflicts = await ReservationRepository.getConflicts(s.start, s.end)
                results.push({ start_time: s.start, end_time: s.end, hour: s.hour, available: conflicts.length === 0 })
            }
            return res.json({ ok: true, date, slots: results, status: 200 })
        } catch (error) {
            console.error('[SERVER ERROR]: availabilityByDate', error)
            return res.status(500).json({ ok: false, message: 'Error interno del servidor', status: 500 })
        }
    }

    static async calendar(req, res) {
        try {
            const days = Math.min(parseInt(req.query.days || '30', 10), 60)
            const today = new Date()
            const data = []
            for (let i = 0; i < days; i++) {
                const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
                const yyyy = dt.getFullYear()
                const mm = String(dt.getMonth() + 1).padStart(2, '0')
                const dd = String(dt.getDate()).padStart(2, '0')
                const date = `${yyyy}-${mm}-${dd}`
                const slots = buildSlotsForDate(date)
                const out = []
                for (const s of slots) {
                    const conflicts = await ReservationRepository.getConflicts(s.start, s.end)
                    out.push({ start_time: s.start, end_time: s.end, hour: s.hour, available: conflicts.length === 0 })
                }
                data.push({ date, slots: out })
            }
            return res.json({ ok: true, days, calendar: data, status: 200 })
        } catch (error) {
            console.error('[SERVER ERROR]: calendar', error)
            return res.status(500).json({ ok: false, message: 'Error interno del servidor', status: 500 })
        }
    }

    static async reserve(req, res) {
        try {
            const { canchaId, fecha, hora } = req.body
            if (!fecha || !hora) return res.status(400).json({ ok: false, message: 'fecha (YYYY-MM-DD) y hora (HH:00) requeridos' })
            const hourNumber = parseInt(String(hora).split(':')[0])
            if (isNaN(hourNumber) || hourNumber < 18 || hourNumber > 23) return res.status(400).json({ ok: false, message: 'hora debe ser entre 18:00 y 23:00' })

            const [y, m, d] = fecha.split('-').map(Number)
            const start = new Date(y, m - 1, d, hourNumber, 0, 0, 0)
            const end = new Date(y, m - 1, d, hourNumber + 1, 0, 0, 0)

            const conflicts = await ReservationRepository.getConflicts(start, end)
            if (conflicts.length > 0) return res.status(409).json({ ok: false, message: 'Horario no disponible (conflicto con reserva confirmada)' })

            const created = await ReservationRepository.createPending(req.user?.id || null, start, end)
            return res.status(201).json({ ok: true, reservation: created, id: created._id, status: created.status })
        } catch (error) {
            console.error('[SERVER ERROR]: reserve', error)
            return res.status(500).json({ ok: false, message: 'Error interno del servidor' })
        }
    }

    static async cancel(req, res) {
        try {
            const { id } = req.params
            const existing = await ReservationRepository.getById(id)
            if (!existing) return res.status(404).json({ ok: false, message: 'Reserva no encontrada' })
            if (existing.status === 'cancelled') return res.json({ ok: true, reservation: existing })
            const updated = await ReservationRepository.cancel(id)
            return res.json({ ok: true, reservation: updated })
        } catch (error) {
            console.error('[SERVER ERROR]: cancel', error)
            return res.status(500).json({ ok: false, message: 'Error interno del servidor' })
        }
    }

    static async confirm(req, res) {
        try {
            const { id } = req.params
            const existing = await ReservationRepository.getById(id)
            if (!existing) return res.status(404).json({ ok: false, message: 'Reserva no encontrada' })
            if (String(existing.user_id) !== String(req.user?.id)) return res.status(403).json({ ok: false, message: 'Sin autorización' })
            if (existing.status === 'cancelled') return res.status(400).json({ ok: false, message: 'Reserva cancelada' })
            if (existing.status === 'confirmed') return res.json({ ok: true, reservation: existing })

            // race check: ensure no confirmed reservation occupies slot
            const conflicts = await ReservationRepository.getConflicts(existing.start_time, existing.end_time, existing._id)
            if (conflicts.length > 0) return res.status(409).json({ ok: false, message: 'Horario ya confirmado por otro usuario' })

            const updated = await ReservationRepository.confirm(id)
            return res.json({ ok: true, reservation: updated })
        } catch (error) {
            console.error('[SERVER ERROR]: confirm', error)
            return res.status(500).json({ ok: false, message: 'Error interno del servidor' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const { fecha, hora } = req.body
            if (!fecha || !hora) return res.status(400).json({ ok: false, message: 'fecha y hora requeridos' })
            const existing = await ReservationRepository.getById(id)
            if (!existing) return res.status(404).json({ ok: false, message: 'Reserva no encontrada' })
            if (String(existing.user_id) !== String(req.user?.id)) return res.status(403).json({ ok: false, message: 'Sin autorización' })
            if (existing.status !== 'pending') return res.status(400).json({ ok: false, message: 'Solo reservas pendientes pueden modificarse' })

            const hourNumber = parseInt(String(hora).split(':')[0])
            if (isNaN(hourNumber) || hourNumber < 18 || hourNumber > 23) return res.status(400).json({ ok: false, message: 'hora debe ser entre 18:00 y 23:00' })

            const [y, m, d] = fecha.split('-').map(Number)
            const start = new Date(y, m - 1, d, hourNumber, 0, 0, 0)
            const end = new Date(y, m - 1, d, hourNumber + 1, 0, 0, 0)

            const conflicts = await ReservationRepository.getConflicts(start, end, existing._id)
            if (conflicts.length > 0) return res.status(409).json({ ok: false, message: 'Horario no disponible' })

            const updated = await ReservationRepository.update(id, start, end)
            return res.json({ ok: true, reservation: updated })
        } catch (error) {
            console.error('[SERVER ERROR]: update', error)
            return res.status(500).json({ ok: false, message: 'Error interno del servidor' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const existing = await ReservationRepository.getById(id)
            if (!existing) return res.status(404).json({ ok: false, message: 'Reserva no encontrada' })
            if (String(existing.user_id) !== String(req.user?.id)) return res.status(403).json({ ok: false, message: 'Sin autorización' })
            return res.json({ ok: true, reservation: existing })
        } catch (error) {
            console.error('[SERVER ERROR]: getById', error)
            return res.status(500).json({ ok: false, message: 'Error interno del servidor' })
        }
    }

    static async getMyReservations(req, res) {
        try {
            const user_id = req.user?.id
            if (!user_id) return res.status(401).json({ ok: false, message: 'No autenticado' })
            const reservas = await ReservationRepository.getByUserId(user_id)
            return res.json({ ok: true, reservas })
        } catch (error) {
            console.error('[SERVER ERROR]: getMyReservations', error)
            return res.status(500).json({ ok: false, message: 'Error interno del servidor' })
        }
    }

    static async history(req, res) {
        try {
            const user_id = req.user?.id
            if (!user_id) return res.status(401).json({ ok: false, message: 'No autenticado' })
            const reservas = await ReservationRepository.historyByUserId(user_id)
            return res.json({ ok: true, reservas })
        } catch (error) {
            console.error('[SERVER ERROR]: history', error)
            return res.status(500).json({ ok: false, message: 'Error interno del servidor' })
        }
    }
}

export default ReservationController
