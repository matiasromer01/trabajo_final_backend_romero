import ReservationRepository from '../repositories/reservation.repository.js'

class CanchaController {
    static async getAvailability(req, res) {
        try {
            const { id } = req.params
            const { date } = req.query
            
            if (!date) {
                return res.status(400).json({ ok: false, message: 'Parámetro date requerido (YYYY-MM-DD)' })
            }

            const [y, m, d] = date.split('-').map(Number)
            const horarios = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
            const ocupados = []

            for (const hora of horarios) {
                const hourNum = parseInt(hora.split(':')[0])
                const start = new Date(y, m - 1, d, hourNum, 0, 0, 0)
                const end = new Date(y, m - 1, d, hourNum + 1, 0, 0, 0)
                
                const conflicts = await ReservationRepository.getConflicts(start, end)
                if (conflicts.length > 0) {
                    ocupados.push(hora)
                }
            }

            return res.json({ ok: true, ocupados })
        } catch (error) {
            console.error('[SERVER ERROR]: getAvailability', error)
            return res.status(500).json({ ok: false, message: 'Error interno del servidor' })
        }
    }

    static async getAll(req, res) {
        try {
            // Por ahora devolvemos una cancha hardcoded
            const canchas = [{
                id: 1,
                nombre: 'Cancha Romero',
                descripcion: 'Cancha de fútbol 5',
                horarios: '18:00 - 23:00',
                active: true
            }]
            return res.json({ ok: true, canchas })
        } catch (error) {
            console.error('[SERVER ERROR]: getAll canchas', error)
            return res.status(500).json({ ok: false, message: 'Error interno del servidor' })
        }
    }
}

export default CanchaController
