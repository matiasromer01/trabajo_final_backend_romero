class ConversacionController {
    static async getAll(req, res) {
        try {
            const conversaciones = []
            return res.json(conversaciones)
        } catch (error) {
            console.error('[SERVER ERROR]: getConversations', error)
            return res.status(500).json({ ok: false, message: 'Error interno del servidor' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const conversacion = {
                id: id,
                name: 'Canchas Romero',
                messages: []
            }
            return res.json(conversacion)
        } catch (error) {
            console.error('[SERVER ERROR]: getConversation', error)
            return res.status(500).json({ ok: false, message: 'Error interno del servidor' })
        }
    }

    static async sendMessage(req, res) {
        try {
            const { conversationId } = req.params
            const { content } = req.body
            
            const message = {
                id: Date.now(),
                content,
                sender: req.user?.name || 'Usuario',
                timestamp: new Date().toISOString(),
                created_at: new Date()
            }
            
            return res.status(201).json({ ok: true, message })
        } catch (error) {
            console.error('[SERVER ERROR]: sendMessage', error)
            return res.status(500).json({ ok: false, message: 'Error interno del servidor' })
        }
    }
}

export default ConversacionController
